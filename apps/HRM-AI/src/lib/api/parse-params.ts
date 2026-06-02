// src/lib/api/parse-params.ts
// Safe query parameter parsing utilities to prevent NaN propagation

/**
 * Safely parse an integer from a query parameter string.
 * Returns the fallback value if the input is null, undefined, empty, or not a valid integer.
 */
export function safeParseInt(value: string | null | undefined, fallback: number): number {
  if (value == null || value === '') return fallback
  const parsed = parseInt(value, 10)
  return Number.isNaN(parsed) ? fallback : parsed
}

/**
 * Safely parse an optional integer from a query parameter string.
 * Returns undefined if the input is null, undefined, or empty.
 * Returns undefined if the input is not a valid integer.
 */
export function safeParseIntOptional(value: string | null | undefined): number | undefined {
  if (value == null || value === '') return undefined
  const parsed = parseInt(value, 10)
  return Number.isNaN(parsed) ? undefined : parsed
}

/**
 * Parse standard pagination params with safe defaults.
 */
export function parsePagination(searchParams: URLSearchParams, defaults?: { page?: number; pageSize?: number }) {
  const page = safeParseInt(searchParams.get('page'), defaults?.page ?? 1)
  const pageSize = safeParseInt(searchParams.get('pageSize'), defaults?.pageSize ?? 20)
  return {
    page: Math.max(1, page),
    pageSize: Math.min(Math.max(1, pageSize), 100), // Cap at 100
  }
}
