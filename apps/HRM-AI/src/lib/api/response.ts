// src/lib/api/response.ts
// API response utilities with caching and error handling

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

// ═══════════════════════════════════════════════════════════════
// RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

export interface CacheOptions {
  maxAge?: number // seconds
  staleWhileRevalidate?: number // seconds
  isPrivate?: boolean
}

// ═══════════════════════════════════════════════════════════════
// CACHE HEADERS
// ═══════════════════════════════════════════════════════════════

function getCacheHeaders(options: CacheOptions): HeadersInit {
  const { maxAge = 0, staleWhileRevalidate = 0, isPrivate = true } = options

  if (maxAge === 0) {
    return {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    }
  }

  const directives = [
    isPrivate ? 'private' : 'public',
    `max-age=${maxAge}`,
  ]

  if (staleWhileRevalidate > 0) {
    directives.push(`stale-while-revalidate=${staleWhileRevalidate}`)
  }

  return {
    'Cache-Control': directives.join(', '),
  }
}

// ═══════════════════════════════════════════════════════════════
// SUCCESS RESPONSES
// ═══════════════════════════════════════════════════════════════

export function successResponse<T>(
  data: T,
  options?: {
    status?: number
    cache?: CacheOptions
    meta?: ApiResponse['meta']
  }
): NextResponse<ApiResponse<T>> {
  const { status = 200, cache, meta } = options ?? {}

  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(meta && { meta }),
  }

  return NextResponse.json(response, {
    status,
    headers: cache ? getCacheHeaders(cache) : undefined,
  })
}

export function createdResponse<T>(data: T): NextResponse<ApiResponse<T>> {
  return successResponse(data, { status: 201 })
}

export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 })
}

// ═══════════════════════════════════════════════════════════════
// ERROR RESPONSES
// ═══════════════════════════════════════════════════════════════

export function errorResponse(
  code: string,
  message: string,
  status: number = 500,
  details?: unknown
): NextResponse<ApiResponse> {
  const error: ApiResponse['error'] = {
    code,
    message,
  }

  if (details !== undefined) {
    error.details = details
  }

  const response: ApiResponse = {
    success: false,
    error,
  }

  return NextResponse.json(response, { status })
}

export function badRequestResponse(
  message: string = 'Invalid request',
  details?: unknown
): NextResponse<ApiResponse> {
  return errorResponse('BAD_REQUEST', message, 400, details)
}

export function unauthorizedResponse(
  message: string = 'Authentication required'
): NextResponse<ApiResponse> {
  return errorResponse('UNAUTHORIZED', message, 401)
}

export function forbiddenResponse(
  message: string = 'Access denied'
): NextResponse<ApiResponse> {
  return errorResponse('FORBIDDEN', message, 403)
}

export function notFoundResponse(
  resource: string = 'Resource'
): NextResponse<ApiResponse> {
  return errorResponse('NOT_FOUND', `${resource} not found`, 404)
}

export function conflictResponse(
  message: string = 'Resource already exists'
): NextResponse<ApiResponse> {
  return errorResponse('CONFLICT', message, 409)
}

export function rateLimitResponse(
  retryAfter?: number
): NextResponse<ApiResponse> {
  const headers: HeadersInit = {}
  if (retryAfter) {
    headers['Retry-After'] = String(retryAfter)
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please try again later.',
      },
    } as ApiResponse,
    { status: 429, headers }
  )
}

export function serverErrorResponse(
  message: string = 'Internal server error'
): NextResponse<ApiResponse> {
  return errorResponse('SERVER_ERROR', message, 500)
}

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLER
// ═══════════════════════════════════════════════════════════════

export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error('API Error:', error)

  // Zod validation error
  if (error instanceof ZodError) {
    return badRequestResponse('Validation failed', error.issues)
  }

  // Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: unknown }

    switch (prismaError.code) {
      case 'P2002':
        return conflictResponse('A record with this value already exists')
      case 'P2025':
        return notFoundResponse('Record')
      case 'P2003':
        return badRequestResponse('Referenced record does not exist')
    }
  }

  // Standard Error
  if (error instanceof Error) {
    // Don't expose internal error messages in production
    const message =
      process.env.NODE_ENV === 'development'
        ? error.message
        : 'An unexpected error occurred'

    return serverErrorResponse(message)
  }

  return serverErrorResponse()
}

// ═══════════════════════════════════════════════════════════════
// PAGINATED RESPONSE
// ═══════════════════════════════════════════════════════════════

export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number
    limit: number
    total: number
  },
  cache?: CacheOptions
): NextResponse<ApiResponse<T[]>> {
  const totalPages = Math.ceil(pagination.total / pagination.limit)

  return successResponse(data, {
    cache,
    meta: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages,
    },
  })
}
