/**
 * VAT (Value Added Tax) Calculation Module
 * Nghị định 44/2023/NĐ-CP - Current Vietnamese VAT regulations
 */

import { VATRate } from "../types/index.js";

/**
 * Calculate VAT amount from a base amount
 * @param amount - Base amount in VNĐ (before VAT)
 * @param rate - VAT rate enum
 * @returns VAT amount in VNĐ (rounded to nearest integer)
 */
export function calculateVAT(amount: number, rate: VATRate): number {
  if (amount < 0) {
    throw new Error("Amount must be non-negative");
  }

  const vatAmount = Math.round((amount * rate) / 100);
  return vatAmount;
}

/**
 * Calculate total amount including VAT
 * @param amount - Base amount in VNĐ
 * @param rate - VAT rate enum
 * @returns Total amount (base + VAT)
 */
export function calculateAmountWithVAT(amount: number, rate: VATRate): number {
  if (amount < 0) {
    throw new Error("Amount must be non-negative");
  }

  return amount + calculateVAT(amount, rate);
}

/**
 * Reverse calculate base amount from total (includes VAT)
 * @param total - Total amount including VAT
 * @param rate - VAT rate enum
 * @returns Base amount before VAT
 */
export function calculateBaseAmountFromTotal(
  total: number,
  rate: VATRate
): number {
  if (total < 0) {
    throw new Error("Total must be non-negative");
  }

  if (rate === VATRate.ZERO) {
    return total;
  }

  const baseAmount = Math.round((total * 100) / (100 + rate));
  return baseAmount;
}

/**
 * Product/Service Category to VAT Rate Mapping
 * Based on Nghị định 44/2023/NĐ-CP
 */
interface VATCategoryMap {
  [category: string]: VATRate;
}

const VAT_CATEGORY_MAP: VATCategoryMap = {
  // Standard rate 10%
  GENERAL: VATRate.STANDARD,
  RETAIL: VATRate.STANDARD,
  WHOLESALE: VATRate.STANDARD,
  MANUFACTURING: VATRate.STANDARD,
  SERVICES: VATRate.STANDARD,
  TOURISM: VATRate.STANDARD,
  ENTERTAINMENT: VATRate.STANDARD,
  RESTAURANT: VATRate.STANDARD,
  HOTEL: VATRate.STANDARD,

  // Reduced rate 5%
  AGRICULTURAL_PRODUCTS: VATRate.REDUCED,
  FOOD_PRODUCTS: VATRate.REDUCED,
  MEDICINE: VATRate.REDUCED,
  ANIMAL_FEED: VATRate.REDUCED,
  FERTILIZER: VATRate.REDUCED,
  SEEDS: VATRate.REDUCED,

  // Special rate 8% - Nghị định 44/2023/NĐ-CP
  COAL: VATRate.SPECIAL,
  CIGARETTES: VATRate.SPECIAL,
  BEER: VATRate.SPECIAL,
  SPIRITS: VATRate.SPECIAL,

  // Exemptions (0%)
  EDUCATION: VATRate.ZERO,
  HEALTHCARE: VATRate.ZERO,
  FINANCIAL_SERVICES: VATRate.ZERO,
  INSURANCE: VATRate.ZERO,
  EXPORT: VATRate.ZERO,
};

/**
 * Look up VAT rate by product/service category
 * @param category - Product/service category
 * @returns VAT rate enum, defaults to STANDARD (10%)
 */
export function vatRateForCategory(category: string): VATRate {
  const upperCategory = category.toUpperCase();
  return VAT_CATEGORY_MAP[upperCategory] ?? VATRate.STANDARD;
}

/**
 * Check if a category is VAT exempt
 * @param category - Product/service category
 * @returns True if VAT exempt
 */
export function isVATExempt(category: string): boolean {
  return vatRateForCategory(category) === VATRate.ZERO;
}

/**
 * Validate VAT rate value
 * @param rate - Rate to validate
 * @returns True if rate is valid
 */
export function isValidVATRate(rate: VATRate): boolean {
  return Object.values(VATRate).includes(rate);
}

/**
 * Get all valid VAT rates
 * @returns Array of valid VAT rates
 */
export function getValidVATRates(): VATRate[] {
  return [VATRate.ZERO, VATRate.REDUCED, VATRate.SPECIAL, VATRate.STANDARD];
}

/**
 * Format VAT rate as percentage string
 * @param rate - VAT rate enum
 * @returns Formatted rate string (e.g., "10%")
 */
export function formatVATRate(rate: VATRate): string {
  return `${rate}%`;
}

/**
 * Calculate line item totals including VAT
 */
export interface LineItemWithVAT {
  amount: number;
  rate: VATRate;
  vatAmount: number;
  totalWithVAT: number;
}

/**
 * Calculate VAT for a line item
 * @param amount - Amount before VAT
 * @param rate - VAT rate
 * @returns Line item with VAT calculations
 */
export function calculateLineItemVAT(
  amount: number,
  rate: VATRate
): LineItemWithVAT {
  const vatAmount = calculateVAT(amount, rate);
  const totalWithVAT = amount + vatAmount;

  return {
    amount,
    rate,
    vatAmount,
    totalWithVAT,
  };
}

/**
 * Aggregate VAT from multiple line items
 */
export interface VATAggregation {
  totalBeforeVAT: number;
  totalVAT: number;
  totalAfterVAT: number;
}

/**
 * Aggregate VAT across multiple items
 * @param items - Array of line items with VAT
 * @returns Aggregated VAT totals
 */
export function aggregateVAT(items: LineItemWithVAT[]): VATAggregation {
  const totalBeforeVAT = items.reduce((sum, item) => sum + item.amount, 0);
  const totalVAT = items.reduce((sum, item) => sum + item.vatAmount, 0);
  const totalAfterVAT = items.reduce((sum, item) => sum + item.totalWithVAT, 0);

  return {
    totalBeforeVAT,
    totalVAT,
    totalAfterVAT,
  };
}

/**
 * Validate VAT declaration consistency
 * Total should equal sum of components
 */
export function validateVATTotals(
  aggregation: VATAggregation
): { valid: boolean; message?: string } {
  const expectedTotal = aggregation.totalBeforeVAT + aggregation.totalVAT;
  const difference = Math.abs(expectedTotal - aggregation.totalAfterVAT);

  // Allow 1 VNĐ rounding difference
  if (difference > 1) {
    return {
      valid: false,
      message: `VAT total mismatch: expected ${expectedTotal}, got ${aggregation.totalAfterVAT}`,
    };
  }

  return { valid: true };
}

export default {
  calculateVAT,
  calculateAmountWithVAT,
  calculateBaseAmountFromTotal,
  vatRateForCategory,
  isVATExempt,
  isValidVATRate,
  getValidVATRates,
  formatVATRate,
  calculateLineItemVAT,
  aggregateVAT,
  validateVATTotals,
};
