/**
 * Sprint 1 Fix 5: API Error Response Standardization
 * All API responses follow: { success: boolean, data?, error?: { code, message, details? } }
 */

import type { VercelResponse } from '@vercel/node';

// ============================================================================
// STANDARD RESPONSE TYPES
// ============================================================================

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// ============================================================================
// ERROR CODES
// ============================================================================

export const ErrorCodes = {
  // Auth (401)
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_REVOKED: 'TOKEN_REVOKED',

  // Permission (403)
  FORBIDDEN: 'FORBIDDEN',
  SOX_VIOLATION: 'SOX_VIOLATION',

  // Not found (404)
  NOT_FOUND: 'NOT_FOUND',

  // Validation (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_VERSION: 'MISSING_VERSION',
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',

  // Conflict (409)
  CONFLICT: 'CONFLICT',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',

  // Business logic (422)
  INSUFFICIENT_FUND: 'INSUFFICIENT_FUND',
  FISCAL_PERIOD_CLOSED: 'FISCAL_PERIOD_CLOSED',
  SETTLEMENT_EXCEEDS_CLAIM: 'SETTLEMENT_EXCEEDS_CLAIM',
  JOURNAL_NOT_BALANCED: 'JOURNAL_NOT_BALANCED',

  // Rate limit (429)
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Server (500)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

// ============================================================================
// RESPONSE HELPERS
// ============================================================================

export function success<T>(res: VercelResponse, data: T, statusCode = 200): void {
  res.status(statusCode).json({ success: true, data } as ApiSuccessResponse<T>);
}

export function successWithPagination<T>(
  res: VercelResponse,
  data: T[],
  pagination: { page: number; limit: number; total: number }
): void {
  res.status(200).json({
    success: true,
    data,
    pagination: {
      ...pagination,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
  } as ApiSuccessResponse<T[]>);
}

export function apiError(
  res: VercelResponse,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown
): void {
  res.status(statusCode).json({
    success: false,
    error: { code, message, details },
  } as ApiErrorResponse);
}

// ============================================================================
// CONVENIENCE ERROR METHODS
// ============================================================================

export const errors = {
  unauthorized: (res: VercelResponse, message = 'Unauthorized') =>
    apiError(res, 401, ErrorCodes.UNAUTHORIZED, message),

  forbidden: (res: VercelResponse, message = 'Forbidden') =>
    apiError(res, 403, ErrorCodes.FORBIDDEN, message),

  notFound: (res: VercelResponse, entity = 'Resource') =>
    apiError(res, 404, ErrorCodes.NOT_FOUND, `${entity} not found`),

  validation: (res: VercelResponse, details: unknown) =>
    apiError(res, 400, ErrorCodes.VALIDATION_ERROR, 'Validation failed', details),

  conflict: (res: VercelResponse, message: string, details?: unknown) =>
    apiError(res, 409, ErrorCodes.CONFLICT, message, details),

  businessRule: (res: VercelResponse, code: string, message: string, details?: unknown) =>
    apiError(res, 422, code, message, details),

  internal: (res: VercelResponse, err?: Error) => {
    if (err) console.error('Internal error:', err);
    apiError(res, 500, ErrorCodes.INTERNAL_ERROR, 'Internal server error');
  },
};
