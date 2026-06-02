/**
 * Sprint 1 Fix 9: Safe Decimal Handling (no parseFloat precision loss)
 * Uses Prisma's built-in Decimal type for safe arithmetic.
 */

import { Decimal } from '@prisma/client/runtime/library';

/**
 * Parse amount from request body safely.
 * Handles string, number, and Decimal inputs.
 */
export function parseAmount(value: unknown): Decimal {
  if (value === null || value === undefined) {
    return new Decimal(0);
  }

  if (value instanceof Decimal) {
    return value;
  }

  if (typeof value === 'number') {
    return new Decimal(value);
  }

  if (typeof value === 'string') {
    // Remove VND formatting: 1.500.000 → 1500000
    const cleaned = value.replace(/\./g, '').replace(/,/g, '.');
    return new Decimal(cleaned);
  }

  throw new Error(`Cannot parse amount from: ${typeof value}`);
}

/**
 * Format for database storage (Prisma Decimal accepts string).
 */
export function toDbDecimal(value: Decimal | number | string): string {
  return new Decimal(value).toFixed(2);
}

/**
 * Format for API response (as number).
 */
export function toApiNumber(value: Decimal | number | string): number {
  return new Decimal(value).toNumber();
}

/**
 * Format for VND display.
 */
export function formatVND(value: Decimal | number | string): string {
  const num = new Decimal(value).toNumber();
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * VND Rounding - round to nearest VND (integer).
 */
export function roundVND(value: Decimal | number | string): Decimal {
  return new Decimal(value).toDecimalPlaces(0, Decimal.ROUND_HALF_UP);
}

/**
 * Safe division with zero check.
 */
export function safeDivide(
  numerator: Decimal | number,
  denominator: Decimal | number,
  defaultValue: Decimal | number = 0
): Decimal {
  const den = new Decimal(denominator);
  if (den.isZero()) {
    return new Decimal(defaultValue);
  }
  return new Decimal(numerator).dividedBy(den);
}

/**
 * Calculate percentage.
 */
export function percentage(
  value: Decimal | number,
  total: Decimal | number
): Decimal {
  return safeDivide(value, total).times(100);
}
