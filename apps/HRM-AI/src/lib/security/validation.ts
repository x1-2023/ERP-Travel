// src/lib/security/validation.ts
// Input validation and sanitization utilities

import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════
// COMMON VALIDATION SCHEMAS
// ═══════════════════════════════════════════════════════════════

// UUID validation
export const uuidSchema = z.string().uuid('Invalid ID format')

// Email validation
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .max(255, 'Email too long')
  .toLowerCase()
  .trim()

// Phone validation (Vietnam format)
export const phoneSchema = z
  .string()
  .regex(/^(\+84|84|0)?[1-9]\d{8,9}$/, 'Invalid phone number')
  .optional()

// Password validation
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

// Safe string (no HTML/script tags)
export const safeStringSchema = z
  .string()
  .transform((val) => sanitizeString(val))

// Name validation
export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name too long')
  .regex(/^[a-zA-ZÀ-ỹ\s'-]+$/, 'Name contains invalid characters')
  .transform((val) => val.trim())

// Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

// Date range
export const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.startDate <= data.endDate
    }
    return true
  },
  { message: 'Start date must be before end date' }
)

// ═══════════════════════════════════════════════════════════════
// SANITIZATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Remove potentially dangerous HTML/script content
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
}

/**
 * Sanitize object keys and values recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value)
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>)
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'string'
          ? sanitizeString(item)
          : item && typeof item === 'object'
          ? sanitizeObject(item as Record<string, unknown>)
          : item
      )
    } else {
      sanitized[key] = value
    }
  }

  return sanitized as T
}

/**
 * Escape string for SQL LIKE queries (prevent SQL wildcards injection)
 */
export function escapeLikeString(str: string): string {
  return str.replace(/[%_\\]/g, '\\$&')
}

// ═══════════════════════════════════════════════════════════════
// VALIDATION HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Validate request body against a schema
 */
export async function validateBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<T> {
  const body = await request.json()
  return schema.parse(body)
}

/**
 * Validate search params against a schema
 */
export function validateSearchParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): T {
  const params = Object.fromEntries(searchParams.entries())
  return schema.parse(params)
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(
  json: string,
  fallback: T
): T {
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}

// ═══════════════════════════════════════════════════════════════
// SPECIALIZED VALIDATORS
// ═══════════════════════════════════════════════════════════════

// Employee code (format: EMP-XXXX or custom)
export const employeeCodeSchema = z
  .string()
  .min(1, 'Employee code is required')
  .max(20, 'Employee code too long')
  .regex(/^[A-Z0-9-]+$/i, 'Invalid employee code format')
  .transform((val) => val.toUpperCase())

// Currency amount
export const currencySchema = z
  .number()
  .nonnegative('Amount cannot be negative')
  .multipleOf(0.01, 'Amount must have at most 2 decimal places')

// Percentage (0-100)
export const percentageSchema = z
  .number()
  .min(0, 'Percentage cannot be negative')
  .max(100, 'Percentage cannot exceed 100')

// File upload validation
export const fileUploadSchema = z.object({
  name: z.string().max(255),
  size: z.number().max(10 * 1024 * 1024, 'File too large (max 10MB)'),
  type: z.string().regex(/^(image|application)\/(jpeg|png|gif|pdf|msword|vnd\.openxmlformats)/, 'Invalid file type'),
})
