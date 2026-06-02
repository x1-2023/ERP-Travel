// src/lib/monitoring/errors.ts
// Error tracking and reporting utilities

import { logger } from './logger'

// ═══════════════════════════════════════════════════════════════
// CUSTOM ERROR CLASSES
// ═══════════════════════════════════════════════════════════════

export class AppError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly context?: Record<string, unknown>

  constructor(
    message: string,
    options: {
      code: string
      statusCode?: number
      isOperational?: boolean
      context?: Record<string, unknown>
    }
  ) {
    super(message)
    this.name = 'AppError'
    this.code = options.code
    this.statusCode = options.statusCode ?? 500
    this.isOperational = options.isOperational ?? true
    this.context = options.context

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, {
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      isOperational: true,
      context,
    })
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, {
      code: 'AUTHENTICATION_ERROR',
      statusCode: 401,
      isOperational: true,
    })
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, {
      code: 'AUTHORIZATION_ERROR',
      statusCode: 403,
      isOperational: true,
    })
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, {
      code: 'NOT_FOUND',
      statusCode: 404,
      isOperational: true,
    })
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, {
      code: 'CONFLICT',
      statusCode: 409,
      isOperational: true,
    })
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends AppError {
  public readonly retryAfter: number

  constructor(retryAfter: number = 60) {
    super('Too many requests', {
      code: 'RATE_LIMITED',
      statusCode: 429,
      isOperational: true,
    })
    this.name = 'RateLimitError'
    this.retryAfter = retryAfter
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, originalError?: Error) {
    super(`External service error: ${service}`, {
      code: 'EXTERNAL_SERVICE_ERROR',
      statusCode: 502,
      isOperational: true,
      context: {
        service,
        originalError: originalError?.message,
      },
    })
    this.name = 'ExternalServiceError'
  }
}

// ═══════════════════════════════════════════════════════════════
// ERROR TRACKER
// ═══════════════════════════════════════════════════════════════

interface ErrorContext {
  userId?: string
  requestId?: string
  path?: string
  method?: string
  userAgent?: string
  ip?: string
  additionalData?: Record<string, unknown>
}

class ErrorTracker {
  private errors: Array<{
    timestamp: Date
    error: Error
    context?: ErrorContext
  }> = []

  private maxStoredErrors = 100

  /**
   * Track an error
   */
  capture(error: Error, context?: ErrorContext): void {
    // Log the error
    logger.error(error.message, {
      context: 'ErrorTracker',
      error,
      data: context as Record<string, unknown>,
    })

    // Store error for analysis
    this.errors.push({
      timestamp: new Date(),
      error,
      context,
    })

    // Keep only recent errors
    if (this.errors.length > this.maxStoredErrors) {
      this.errors = this.errors.slice(-this.maxStoredErrors)
    }

    // In production, send to error tracking service
    // this.sendToExternalService(error, context)
  }

  /**
   * Get recent errors (for debugging)
   */
  getRecent(count: number = 10): Array<{ timestamp: Date; message: string; code?: string }> {
    return this.errors.slice(-count).map((e) => ({
      timestamp: e.timestamp,
      message: e.error.message,
      code: e.error instanceof AppError ? e.error.code : undefined,
    }))
  }

  /**
   * Get error statistics
   */
  getStats(): {
    total: number
    byType: Record<string, number>
    last24h: number
  } {
    const now = Date.now()
    const dayAgo = now - 24 * 60 * 60 * 1000

    const byType: Record<string, number> = {}
    let last24h = 0

    for (const entry of this.errors) {
      const type = entry.error.name || 'Unknown'
      byType[type] = (byType[type] || 0) + 1

      if (entry.timestamp.getTime() > dayAgo) {
        last24h++
      }
    }

    return {
      total: this.errors.length,
      byType,
      last24h,
    }
  }

  /**
   * Clear stored errors
   */
  clear(): void {
    this.errors = []
  }
}

// Singleton instance
export const errorTracker = new ErrorTracker()

// ═══════════════════════════════════════════════════════════════
// GLOBAL ERROR HANDLER
// ═══════════════════════════════════════════════════════════════

export function setupGlobalErrorHandlers(): void {
  if (typeof process !== 'undefined') {
    process.on('uncaughtException', (error: Error) => {
      errorTracker.capture(error, { additionalData: { type: 'uncaughtException' } })
      logger.error('Uncaught exception', { error })
      // Give time for logging before exit
      setTimeout(() => process.exit(1), 1000)
    })

    process.on('unhandledRejection', (reason: unknown) => {
      const error = reason instanceof Error ? reason : new Error(String(reason))
      errorTracker.capture(error, { additionalData: { type: 'unhandledRejection' } })
      logger.error('Unhandled rejection', { error })
    })
  }
}
