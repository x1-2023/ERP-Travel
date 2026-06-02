// src/lib/payroll/insurance-calculator.ts
// Vietnam Social Insurance Calculator (BHXH/BHYT/BHTN)
// Based on Labor Code 2019 and Social Insurance Law 2014

import { INSURANCE_RATES, INSURANCE_SALARY_CAP } from './constants'

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface InsuranceInput {
  /** Lương đóng bảo hiểm (Insurance salary) */
  insuranceSalary: number
  /** Mức trần lương bảo hiểm (nếu khác mặc định) */
  salaryCap?: number
  /** Tỷ lệ BHXH nhân viên (nếu khác mặc định) */
  bhxhEmployeeRate?: number
  /** Tỷ lệ BHXH công ty (nếu khác mặc định) */
  bhxhEmployerRate?: number
  /** Tỷ lệ BHYT nhân viên (nếu khác mặc định) */
  bhytEmployeeRate?: number
  /** Tỷ lệ BHYT công ty (nếu khác mặc định) */
  bhytEmployerRate?: number
  /** Tỷ lệ BHTN nhân viên (nếu khác mặc định) */
  bhtnEmployeeRate?: number
  /** Tỷ lệ BHTN công ty (nếu khác mặc định) */
  bhtnEmployerRate?: number
}

export interface InsuranceResult {
  /** Lương đóng bảo hiểm gốc */
  insuranceSalary: number
  /** Lương đóng bảo hiểm sau khi áp dụng trần */
  cappedSalary: number
  /** Mức trần lương bảo hiểm */
  salaryCap: number
  /** Có bị giới hạn trần không */
  isCapped: boolean

  /** Chi tiết BHXH */
  bhxh: {
    employee: number
    employer: number
    total: number
    employeeRate: number
    employerRate: number
  }

  /** Chi tiết BHYT */
  bhyt: {
    employee: number
    employer: number
    total: number
    employeeRate: number
    employerRate: number
  }

  /** Chi tiết BHTN */
  bhtn: {
    employee: number
    employer: number
    total: number
    employeeRate: number
    employerRate: number
  }

  /** Tổng hợp */
  totals: {
    employee: number      // Tổng NLĐ đóng
    employer: number      // Tổng công ty đóng
    total: number         // Tổng cả hai bên
    employeeRate: number  // Tổng tỷ lệ NLĐ (10.5%)
    employerRate: number  // Tổng tỷ lệ công ty (21.5%)
  }
}

// ═══════════════════════════════════════════════════════════════
// Calculator Functions
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate Vietnam Social Insurance (BHXH/BHYT/BHTN)
 *
 * Current rates (2024-2026):
 * - BHXH: Employee 8%, Employer 17.5%
 * - BHYT: Employee 1.5%, Employer 3%
 * - BHTN: Employee 1%, Employer 1%
 * - Total: Employee 10.5%, Employer 21.5%
 *
 * Salary cap: 46,800,000 VND (20 x base salary)
 *
 * @example
 * ```ts
 * const result = calculateInsurance({
 *   insuranceSalary: 20_000_000,
 * })
 * // result.totals.employee = 2,100,000 VND
 * // result.totals.employer = 4,300,000 VND
 * ```
 */
export function calculateInsurance(input: InsuranceInput): InsuranceResult {
  const {
    insuranceSalary,
    salaryCap = INSURANCE_SALARY_CAP,
    bhxhEmployeeRate = INSURANCE_RATES.BHXH.EMPLOYEE,
    bhxhEmployerRate = INSURANCE_RATES.BHXH.EMPLOYER,
    bhytEmployeeRate = INSURANCE_RATES.BHYT.EMPLOYEE,
    bhytEmployerRate = INSURANCE_RATES.BHYT.EMPLOYER,
    bhtnEmployeeRate = INSURANCE_RATES.BHTN.EMPLOYEE,
    bhtnEmployerRate = INSURANCE_RATES.BHTN.EMPLOYER,
  } = input

  // Apply salary cap
  const cappedSalary = Math.min(insuranceSalary, salaryCap)
  const isCapped = insuranceSalary > salaryCap

  // Calculate BHXH
  const bhxhEmployee = Math.round(cappedSalary * bhxhEmployeeRate)
  const bhxhEmployer = Math.round(cappedSalary * bhxhEmployerRate)

  // Calculate BHYT
  const bhytEmployee = Math.round(cappedSalary * bhytEmployeeRate)
  const bhytEmployer = Math.round(cappedSalary * bhytEmployerRate)

  // Calculate BHTN
  const bhtnEmployee = Math.round(cappedSalary * bhtnEmployeeRate)
  const bhtnEmployer = Math.round(cappedSalary * bhtnEmployerRate)

  // Calculate totals
  const totalEmployee = bhxhEmployee + bhytEmployee + bhtnEmployee
  const totalEmployer = bhxhEmployer + bhytEmployer + bhtnEmployer

  return {
    insuranceSalary,
    cappedSalary,
    salaryCap,
    isCapped,

    bhxh: {
      employee: bhxhEmployee,
      employer: bhxhEmployer,
      total: bhxhEmployee + bhxhEmployer,
      employeeRate: bhxhEmployeeRate,
      employerRate: bhxhEmployerRate,
    },

    bhyt: {
      employee: bhytEmployee,
      employer: bhytEmployer,
      total: bhytEmployee + bhytEmployer,
      employeeRate: bhytEmployeeRate,
      employerRate: bhytEmployerRate,
    },

    bhtn: {
      employee: bhtnEmployee,
      employer: bhtnEmployer,
      total: bhtnEmployee + bhtnEmployer,
      employeeRate: bhtnEmployeeRate,
      employerRate: bhtnEmployerRate,
    },

    totals: {
      employee: totalEmployee,
      employer: totalEmployer,
      total: totalEmployee + totalEmployer,
      employeeRate: bhxhEmployeeRate + bhytEmployeeRate + bhtnEmployeeRate,
      employerRate: bhxhEmployerRate + bhytEmployerRate + bhtnEmployerRate,
    },
  }
}

