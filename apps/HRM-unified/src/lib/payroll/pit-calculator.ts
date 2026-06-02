// src/lib/payroll/pit-calculator.ts
// Vietnam Personal Income Tax Calculator (Thuế TNCN)
// Based on Circular 111/2013/TT-BTC

import { PIT_BRACKETS, PIT_DEDUCTIONS, type PITBracket } from './constants'

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface PITInput {
  /** Tổng thu nhập chịu thuế (Gross taxable income) */
  taxableIncome: number
  /** Số người phụ thuộc (Number of dependents) */
  dependentCount: number
  /** Giảm trừ bản thân tùy chỉnh (nếu có) */
  personalDeduction?: number
  /** Giảm trừ người phụ thuộc tùy chỉnh (nếu có) */
  dependentDeduction?: number
  /** Custom PIT brackets (nếu có) */
  customBrackets?: PITBracket[]
}

export interface PITResult {
  /** Tổng thu nhập chịu thuế */
  taxableIncome: number
  /** Giảm trừ bản thân */
  personalDeduction: number
  /** Tổng giảm trừ người phụ thuộc */
  dependentDeduction: number
  /** Số người phụ thuộc */
  dependentCount: number
  /** Tổng giảm trừ */
  totalDeductions: number
  /** Thu nhập tính thuế (sau giảm trừ) */
  assessableIncome: number
  /** Chi tiết thuế theo từng bậc */
  bracketDetails: PITBracketDetail[]
  /** Tổng thuế TNCN phải nộp */
  pitAmount: number
  /** Thuế suất thực tế (%) */
  effectiveRate: number
}

export interface PITBracketDetail {
  bracket: number
  from: number
  to: number
  rate: number
  taxableAmount: number
  taxAmount: number
}

// ═══════════════════════════════════════════════════════════════
// Calculator Functions
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate Vietnam Personal Income Tax (PIT)
 * Using progressive tax brackets (7 levels: 5% → 35%)
 *
 * Formula:
 * 1. Taxable Income = Gross Income - Non-taxable allowances
 * 2. Assessable Income = Taxable Income - Personal Deduction - (Dependent Deduction × Dependents)
 * 3. PIT = Sum of (Income in each bracket × Bracket rate)
 *
 * @example
 * ```ts
 * const result = calculatePIT({
 *   taxableIncome: 30_000_000,
 *   dependentCount: 1,
 * })
 * // result.pitAmount = 1,150,000 VND
 * ```
 */
export function calculatePIT(input: PITInput): PITResult {
  const {
    taxableIncome,
    dependentCount,
    personalDeduction = PIT_DEDUCTIONS.PERSONAL,
    dependentDeduction = PIT_DEDUCTIONS.DEPENDENT,
    customBrackets,
  } = input

  const brackets = customBrackets || PIT_BRACKETS

  // Calculate deductions
  const totalDependentDeduction = dependentDeduction * dependentCount
  const totalDeductions = personalDeduction + totalDependentDeduction

  // Calculate assessable income (thu nhập tính thuế)
  const assessableIncome = Math.max(0, taxableIncome - totalDeductions)

  // Calculate tax by brackets
  const bracketDetails: PITBracketDetail[] = []
  let remainingIncome = assessableIncome
  let totalTax = 0

  for (let i = 0; i < brackets.length; i++) {
    const bracket = brackets[i]
    const bracketWidth = bracket.to === Infinity
      ? remainingIncome
      : bracket.to - bracket.from

    if (remainingIncome <= 0) {
      bracketDetails.push({
        bracket: i + 1,
        from: bracket.from,
        to: bracket.to === Infinity ? bracket.from : bracket.to,
        rate: bracket.rate,
        taxableAmount: 0,
        taxAmount: 0,
      })
      continue
    }

    const taxableAmount = Math.min(remainingIncome, bracketWidth)
    const taxAmount = taxableAmount * bracket.rate

    bracketDetails.push({
      bracket: i + 1,
      from: bracket.from,
      to: bracket.to === Infinity ? bracket.from + taxableAmount : bracket.to,
      rate: bracket.rate,
      taxableAmount,
      taxAmount,
    })

    totalTax += taxAmount
    remainingIncome -= taxableAmount
  }

  // Round to VND (no decimals)
  const pitAmount = Math.round(totalTax)

  // Calculate effective rate
  const effectiveRate = taxableIncome > 0
    ? (pitAmount / taxableIncome) * 100
    : 0

  return {
    taxableIncome,
    personalDeduction,
    dependentDeduction: totalDependentDeduction,
    dependentCount,
    totalDeductions,
    assessableIncome,
    bracketDetails,
    pitAmount,
    effectiveRate: Math.round(effectiveRate * 100) / 100,
  }
}

