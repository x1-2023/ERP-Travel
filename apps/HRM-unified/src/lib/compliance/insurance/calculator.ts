// src/lib/compliance/insurance/calculator.ts
// Vietnam Social Insurance Calculator

import {
  INSURANCE_RATES,
  INSURANCE_SALARY_CAP,
  UNEMPLOYMENT_SALARY_CAP,
  type InsuranceContribution,
} from './constants'

// ═══════════════════════════════════════════════════════════════
// REGION TYPES
// ═══════════════════════════════════════════════════════════════

export type WageRegion = 1 | 2 | 3 | 4

// ═══════════════════════════════════════════════════════════════
// INSURANCE CALCULATOR CLASS
// ═══════════════════════════════════════════════════════════════

export class InsuranceCalculator {
  private baseSalary: number
  private region: WageRegion
  private year: number

  constructor(options: { baseSalary: number; region?: WageRegion; year?: number }) {
    this.baseSalary = options.baseSalary
    this.region = options.region || 1
    this.year = options.year || new Date().getFullYear()
  }

  /**
   * Get the insurance salary cap based on year
   */
  private getSalaryCapForSocialInsurance(): number {
    // Currently using 2024 cap, can be extended for different years
    return INSURANCE_SALARY_CAP.MAX_SALARY_2024
  }

  /**
   * Get unemployment insurance cap based on region
   */
  private getUnemploymentCap(): number {
    switch (this.region) {
      case 1:
        return UNEMPLOYMENT_SALARY_CAP.REGION_1_CAP
      case 2:
        return UNEMPLOYMENT_SALARY_CAP.REGION_2_CAP
      case 3:
        return UNEMPLOYMENT_SALARY_CAP.REGION_3_CAP
      case 4:
        return UNEMPLOYMENT_SALARY_CAP.REGION_4_CAP
      default:
        return UNEMPLOYMENT_SALARY_CAP.REGION_1_CAP
    }
  }

  /**
   * Calculate capped salary for BHXH/BHYT
   */
  private getCappedSalaryForSocialHealth(): number {
    const cap = this.getSalaryCapForSocialInsurance()
    return Math.min(this.baseSalary, cap)
  }

  /**
   * Calculate capped salary for BHTN
   */
  private getCappedSalaryForUnemployment(): number {
    const cap = this.getUnemploymentCap()
    return Math.min(this.baseSalary, cap)
  }

  /**
   * Calculate full insurance contribution breakdown
   */
  calculate(): InsuranceContribution {
    const socialHealthCapped = this.getCappedSalaryForSocialHealth()
    const unemploymentCapped = this.getCappedSalaryForUnemployment()

    // Employee contributions
    const employeeSocial = Math.round(socialHealthCapped * INSURANCE_RATES.SOCIAL.EMPLOYEE)
    const employeeHealth = Math.round(socialHealthCapped * INSURANCE_RATES.HEALTH.EMPLOYEE)
    const employeeUnemployment = Math.round(
      unemploymentCapped * INSURANCE_RATES.UNEMPLOYMENT.EMPLOYEE
    )
    const employeeTotal = employeeSocial + employeeHealth + employeeUnemployment

    // Employer contributions
    const employerSocial = Math.round(socialHealthCapped * INSURANCE_RATES.SOCIAL.EMPLOYER)
    const employerHealth = Math.round(socialHealthCapped * INSURANCE_RATES.HEALTH.EMPLOYER)
    const employerUnemployment = Math.round(
      unemploymentCapped * INSURANCE_RATES.UNEMPLOYMENT.EMPLOYER
    )
    const employerTotal = employerSocial + employerHealth + employerUnemployment

    return {
      baseSalary: this.baseSalary,
      cappedSalary: socialHealthCapped,
      employee: {
        social: employeeSocial,
        health: employeeHealth,
        unemployment: employeeUnemployment,
        total: employeeTotal,
      },
      employer: {
        social: employerSocial,
        health: employerHealth,
        unemployment: employerUnemployment,
        total: employerTotal,
      },
      total: employeeTotal + employerTotal,
    }
  }

  /**
   * Quick calculation for employee total deduction
   */
  getEmployeeDeduction(): number {
    return this.calculate().employee.total
  }

  /**
   * Quick calculation for employer total cost
   */
  getEmployerCost(): number {
    return this.calculate().employer.total
  }

  /**
   * Quick calculation for total insurance cost
   */
  getTotalCost(): number {
    return this.calculate().total
  }
}

// ═══════════════════════════════════════════════════════════════
// BATCH CALCULATION
// ═══════════════════════════════════════════════════════════════

export interface EmployeeInsuranceInput {
  employeeId: string
  baseSalary: number
  region?: WageRegion
}

export interface BatchInsuranceResult {
  employees: Array<{
    employeeId: string
    contribution: InsuranceContribution
  }>
  totals: {
    employeeTotal: number
    employerTotal: number
    grandTotal: number
  }
}

/**
 * Calculate insurance for multiple employees
 */
export function calculateBatchInsurance(
  employees: EmployeeInsuranceInput[],
  year?: number
): BatchInsuranceResult {
  const results = employees.map((emp) => {
    const calculator = new InsuranceCalculator({
      baseSalary: emp.baseSalary,
      region: emp.region || 1,
      year,
    })

    return {
      employeeId: emp.employeeId,
      contribution: calculator.calculate(),
    }
  })

  const totals = results.reduce(
    (acc, curr) => ({
      employeeTotal: acc.employeeTotal + curr.contribution.employee.total,
      employerTotal: acc.employerTotal + curr.contribution.employer.total,
      grandTotal: acc.grandTotal + curr.contribution.total,
    }),
    { employeeTotal: 0, employerTotal: 0, grandTotal: 0 }
  )

  return { employees: results, totals }
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Format currency for display
 */
export function formatInsuranceAmount(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Calculate insurance salary from gross salary
 * Sometimes insurance salary differs from gross (e.g., excludes certain allowances)
 */
export function calculateInsuranceSalary(
  grossSalary: number,
  options?: {
    excludeAllowances?: number
    includeBonuses?: boolean
  }
): number {
  let insuranceSalary = grossSalary

  // Exclude non-insurable allowances
  if (options?.excludeAllowances) {
    insuranceSalary -= options.excludeAllowances
  }

  // Ensure minimum
  return Math.max(insuranceSalary, 0)
}

/**
 * Validate insurance registration
 */
export function validateInsuranceRegistration(data: {
  socialInsuranceNumber: string
  registrationDate: Date
  baseSalary: number
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Validate social insurance number format (10 digits)
  if (!/^\d{10}$/.test(data.socialInsuranceNumber)) {
    errors.push('Số BHXH phải có đúng 10 chữ số')
  }

  // Validate registration date
  if (data.registrationDate > new Date()) {
    errors.push('Ngày đăng ký không thể trong tương lai')
  }

  // Validate base salary
  if (data.baseSalary < 0) {
    errors.push('Mức lương đóng BHXH không thể âm')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