/**
 * Quick calculation - returns only employee portion
 */
export function calculateEmployeeInsurance(insuranceSalary: number): number {
  const result = calculateInsurance({ insuranceSalary })
  return result.totals.employee
}

/**
 * Quick calculation - returns only employer portion
 */
export function calculateEmployerInsurance(insuranceSalary: number): number {
  const result = calculateInsurance({ insuranceSalary })
  return result.totals.employer
}

/**
 * Calculate insurance for salary after cap
 * Useful when you only want to see effect of cap
 */
export function getInsuranceSalaryCap(
  salary: number,
  cap: number = INSURANCE_SALARY_CAP
): { original: number; capped: number; isCapped: boolean } {
  const capped = Math.min(salary, cap)
  return {
    original: salary,
    capped,
    isCapped: salary > cap,
  }
}

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

/**
 * Check if employee is eligible for insurance
 * Based on contract type and probation status
 */
export function isInsuranceEligible(
  contractType: string,
  isProbation: boolean
): boolean {
  // Labor Code 2019: Insurance applies from first working day
  // for contracts >= 1 month
  const validContractTypes = [
    'DEFINITE_TERM',
    'INDEFINITE_TERM',
    'SEASONAL',
  ]

  if (isProbation) {
    // Probation: Still need to pay insurance if probation contract >= 1 month
    return validContractTypes.includes(contractType)
  }

  return validContractTypes.includes(contractType)
}

/**
 * Calculate annual insurance totals
 */
export function calculateAnnualInsurance(monthlyInsuranceSalary: number): {
  employee: number
  employer: number
  total: number
} {
  const monthly = calculateInsurance({ insuranceSalary: monthlyInsuranceSalary })
  return {
    employee: monthly.totals.employee * 12,
    employer: monthly.totals.employer * 12,
    total: monthly.totals.total * 12,
  }
}

/**
 * Format insurance result for display
 */
export function formatInsuranceResult(result: InsuranceResult): string {
  const lines = [
    `Lương đóng BH: ${result.insuranceSalary.toLocaleString('vi-VN')} VND`,
    result.isCapped ? `(Đã áp dụng trần: ${result.cappedSalary.toLocaleString('vi-VN')} VND)` : '',
    '',
    `BHXH (8% + 17.5%):`,
    `  - NLĐ: ${result.bhxh.employee.toLocaleString('vi-VN')} VND`,
    `  - Cty: ${result.bhxh.employer.toLocaleString('vi-VN')} VND`,
    '',
    `BHYT (1.5% + 3%):`,
    `  - NLĐ: ${result.bhyt.employee.toLocaleString('vi-VN')} VND`,
    `  - Cty: ${result.bhyt.employer.toLocaleString('vi-VN')} VND`,
    '',
    `BHTN (1% + 1%):`,
    `  - NLĐ: ${result.bhtn.employee.toLocaleString('vi-VN')} VND`,
    `  - Cty: ${result.bhtn.employer.toLocaleString('vi-VN')} VND`,
    '',
    `---`,
    `Tổng NLĐ đóng: ${result.totals.employee.toLocaleString('vi-VN')} VND (10.5%)`,
    `Tổng Cty đóng: ${result.totals.employer.toLocaleString('vi-VN')} VND (21.5%)`,
  ].filter(Boolean)

  return lines.join('\n')
}

/**
 * Get insurance breakdown for payroll items
 */
export function getInsurancePayrollItems(
  result: InsuranceResult
): {
  employee: Array<{ code: string; name: string; amount: number }>
  employer: Array<{ code: string; name: string; amount: number }>
} {
  return {
    employee: [
      { code: 'BHXH_EE', name: 'BHXH (8%)', amount: result.bhxh.employee },
      { code: 'BHYT_EE', name: 'BHYT (1.5%)', amount: result.bhyt.employee },
      { code: 'BHTN_EE', name: 'BHTN (1%)', amount: result.bhtn.employee },
    ],
    employer: [
      { code: 'BHXH_ER', name: 'BHXH công ty (17.5%)', amount: result.bhxh.employer },
      { code: 'BHYT_ER', name: 'BHYT công ty (3%)', amount: result.bhyt.employer },
      { code: 'BHTN_ER', name: 'BHTN công ty (1%)', amount: result.bhtn.employer },
    ],
  }
}