/**
 * Quick PIT calculation (returns only the amount)
 * Useful for quick calculations without detailed breakdown
 */
export function calculatePITAmount(
  taxableIncome: number,
  dependentCount: number = 0
): number {
  const result = calculatePIT({ taxableIncome, dependentCount })
  return result.pitAmount
}

/**
 * Calculate monthly PIT from annual income
 * Divides annual income by 12 and calculates monthly PIT
 */
export function calculateMonthlyPITFromAnnual(
  annualTaxableIncome: number,
  dependentCount: number = 0
): PITResult {
  const monthlyIncome = annualTaxableIncome / 12
  return calculatePIT({
    taxableIncome: monthlyIncome,
    dependentCount,
  })
}

/**
 * Estimate annual PIT from monthly income
 * Calculates monthly PIT and multiplies by 12
 */
export function estimateAnnualPIT(
  monthlyTaxableIncome: number,
  dependentCount: number = 0
): number {
  const monthlyPIT = calculatePITAmount(monthlyTaxableIncome, dependentCount)
  return monthlyPIT * 12
}

/**
 * Get the applicable tax bracket for a given assessable income
 */
export function getTaxBracket(assessableIncome: number): PITBracket | null {
  if (assessableIncome <= 0) return null

  for (const bracket of PIT_BRACKETS) {
    if (assessableIncome > bracket.from && assessableIncome <= bracket.to) {
      return bracket
    }
  }

  // Return highest bracket for very high income
  return PIT_BRACKETS[PIT_BRACKETS.length - 1]
}

/**
 * Calculate the marginal tax rate for a given income
 * (The rate applied to the last VND of income)
 */
export function getMarginalTaxRate(
  taxableIncome: number,
  dependentCount: number = 0
): number {
  const assessableIncome = Math.max(
    0,
    taxableIncome - PIT_DEDUCTIONS.PERSONAL - (PIT_DEDUCTIONS.DEPENDENT * dependentCount)
  )

  const bracket = getTaxBracket(assessableIncome)
  return bracket ? bracket.rate * 100 : 0
}

/**
 * Calculate the income needed to achieve a target net salary
 * (Reverse calculation from net to gross)
 */
export function calculateGrossFromNet(
  targetNetSalary: number,
  dependentCount: number = 0,
  insuranceRate: number = 0.105 // 10.5% total employee insurance
): number {
  // This is an approximation using iteration
  let grossEstimate = targetNetSalary
  const maxIterations = 20
  const tolerance = 1000 // 1,000 VND tolerance

  for (let i = 0; i < maxIterations; i++) {
    const insurance = grossEstimate * insuranceRate
    const taxableIncome = grossEstimate - insurance
    const pit = calculatePITAmount(taxableIncome, dependentCount)
    const calculatedNet = grossEstimate - insurance - pit

    const diff = targetNetSalary - calculatedNet
    if (Math.abs(diff) < tolerance) {
      break
    }

    grossEstimate += diff
  }

  return Math.round(grossEstimate)
}

// ═══════════════════════════════════════════════════════════════
// Validation & Helpers
// ═══════════════════════════════════════════════════════════════

/**
 * Validate dependent count
 * According to regulations, there's a limit on dependents
 */
export function validateDependentCount(count: number): boolean {
  return count >= 0 && Number.isInteger(count)
}

/**
 * Format PIT result for display
 */
export function formatPITResult(result: PITResult): string {
  const lines = [
    `Thu nhập chịu thuế: ${result.taxableIncome.toLocaleString('vi-VN')} VND`,
    `Giảm trừ bản thân: ${result.personalDeduction.toLocaleString('vi-VN')} VND`,
    `Giảm trừ người phụ thuộc (${result.dependentCount}): ${result.dependentDeduction.toLocaleString('vi-VN')} VND`,
    `Thu nhập tính thuế: ${result.assessableIncome.toLocaleString('vi-VN')} VND`,
    `---`,
    `Thuế TNCN: ${result.pitAmount.toLocaleString('vi-VN')} VND`,
    `Thuế suất thực tế: ${result.effectiveRate}%`,
  ]
  return lines.join('\n')
}
