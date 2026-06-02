/**
 * PIT (Personal Income Tax) Calculation Module
 * Mẫu 05/KK-TNCN - Vietnamese personal income tax
 * Based on Luật thuế thu nhập cá nhân
 */

import { PITBracket } from "../types/index.js";

/**
 * Personal deduction: 11,000,000 VNĐ per month
 */
const PERSONAL_DEDUCTION = 11_000_000;

/**
 * Dependent deduction: 4,400,000 VNĐ per dependent per month
 */
const DEPENDENT_DEDUCTION = 4_400_000;

/**
 * Progressive tax brackets for 2024
 * Percentage rates: 5%, 10%, 15%, 20%, 25%, 30%, 35%
 */
const PIT_BRACKETS: PITBracket[] = [
  {
    fromIncome: 0,
    toIncome: 5_000_000,
    rate: 5,
    deductionAmount: 0,
  },
  {
    fromIncome: 5_000_000,
    toIncome: 10_000_000,
    rate: 10,
    deductionAmount: 250_000, // 5M * 5%
  },
  {
    fromIncome: 10_000_000,
    toIncome: 18_000_000,
    rate: 15,
    deductionAmount: 250_000 + 500_000, // previous brackets
  },
  {
    fromIncome: 18_000_000,
    toIncome: 32_000_000,
    rate: 20,
    deductionAmount: 250_000 + 500_000 + 1_200_000,
  },
  {
    fromIncome: 32_000_000,
    toIncome: 52_000_000,
    rate: 25,
    deductionAmount: 250_000 + 500_000 + 1_200_000 + 2_800_000,
  },
  {
    fromIncome: 52_000_000,
    toIncome: 80_000_000,
    rate: 30,
    deductionAmount: 250_000 + 500_000 + 1_200_000 + 2_800_000 + 5_000_000,
  },
  {
    fromIncome: 80_000_000,
    toIncome: Number.MAX_SAFE_INTEGER,
    rate: 35,
    deductionAmount: 250_000 + 500_000 + 1_200_000 + 2_800_000 + 5_000_000 + 8_400_000,
  },
];

/**
 * Get PIT bracket for income amount
 */
function getPITBracket(income: number): PITBracket {
  return (
    PIT_BRACKETS.find((b) => income >= b.fromIncome && income < b.toIncome) ||
    PIT_BRACKETS[PIT_BRACKETS.length - 1]
  );
}

/**
 * Calculate total deductions (personal + dependents)
 * @param dependents - Number of dependents
 * @returns Total deduction amount in VNĐ
 */
function calculateDeductions(dependents: number): number {
  if (dependents < 0) {
    throw new Error("Number of dependents must be non-negative");
  }

  return PERSONAL_DEDUCTION + dependents * DEPENDENT_DEDUCTION;
}

/**
 * Calculate taxable income
 * @param grossIncome - Gross income before deductions
 * @param dependents - Number of dependents
 * @param additionalDeductions - Additional deductions (if any)
 * @returns Taxable income after standard deductions
 */
export function calculateTaxableIncome(
  grossIncome: number,
  dependents: number = 0,
  additionalDeductions: number = 0
): number {
  if (grossIncome < 0) {
    throw new Error("Gross income must be non-negative");
  }

  const standardDeductions = calculateDeductions(dependents);
  const totalDeductions = standardDeductions + additionalDeductions;
  const taxableIncome = Math.max(0, grossIncome - totalDeductions);

  return Math.round(taxableIncome);
}

/**
 * Calculate PIT tax amount
 * @param taxableIncome - Income subject to tax
 * @returns PIT tax amount in VNĐ
 */
function calculatePITFromTaxable(taxableIncome: number): number {
  if (taxableIncome <= 0) {
    return 0;
  }

  const bracket = getPITBracket(taxableIncome);
  const incomeInBracket = taxableIncome - bracket.fromIncome;
  const taxInBracket = Math.round((incomeInBracket * bracket.rate) / 100);

  return bracket.deductionAmount + taxInBracket;
}

/**
 * Calculate Personal Income Tax (PIT)
 * Mẫu 05/KK-TNCN
 *
 * @param grossIncome - Gross monthly income in VNĐ
 * @param dependents - Number of dependents (default 0)
 * @param additionalDeductions - Additional deductions beyond standard (default 0)
 * @returns Calculated PIT tax amount in VNĐ
 */
