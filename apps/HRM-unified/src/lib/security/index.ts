// src/lib/security/index.ts
// Security utilities barrel export

export * from './rate-limiter'
export * from './validation'
export * from './headers'
export * from './audit'
export * from './csrf'

// ═══════════════════════════════════════════════════════════════
// API ROUTE WRAPPER WITH SECURITY
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { ZodSchema } from 'zod'
import { rateLimiter, RATE_LIMITS, getClientIP, getRateLimitKey } from './rate-limiter'
import { applySecurityHeaders, handlePreflight } from './headers'
import { rateLimitResponse, handleApiError } from '@/lib/api/response'

type RateLimitType = keyof typeof RATE_LIMITS

interface SecureApiOptions<T> {
  rateLimit?: RateLimitType
  schema?: ZodSchema<T>
}

type ApiHandler<T> = (
  request: NextRequest,
  context: {
    params: Record<string, string>
    validatedBody?: T
    userId?: string
  }
) => Promise<NextResponse>

/**
 * Wrap an API handler with security features
 */
export function secureApi<T = unknown>(
  handler: ApiHandler<T>,
  options: SecureApiOptions<T> = {}
) {
  return async (
    request: NextRequest,
    context: { params: Record<string, string> }
  ): Promise<NextResponse> => {
    // Handle preflight
    if (request.method === 'OPTIONS') {
      return handlePreflight()
    }

    try {
      // Rate limiting
      if (options.rateLimit) {
        const ip = getClientIP(request)
        const endpoint = request.nextUrl.pathname
        const key = getRateLimitKey(ip, endpoint)
        const limitConfig = RATE_LIMITS[options.rateLimit]

        // Handle nested rate limit configs (e.g., auth.login)
        const limit = 'limit' in limitConfig ? limitConfig : null
        if (limit) {
          const result = await rateLimiter.checkLimit(key, limit.maxRequests, limit.windowMs)

          if (!result.success) {
            return rateLimitResponse(result.retryAfter)
          }
        }
      }

      // Body validation
      let validatedBody: T | undefined
      if (options.schema && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        const body = await request.json()
        validatedBody = options.schema.parse(body)
      }

      // Execute handler
      const response = await handler(request, {
        ...context,
        validatedBody,
      })

      // Apply security headers
      return applySecurityHeaders(response)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// AUTHENTICATED API WRAPPER
// ═══════════════════════════════════════════════════════════════

import { auth } from '@/lib/auth'

type AuthenticatedApiHandler<T> = (
  request: NextRequest,
  context: {
    params: Record<string, string>
    validatedBody?: T
    userId: string
    user: { id: string; email: string; role: string }
  }
) => Promise<NextResponse>

/**
 * Wrap an API handler that requires authentication
 */
export function secureAuthenticatedApi<T = unknown>(
  handler: AuthenticatedApiHandler<T>,
  options: SecureApiOptions<T> & { requiredRole?: string } = {}
) {
  return async (
    request: NextRequest,
    context: { params: Record<string, string> }
  ): Promise<NextResponse> => {
    // Handle preflight
    if (request.method === 'OPTIONS') {
      return handlePreflight()
    }

    try {
      // Check authentication
      const session = await auth()

      if (!session?.user) {
        return applySecurityHeaders(
          NextResponse.json(
            { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
            { status: 401 }
          )
        )
      }

      // Check role if required
      if (options.requiredRole && session.user.role !== options.requiredRole) {
        return applySecurityHeaders(
          NextResponse.json(
            { success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } },
            { status: 403 }
          )
        )
      }

      const userId = session.user.id as string

      // Rate limiting (per-user)
      if (options.rateLimit) {
        const endpoint = request.nextUrl.pathname
        const key = getRateLimitKey('', endpoint, userId)
        const limitConfig = RATE_LIMITS[options.rateLimit]

        // Handle nested rate limit configs (e.g., auth.login)
        const limit = 'limit' in limitConfig ? limitConfig : null
        if (limit) {
          const result = await rateLimiter.checkLimit(key, limit.maxRequests, limit.windowMs)

          if (!result.success) {
            return rateLimitResponse(result.retryAfter)
          }
        }
      }

      // Body validation
      let validatedBody: T | undefined
      if (options.schema && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        const body = await request.json()
        validatedBody = options.schema.parse(body)
      }

      // Execute handler
      const response = await handler(request, {
        ...context,
        validatedBody,
        userId,
        user: {
          id: userId,
          email: session.user.email as string,
          role: session.user.role as string,
        },
      })

      // Apply security headers
      return applySecurityHeaders(response)
    } catch (error) {
      return handleApiError(error)
    }
  }
}
