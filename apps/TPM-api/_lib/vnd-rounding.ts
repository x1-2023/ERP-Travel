/**
 * Sprint 1 Fix 12: VND Rounding Rules
 * Handles penny-loss prevention for VND (no sub-unit currency).
 */

import { Decimal } from '@prisma/client/runtime/library';

/**
 * Round to nearest VND (integer).
 * Uses banker's rounding (round half to even) for fairness.
 */
export function roundVND(amount: Decimal | number | string): Decimal {
  return new Decimal(amount).toDecimalPlaces(0, Decimal.ROUND_HALF_EVEN);
}

/**
 * Split amount into n equal parts, handling VND remainder.
 * Last part gets the remainder to ensure total matches exactly.
 *
 * Example: splitVND(1000000, 3) → [333333, 333333, 333334]
 */
export function splitVND(
  totalAmount: Decimal | number | string,
  parts: number
): Decimal[] {
  const total = new Decimal(totalAmount);
  const basePart = total.dividedBy(parts).floor();
  const remainder = total.minus(basePart.times(parts));

  const result: Decimal[] = [];

  for (let i = 0; i < parts; i++) {
    if (i === parts - 1) {
      // Last part gets remainder
      result.push(basePart.plus(remainder));
    } else {
      result.push(basePart);
    }
  }

  return result;
}

/**
 * Allocate amount proportionally by percentages with remainder handling.
 * Ensures sum of allocated parts equals the original total exactly.
 *
 * Example: allocateVND(1000000, [30, 30, 40]) → [300000, 300000, 400000]
 */
export function allocateVND(
  totalAmount: Decimal | number | string,
  percentages: number[]
): Decimal[] {
  const total = new Decimal(totalAmount);
  const result: Decimal[] = [];
  let allocated = new Decimal(0);

  for (let i = 0; i < percentages.length; i++) {
    if (i === percentages.length - 1) {
      // Last item gets remainder to ensure exact total
      result.push(total.minus(allocated));
    } else {
      const part = roundVND(total.times(percentages[i]).dividedBy(100));
      result.push(part);
      allocated = allocated.plus(part);
    }
  }

  return result;
}

/**
 * Validate that split/allocated parts sum to the original amount.
 */
export function validateSplitTotal(
  original: Decimal | number,
  parts: Decimal[]
): boolean {
  const sum = parts.reduce((acc, p) => acc.plus(p), new Decimal(0));
  return sum.equals(new Decimal(original));
}
