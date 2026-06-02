/**
 * CIT (Corporate Income Tax) Calculation Module
 * Mẫu 03/TNDN - Vietnamese corporate income tax
 * Based on Luật thuế thu nhập doanh nghiệp
 */

import { CompanySize, PrefTaxZone } from "../types/index.js";

/**
 * Standard corporate income tax rate
 */
const STANDARD_CIT_RATE = 20;

/**
 * SME preferential rate
 * For small and medium enterprises
 */
const SME_PREFERENTIAL_RATE = 10;

/**
 * Tech company preferential rate
 * For high-tech enterprises in certain zones
 */
const TECH_PREFERENTIAL_RATE = 5;

/**
 * Tax rate reductions by zone and company size
 */
interface TaxRateConfig {
  baseRate: number;
  smeRate: number;
  techRate: number;
  zoneReductions: { [key: string]: number };
}

const TAX_CONFIG: TaxRateConfig = {
  baseRate: STANDARD_CIT_RATE,
  smeRate: SME_PREFERENTIAL_RATE,
  techRate: TECH_PREFERENTIAL_RATE,
  zoneReductions: {
    HIGHLAND: 10, // Central Highlands - 10% rate
    EXTREME_DIFFICULTY: 5, // Extremely difficult areas - 5% rate
    TECH_PARK: 5, // Tech Parks - 5% rate
    EXPORT_ZONE: 8, // Export Processing Zones - 8% rate
    FREE_TRADE_ZONE: 8, // Free Trade Zones - 8% rate
  },
};

/**
 * Calculate CIT tax amount
 * Standard rate: 20%
 *
 * @param taxableIncome - Income subject to CIT in VNĐ
 * @param companySize - Size of company (for SME rates)
 * @param preferentialZone - Special economic zone (if applicable)
 * @param hasInvestmentIncentives - Has investment incentive certificate
 * @returns Calculated CIT tax amount in VNĐ
 */
export function calculateCIT(
  taxableIncome: number,
  companySize: CompanySize = CompanySize.LARGE,
  preferentialZone?: PrefTaxZone,
  hasInvestmentIncentives: boolean = false
): number {
  if (taxableIncome < 0) {
    throw new Error("Taxable income must be non-negative");
  }

  const rate = determineTaxRate(
    companySize,
    preferentialZone,
    hasInvestmentIncentives
  );

  const citAmount = Math.round((taxableIncome * rate) / 100);
  return citAmount;
}

/**
 * Determine applicable tax rate based on company characteristics
 */
function determineTaxRate(
  companySize: CompanySize,
  preferentialZone?: PrefTaxZone,
  hasInvestmentIncentives: boolean = false
): number {
  // Investment incentive certificate holders - highest reduction
  if (hasInvestmentIncentives && preferentialZone) {
    const zoneRate = TAX_CONFIG.zoneReductions[preferentialZone];
    if (zoneRate !== undefined) {
      return zoneRate;
    }
  }

  // Preferential zone without certificate
  if (preferentialZone) {
    const zoneRate = TAX_CONFIG.zoneReductions[preferentialZone];
    if (zoneRate !== undefined) {
      return zoneRate;
    }
  }

  // Tech companies
  if (companySize === CompanySize.STARTUP) {
    return TAX_CONFIG.techRate;
  }

  // SME rate for small and medium enterprises
  if (
    companySize === CompanySize.MICRO ||
    companySize === CompanySize.SMALL ||
    companySize === CompanySize.MEDIUM
  ) {
    return TAX_CONFIG.smeRate;
  }

  // Standard rate for large enterprises
  return TAX_CONFIG.baseRate;
}

/**
 * CIT Calculation Result
 */
export interface CITCalculation {
  taxableIncome: number;
  rate: number; // percentage
  citAmount: number;
  afterTaxIncome: number;
}

/**
 * Calculate CIT with breakdown
 */
export function calculateCITDetailed(
  taxableIncome: number,
  companySize: CompanySize = CompanySize.LARGE,
  preferentialZone?: PrefTaxZone,
  hasInvestmentIncentives: boolean = false
): CITCalculation {
  if (taxableIncome < 0) {
    throw new Error("Taxable income must be non-negative");
  }

  const rate = determineTaxRate(
    companySize,
    preferentialZone,
    hasInvestmentIncentives
  );

  const citAmount = Math.round((taxableIncome * rate) / 100);
  const afterTaxIncome = taxableIncome - citAmount;

  return {
    taxableIncome,
    rate,
    citAmount,
    afterTaxIncome,
  };
}

