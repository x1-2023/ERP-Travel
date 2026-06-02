// src/lib/compliance/tax/calculator.ts
// Vietnam Personal Income Tax (TNCN) Calculator

import {
  TAX_BRACKETS,
  TAX_DEDUCTIONS,
  INSURANCE_DEDUCTION_RATES,
  type TaxCalculationResult,
  type AnnualTaxSummary,
} from './constants'

// ═══════════════════════════════════════════════════════════════
// TAX CALCULATOR CLASS
// ═══════════════════════════════════════════════════════════════

export interface TaxCalculatorOptions {
  grossIncome: number
  insuranceSalary?: number // If different from gross
  dependentCount?: number
  otherDeductions?: number
  useQuickDeduction?: boolean // Use quick deduction method (default true)
}

export class TaxCalculator {
  private grossIncome: number
  private insuranceSalary: number
  private dependentCount: number
  private otherDeductions: number
  private useQuickDeduction: boolean

  constructor(options: TaxCalculatorOptions) {
    this.grossIncome = options.grossIncome
    this.insuranceSalary = options.insuranceSalary || options.grossIncome
    this.dependentCount = options.dependentCount || 0
    this.otherDeductions = options.otherDeductions || 0
    this.useQuickDeduction = options.useQuickDeduction !== false
  }

  /**
   * Calculate insurance deduction (BHXH, BHYT, BHTN - employee portion)
   */
  private calculateInsuranceDeduction(): number {
    return Math.round(this.insuranceSalary * INSURANCE_DEDUCTION_RATES.EMPLOYEE_TOTAL)
  }

  /**
   * Calculate personal deduction (11 million/month)
   */
  private getPersonalDeduction(): number {
    return TAX_DEDUCTIONS.PERSONAL
  }

  /**
   * Calculate dependent deduction (4.4 million/dependent/month)
   */
  private getDependentDeduction(): number {
    return this.dependentCount * TAX_DEDUCTIONS.DEPENDENT
  }

  /**
   * Calculate taxable income
   */
  private calculateTaxableIncome(): number {
    const insuranceDeduction = this.calculateInsuranceDeduction()
    const personalDeduction = this.getPersonalDeduction()
    const dependentDeduction = this.getDependentDeduction()

    const taxableIncome =
      this.grossIncome -
      insuranceDeduction -
      personalDeduction -
      dependentDeduction -
      this.otherDeductions

    return Math.max(0, taxableIncome)
  }

  /**
   * Find the applicable tax bracket
   */
  private findBracket(taxableIncome: number): (typeof TAX_BRACKETS)[number] {
    for (const bracket of TAX_BRACKETS) {
      if (taxableIncome <= bracket.maxIncome) {
        return bracket
      }
    }
    return TAX_BRACKETS[TAX_BRACKETS.length - 1]
  }

  /**
   * Calculate tax using progressive method (từng phần)
   */
  private calculateTaxProgressive(taxableIncome: number): number {
    let remainingIncome = taxableIncome
    let totalTax = 0

    for (const bracket of TAX_BRACKETS) {
      if (remainingIncome <= 0) break

      const bracketSize = bracket.maxIncome - bracket.minIncome
      const incomeInBracket = Math.min(remainingIncome, bracketSize)

      totalTax += incomeInBracket * bracket.rate
      remainingIncome -= incomeInBracket
    }

    return Math.round(totalTax)
  }

  /**
   * Calculate tax using quick deduction method (toàn phần)
   */
  private calculateTaxQuickDeduction(taxableIncome: number): number {
    if (taxableIncome <= 0) return 0

    const bracket = this.findBracket(taxableIncome)
    const tax = taxableIncome * bracket.rate - bracket.quickDeduction

    return Math.max(0, Math.round(tax))
  }

  /**
   * Perform full tax calculation
   */
  calculate(): TaxCalculationResult {
    const insuranceDeduction = this.calculateInsuranceDeduction()
    const personalDeduction = this.getPersonalDeduction()
    const dependentDeduction = this.getDependentDeduction()
    const taxableIncome = this.calculateTaxableIncome()

    const taxAmount = this.useQuickDeduction
      ? this.calculateTaxQuickDeduction(taxableIncome)
      : this.calculateTaxProgressive(taxableIncome)

    const netIncome = this.grossIncome - insuranceDeduction - taxAmount
    const effectiveRate = this.grossIncome > 0 ? taxAmount / this.grossIncome : 0
    const bracket = this.findBracket(taxableIncome)

    return {
      grossIncome: this.grossIncome,
      insuranceDeduction,
      personalDeduction,
      dependentDeduction,
      otherDeductions: this.otherDeductions,
      taxableIncome,
      taxAmount,
      netIncome,
      effectiveRate,
      bracketLevel: bracket.level,
    }
  }

  /**
   * Quick method to get just the tax amount
   */
  getTaxAmount(): number {
    return this.calculate().taxAmount
  }

  /**
   * Quick method to get net income
   */
  getNetIncome(): number {
    return this.calculate().netIncome
  }
}

// ═══════════════════════════════════════════════════════════════
// ANNUAL TAX SETTLEMENT
// ═══════════════════════════════════════════════════════════════

export interface MonthlyIncomeData {
  month: number
  grossIncome: number
  insuranceSalary?: number
  taxPaid: number
  dependentCount?: number
}

/**
 * Calculate annual tax settlement
 */