export function calculatePIT(
  grossIncome: number,
  dependents: number = 0,
  additionalDeductions: number = 0
): number {
  if (grossIncome < 0) {
    throw new Error("Gross income must be non-negative");
  }

  const taxableIncome = calculateTaxableIncome(
    grossIncome,
    dependents,
    additionalDeductions
  );

  return calculatePITFromTaxable(taxableIncome);
}

/**
 * PIT Calculation Result
 */
export interface PITCalculation {
  grossIncome: number;
  personalDeduction: number;
  dependentDeduction: number;
  additionalDeductions: number;
  taxableIncome: number;
  pitTax: number;
  netIncome: number;
  taxRate: number; // effective tax rate %
}

/**
 * Calculate PIT with detailed breakdown
 */
export function calculatePITDetailed(
  grossIncome: number,
  dependents: number = 0,
  additionalDeductions: number = 0
): PITCalculation {
  if (grossIncome < 0) {
    throw new Error("Gross income must be non-negative");
  }

  const personalDeduction = PERSONAL_DEDUCTION;
  const dependentDeduction = dependents * DEPENDENT_DEDUCTION;
  const totalAdditional = personalDeduction + dependentDeduction + additionalDeductions;
  const taxableIncome = Math.max(0, grossIncome - totalAdditional);
  const pitTax = calculatePITFromTaxable(taxableIncome);
  const netIncome = grossIncome - pitTax;
  const taxRate = grossIncome > 0 ? (pitTax / grossIncome) * 100 : 0;

  return {
    grossIncome,
    personalDeduction,
    dependentDeduction,
    additionalDeductions,
    taxableIncome,
    pitTax: Math.round(pitTax),
    netIncome: Math.round(netIncome),
    taxRate: Math.round(taxRate * 100) / 100,
  };
}

/**
 * Get all PIT brackets
 */
export function getPITBrackets(): PITBracket[] {
  return [...PIT_BRACKETS];
}

/**
 * Get effective tax rate for income level
 */
export function getEffectiveTaxRate(grossIncome: number, dependents: number = 0): number {
  if (grossIncome <= 0) {
    return 0;
  }

  const pit = calculatePIT(grossIncome, dependents);
  return (pit / grossIncome) * 100;
}

/**
 * Get marginal tax rate for income level
 */
export function getMarginalTaxRate(income: number): number {
  const bracket = getPITBracket(income);
  return bracket.rate;
}

/**
 * Calculate annual PIT from monthly amounts
 */
export function calculateAnnualPIT(
  monthlyGrossIncome: number,
  dependents: number = 0,
  months: number = 12
): {
  totalGrossIncome: number;
  totalPIT: number;
  totalNetIncome: number;
} {
  const monthlyPIT = calculatePIT(monthlyGrossIncome, dependents);
  const totalGrossIncome = monthlyGrossIncome * months;
  const totalPIT = monthlyPIT * months;
  const totalNetIncome = totalGrossIncome - totalPIT;

  return {
    totalGrossIncome,
    totalPIT,
    totalNetIncome,
  };
}

/**
 * Calculate family circumstance deduction adjustment
 * Used for special cases
 */
export function calculateFamilyCircumstanceAdjustment(
  dependents: number,
  monthlyIncome: number
): number {
  // Additional deduction per dependent based on income level
  if (monthlyIncome > 30_000_000 || dependents === 0) {
    return 0;
  }

  // Additional adjustment for low-income earners with dependents
  return Math.min(dependents * 500_000, 5_000_000);
}

/**
 * Validate PIT input parameters
 */
export function validatePITInput(
  grossIncome: number,
  dependents: number
): { valid: boolean; message?: string } {
  if (grossIncome < 0) {
    return { valid: false, message: "Gross income must be non-negative" };
  }

  if (dependents < 0 || !Number.isInteger(dependents)) {
    return { valid: false, message: "Dependents must be a non-negative integer" };
  }

  return { valid: true };
}

export default {
  calculatePIT,
  calculatePITDetailed,
  calculateTaxableIncome,
  getPITBrackets,
  getEffectiveTaxRate,
  getMarginalTaxRate,
  calculateAnnualPIT,
  calculateFamilyCircumstanceAdjustment,
  validatePITInput,
};
