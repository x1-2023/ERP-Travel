/**
 * Sprint 1 Fix 4: Backend Input Length Validation
 * Prevents 1MB text in fields, DB bloat, and DoS via large payloads.
 */

// ============================================================================
// FIELD LENGTH LIMITS
// ============================================================================

export const FIELD_LIMITS = {
  code: 50,
  name: 200,
  title: 200,
  description: 2000,
  notes: 2000,
  address: 500,
  richContent: 50000,
  maxArrayItems: 100,
  maxJsonSize: 100000, // 100KB
} as const;

// ============================================================================
// VALIDATION TYPES & HELPERS
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
  limit?: number;
  actual?: number;
}

export function validateStringLength(
  value: unknown,
  field: string,
  maxLength: number
): ValidationError | null {
  if (typeof value !== 'string') return null;

  if (value.length > maxLength) {
    return {
      field,
      message: `${field} exceeds maximum length of ${maxLength} characters`,
      limit: maxLength,
      actual: value.length,
    };
  }

  return null;
}

export function validateRequestBody(
  body: Record<string, unknown>,
  schema: Record<string, number>
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const [field, maxLength] of Object.entries(schema)) {
    const error = validateStringLength(body[field], field, maxLength);
    if (error) errors.push(error);
  }

  return errors;
}

// ============================================================================
// ENTITY VALIDATION SCHEMAS
// ============================================================================

export const PROMOTION_SCHEMA = {
  code: FIELD_LIMITS.code,
  name: FIELD_LIMITS.name,
  description: FIELD_LIMITS.description,
};

export const CLAIM_SCHEMA = {
  code: FIELD_LIMITS.code,
  description: FIELD_LIMITS.description,
  notes: FIELD_LIMITS.notes,
};

export const CUSTOMER_SCHEMA = {
  code: FIELD_LIMITS.code,
  name: FIELD_LIMITS.name,
  address: FIELD_LIMITS.address,
  notes: FIELD_LIMITS.notes,
};

export const BUDGET_SCHEMA = {
  code: FIELD_LIMITS.code,
  name: FIELD_LIMITS.name,
  description: FIELD_LIMITS.description,
  category: FIELD_LIMITS.name,
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

export function validatePromotion(body: Record<string, unknown>): ValidationError[] {
  return validateRequestBody(body, PROMOTION_SCHEMA);
}

export function validateClaim(body: Record<string, unknown>): ValidationError[] {
  return validateRequestBody(body, CLAIM_SCHEMA);
}

export function validateCustomer(body: Record<string, unknown>): ValidationError[] {
  return validateRequestBody(body, CUSTOMER_SCHEMA);
}

export function validateBudget(body: Record<string, unknown>): ValidationError[] {
  return validateRequestBody(body, BUDGET_SCHEMA);
}

// ============================================================================
// VALIDATE BODY MIDDLEWARE
// ============================================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';

type Validator = (body: Record<string, unknown>) => ValidationError[];

export function validateBody(validator: Validator) {
  return function <T extends (req: VercelRequest, res: VercelResponse) => Promise<void | VercelResponse>>(handler: T): T {
    return (async (req: VercelRequest, res: VercelResponse) => {
      if (['POST', 'PUT', 'PATCH'].includes(req.method || '')) {
        const errors = validator(req.body || {});

        if (errors.length > 0) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Request body validation failed',
              details: errors,
            },
          });
        }
      }

      return handler(req, res);
    }) as T;
  };
}