export function calculateAnnualTax(
  year: number,
  monthlyData: MonthlyIncomeData[],
  annualDependentCount: number = 0,
  annualOtherDeductions: number = 0
): AnnualTaxSummary {
  // Sum up all monthly incomes
  const totalGrossIncome = monthlyData.reduce((sum, m) => sum + m.grossIncome, 0)
  const totalTaxPaid = monthlyData.reduce((sum, m) => sum + m.taxPaid, 0)

  // Calculate total deductions
  const totalInsuranceDeduction = monthlyData.reduce(
    (sum, m) => sum + Math.round((m.insuranceSalary || m.grossIncome) * INSURANCE_DEDUCTION_RATES.EMPLOYEE_TOTAL),
    0
  )

  // Use annual deductions (for the full year or pro-rated based on employment period)
  const monthsWorked = monthlyData.filter((m) => m.grossIncome > 0).length
  const totalPersonalDeduction = TAX_DEDUCTIONS.PERSONAL * monthsWorked
  const totalDependentDeduction = TAX_DEDUCTIONS.DEPENDENT * annualDependentCount * monthsWorked

  // Calculate annual taxable income
  const totalTaxableIncome = Math.max(
    0,
    totalGrossIncome -
      totalInsuranceDeduction -
      totalPersonalDeduction -
      totalDependentDeduction -
      annualOtherDeductions
  )

  // Calculate annual tax amount
  const annualCalculator = new TaxCalculator({
    grossIncome: totalGrossIncome,
    insuranceSalary: monthlyData.reduce((sum, m) => sum + (m.insuranceSalary || m.grossIncome), 0),
    dependentCount: 0, // We've already calculated deductions above
    otherDeductions: totalInsuranceDeduction + totalPersonalDeduction + totalDependentDeduction + annualOtherDeductions,
    useQuickDeduction: true,
  })

  const taxableIncome = Math.max(0, totalGrossIncome - (totalInsuranceDeduction + totalPersonalDeduction + totalDependentDeduction + annualOtherDeductions))
  const totalTaxAmount = annualCalculator.getTaxFromTaxableIncome(taxableIncome)

  // Calculate refund or owed
  const difference = totalTaxPaid - totalTaxAmount
  const taxRefund = Math.max(0, difference)
  const taxOwed = Math.max(0, -difference)

  return {
    year,
    totalGrossIncome,
    totalInsuranceDeduction,
    totalPersonalDeduction,
    totalDependentDeduction,
    totalOtherDeductions: annualOtherDeductions,
    totalTaxableIncome: taxableIncome,
    totalTaxAmount,
    totalTaxPaid,
    taxRefund,
    taxOwed,
  }
}

// Add method to TaxCalculator for direct taxable income calculation
TaxCalculator.prototype.getTaxFromTaxableIncome = function (taxableIncome: number): number {
  if (taxableIncome <= 0) return 0

  let remainingIncome = taxableIncome
  let totalTax = 0

  for (const bracket of TAX_BRACKETS) {
    if (remainingIncome <= 0) break

    const bracketSize = bracket.maxIncome - bracket.minIncome
    const incomeInBracket = Math.min(remainingIncome, bracketSize)

    totalTax += incomeInBracket * bracket.rate
    remainingIncome -= incomeInBracket
  }

  return Math.round(totalTax)
}

// Extend TaxCalculator interface
declare module './calculator' {
  interface TaxCalculator {
    getTaxFromTaxableIncome(taxableIncome: number): number
  }
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Format currency for display
 */
export function formatTaxAmount(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format percentage for display
 */
export function formatTaxRate(rate: number): string {
  return (rate * 100).toFixed(1) + '%'
}

/**
 * Calculate NET salary from GROSS
 */
export function grossToNet(
  grossSalary: number,
  options?: {
    insuranceSalary?: number
    dependentCount?: number
  }
): number {
  const calculator = new TaxCalculator({
    grossIncome: grossSalary,
    insuranceSalary: options?.insuranceSalary,
    dependentCount: options?.dependentCount || 0,
  })
  return calculator.getNetIncome()
}

/**
 * Calculate GROSS salary from desired NET (inverse calculation)
 * Uses binary search for efficiency
 */
export function netToGross(
  desiredNet: number,
  options?: {
    insuranceSalary?: number
    dependentCount?: number
  }
): number {
  let low = desiredNet
  let high = desiredNet * 2 // Start with assumption gross is at most 2x net
  const tolerance = 1000 // Within 1,000 VND

  while (high - low > tolerance) {
    const mid = Math.floor((low + high) / 2)
    const calculatedNet = grossToNet(mid, {
      insuranceSalary: options?.insuranceSalary || mid,
      dependentCount: options?.dependentCount,
    })

    if (calculatedNet < desiredNet) {
      low = mid
    } else {
      high = mid
    }
  }

  return Math.ceil((low + high) / 2)
}

/**
 * Get tax bracket information for a given taxable income
 */
export function getTaxBracketInfo(taxableIncome: number): {
  level: number
  rate: number
  description: string
  minIncome: number
  maxIncome: number
} {
  for (const bracket of TAX_BRACKETS) {
    if (taxableIncome <= bracket.maxIncome) {
      return {
        level: bracket.level,
        rate: bracket.rate,
        description: bracket.description,
        minIncome: bracket.minIncome,
        maxIncome: bracket.maxIncome,
      }
    }
  }

  const lastBracket = TAX_BRACKETS[TAX_BRACKETS.length - 1]
  return {
    level: lastBracket.level,
    rate: lastBracket.rate,
    description: lastBracket.description,
    minIncome: lastBracket.minIncome,
    maxIncome: lastBracket.maxIncome,
  }
}