/**
 * SME Characteristics
 */
export interface SMECharacteristics {
  capital: number; // Total capital in VNĐ
  employees: number; // Number of employees
  annualRevenue: number; // Annual revenue in VNĐ
}

/**
 * SME thresholds (2024)
 * For tax rate eligibility
 */
const SME_THRESHOLDS = {
  capital: 20_000_000_000, // 20 billion VNĐ
  employees: 300,
  revenue: 300_000_000_000, // 300 billion VNĐ
};

/**
 * Determine if company qualifies for SME tax rate
 */
export function isQualifiedSME(characteristics: SMECharacteristics): boolean {
  return (
    characteristics.capital <= SME_THRESHOLDS.capital &&
    characteristics.employees <= SME_THRESHOLDS.employees &&
    characteristics.annualRevenue <= SME_THRESHOLDS.revenue
  );
}

/**
 * Startup characteristics
 */
export interface StartupCharacteristics {
  yearsInOperation: number;
  hasHighTechClassification: boolean;
  investmentAmount: number;
}

/**
 * Determine if company qualifies as startup with preferential rate
 */
export function isQualifiedStartup(
  characteristics: StartupCharacteristics
): boolean {
  // Less than 3 years in operation AND high-tech classification
  return (
    characteristics.yearsInOperation <= 3 &&
    characteristics.hasHighTechClassification
  );
}

/**
 * Calculate deferred tax liability
 * For provisions and deductions
 */
export interface DeferredTaxCalculation {
  provision: number;
  deductible: boolean;
  deferredTaxAsset: number;
  deferredTaxLiability: number;
}

/**
 * Calculate deferred tax impact
 */
export function calculateDeferredTax(
  provisionalAmount: number,
  rate: number = STANDARD_CIT_RATE
): DeferredTaxCalculation {
  if (provisionalAmount < 0) {
    throw new Error("Provision amount must be non-negative");
  }

  const deferredTaxAsset = Math.round((provisionalAmount * rate) / 100);

  return {
    provision: provisionalAmount,
    deductible: true,
    deferredTaxAsset,
    deferredTaxLiability: 0,
  };
}

/**
 * Calculate quarterly/annual CIT liability
 */
export interface CITLiability {
  period: "QUARTER" | "YEAR";
  taxableIncome: number;
  estimatedCIT: number;
  advancePaidAmount: number;
  amountDue: number;
  amountOverpaid: number;
}

/**
 * Calculate CIT liability for a period
 */
export function calculateCITLiability(
  taxableIncome: number,
  advancePaidAmount: number = 0,
  companySize: CompanySize = CompanySize.LARGE,
  preferentialZone?: PrefTaxZone
): CITLiability {
  const rate = determineTaxRate(companySize, preferentialZone, false);
  const estimatedCIT = Math.round((taxableIncome * rate) / 100);
  const difference = estimatedCIT - advancePaidAmount;

  return {
    period: "YEAR",
    taxableIncome,
    estimatedCIT,
    advancePaidAmount,
    amountDue: Math.max(0, difference),
    amountOverpaid: Math.max(0, -difference),
  };
}

/**
 * Get applicable tax rate for company
 */
export function getApplicableTaxRate(
  companySize: CompanySize,
  preferentialZone?: PrefTaxZone,
  hasIncentives: boolean = false
): number {
  return determineTaxRate(companySize, preferentialZone, hasIncentives);
}

/**
 * Format CIT rate as percentage string
 */
export function formatCITRate(rate: number): string {
  return `${rate}%`;
}

/**
 * Validate CIT input
 */
export function validateCITInput(taxableIncome: number): {
  valid: boolean;
  message?: string;
} {
  if (taxableIncome < 0) {
    return { valid: false, message: "Taxable income must be non-negative" };
  }

  return { valid: true };
}

export default {
  calculateCIT,
  calculateCITDetailed,
  isQualifiedSME,
  isQualifiedStartup,
  calculateDeferredTax,
  calculateCITLiability,
  getApplicableTaxRate,
  formatCITRate,
  validateCITInput,
};
