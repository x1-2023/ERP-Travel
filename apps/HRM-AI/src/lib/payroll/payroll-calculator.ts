// src/lib/payroll/payroll-calculator.ts
// Main Payroll Calculator - Integrates PIT, Insurance, OT
// Vietnam Payroll Rules 2024-2026

import { calculatePIT, type PITResult } from './pit-calculator'
import { calculateInsurance, type InsuranceResult } from './insurance-calculator'
import {
  OT_RATES,
  WORK_SETTINGS,
  PIT_DEDUCTIONS,
  INSURANCE_RATES,
  INSURANCE_SALARY_CAP,
} from './constants'

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface PayrollInput {
  /** Employee basic info */
  employeeId: string
  employeeCode: string
  employeeName: string
  departmentName?: string
  positionName?: string

  /** Salary from contract */
  baseSalary: number
  insuranceSalary: number

  /** Attendance data from Sprint 2 */
  workDays: number
  standardDays: number
  otHoursWeekday: number
  otHoursWeekend: number
  otHoursHoliday: number
  otHoursNight: number

  /** Dependents from Sprint 1 */
  dependentCount: number

  /** Additional earnings */
  allowances?: PayrollAllowance[]

  /** Additional deductions */
  deductions?: PayrollDeduction[]

  /** Bank info */
  bankAccount?: string
  bankName?: string
  bankCode?: string

  /** Custom config (if different from defaults) */
  config?: Partial<PayrollConfig>
}

export interface PayrollAllowance {
  code: string
  name: string
  amount: number
  isTaxable: boolean
  isInsuranceable: boolean
}

export interface PayrollDeduction {
  code: string
  name: string
  amount: number
}

export interface PayrollConfig {
  bhxhEmployeeRate: number
  bhxhEmployerRate: number
  bhytEmployeeRate: number
  bhytEmployerRate: number
  bhtnEmployeeRate: number
  bhtnEmployerRate: number
  insuranceSalaryCap: number
  personalDeduction: number
  dependentDeduction: number
  otWeekdayRate: number
  otWeekendRate: number
  otHolidayRate: number
  otNightBonus: number
  standardWorkDays: number
  standardWorkHours: number
}

export interface PayrollResult {
  /** Input echo */
  employeeId: string
  employeeCode: string
  employeeName: string
  departmentName?: string
  positionName?: string
  baseSalary: number
  insuranceSalary: number
  bankAccount?: string
  bankName?: string
  bankCode?: string

  /** Attendance */
  workDays: number
  standardDays: number
  otHoursWeekday: number
  otHoursWeekend: number
  otHoursHoliday: number
  otHoursNight: number

  /** Earnings breakdown */
  earnings: {
    proRatedSalary: number
    otWeekday: number
    otWeekend: number
    otHoliday: number
    otNight: number
    totalOT: number
    allowancesTaxable: number
    allowancesNonTaxable: number
    totalAllowances: number
    items: PayrollItem[]
  }

  /** Gross */
  grossSalary: number

  /** Insurance (employee) */
  insurance: InsuranceResult
  bhxhEmployee: number
  bhytEmployee: number
  bhtnEmployee: number
  totalInsuranceEmployee: number

  /** PIT */
  pit: PITResult
  taxableIncome: number
  personalDeduction: number
  dependentDeduction: number
  dependentCount: number
  assessableIncome: number
  pitAmount: number

  /** Other deductions */
  otherDeductions: {
    total: number
    items: PayrollItem[]
  }

  /** Net */
  totalDeductions: number
  netSalary: number

  /** Employer cost */
  bhxhEmployer: number
  bhytEmployer: number
  bhtnEmployer: number
  totalEmployerCost: number

  /** All items for detail display */
  allItems: PayrollItem[]
}

export interface PayrollItem {
  code: string
  name: string
  category: string
  itemType: 'EARNING' | 'DEDUCTION' | 'EMPLOYER_COST'
  amount: number
  quantity?: number
  rate?: number
  multiplier?: number
  isTaxable: boolean
  isInsuranceable: boolean
  sortOrder: number
}

// ═══════════════════════════════════════════════════════════════
// Default Config
// ═══════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: PayrollConfig = {
  bhxhEmployeeRate: INSURANCE_RATES.BHXH.EMPLOYEE,
  bhxhEmployerRate: INSURANCE_RATES.BHXH.EMPLOYER,
  bhytEmployeeRate: INSURANCE_RATES.BHYT.EMPLOYEE,
  bhytEmployerRate: INSURANCE_RATES.BHYT.EMPLOYER,
  bhtnEmployeeRate: INSURANCE_RATES.BHTN.EMPLOYEE,
  bhtnEmployerRate: INSURANCE_RATES.BHTN.EMPLOYER,
  insuranceSalaryCap: INSURANCE_SALARY_CAP,
  personalDeduction: PIT_DEDUCTIONS.PERSONAL,
  dependentDeduction: PIT_DEDUCTIONS.DEPENDENT,
  otWeekdayRate: OT_RATES.WEEKDAY,
  otWeekendRate: OT_RATES.WEEKEND,
  otHolidayRate: OT_RATES.HOLIDAY,
  otNightBonus: OT_RATES.NIGHT_BONUS,
  standardWorkDays: WORK_SETTINGS.STANDARD_WORK_DAYS,
  standardWorkHours: WORK_SETTINGS.STANDARD_WORK_HOURS,
}

// ═══════════════════════════════════════════════════════════════
// Main Calculator
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate complete payroll for an employee
 *
 * Flow:
 * 1. Calculate pro-rated salary based on actual work days
 * 2. Calculate overtime earnings
 * 3. Sum all allowances
 * 4. Calculate GROSS = Base + OT + Allowances
 * 5. Calculate Insurance (employee + employer)
 * 6. Calculate PIT on taxable income
 * 7. Sum all deductions
 * 8. Calculate NET = GROSS - Deductions
 *
 * @example
 * ```ts
 * const result = calculatePayroll({
 *   employeeId: 'emp1',
 *   employeeCode: 'NV001',
 *   employeeName: 'Nguyen Van A',
 *   baseSalary: 20_000_000,
 *   insuranceSalary: 15_000_000,
 *   workDays: 22,
 *   standardDays: 22,
 *   otHoursWeekday: 10,
 *   otHoursWeekend: 8,
 *   otHoursHoliday: 0,
 *   otHoursNight: 0,
 *   dependentCount: 1,
 * })
 * ```
 */
export function calculatePayroll(input: PayrollInput): PayrollResult {
  const config: PayrollConfig = { ...DEFAULT_CONFIG, ...input.config }
  const allItems: PayrollItem[] = []

  // ═══════════════════════════════════════════════════════════════
  // 1. Calculate Pro-Rated Salary
  // ═══════════════════════════════════════════════════════════════
  const workRatio = input.standardDays > 0
    ? input.workDays / input.standardDays
    : 1
  const proRatedSalary = Math.round(input.baseSalary * workRatio)

  allItems.push({
    code: 'BASE',
    name: 'Lương cơ bản',
    category: 'BASE_SALARY',
    itemType: 'EARNING',
    amount: proRatedSalary,
    quantity: input.workDays,
    rate: input.baseSalary / config.standardWorkDays,
    isTaxable: true,
    isInsuranceable: true,
    sortOrder: 1,
  })

  // ═══════════════════════════════════════════════════════════════
  // 2. Calculate Overtime
  // ═══════════════════════════════════════════════════════════════
  const hourlyRate = input.baseSalary / (config.standardWorkDays * config.standardWorkHours)

  // OT Weekday (150%)
  const otWeekday = Math.round(input.otHoursWeekday * hourlyRate * config.otWeekdayRate)
  if (input.otHoursWeekday > 0) {
    allItems.push({
      code: 'OT_WEEKDAY',
      name: 'Tăng ca ngày thường',
      category: 'OVERTIME',
      itemType: 'EARNING',
      amount: otWeekday,
      quantity: input.otHoursWeekday,
      rate: hourlyRate,
      multiplier: config.otWeekdayRate,
      isTaxable: true,
      isInsuranceable: false,
      sortOrder: 10,
    })
  }

  // OT Weekend (200%)
  const otWeekend = Math.round(input.otHoursWeekend * hourlyRate * config.otWeekendRate)
  if (input.otHoursWeekend > 0) {
    allItems.push({
      code: 'OT_WEEKEND',
      name: 'Tăng ca cuối tuần',
      category: 'OVERTIME',
      itemType: 'EARNING',
      amount: otWeekend,
      quantity: input.otHoursWeekend,
      rate: hourlyRate,
      multiplier: config.otWeekendRate,
      isTaxable: true,
      isInsuranceable: false,
      sortOrder: 11,
    })
  }

  // OT Holiday (300%)
  const otHoliday = Math.round(input.otHoursHoliday * hourlyRate * config.otHolidayRate)
  if (input.otHoursHoliday > 0) {
    allItems.push({
      code: 'OT_HOLIDAY',
      name: 'Tăng ca ngày lễ',
      category: 'OVERTIME',
      itemType: 'EARNING',
      amount: otHoliday,
      quantity: input.otHoursHoliday,
      rate: hourlyRate,
      multiplier: config.otHolidayRate,
      isTaxable: true,
      isInsuranceable: false,
      sortOrder: 12,
    })
  }

  // Night bonus (+30%)
  const otNight = Math.round(input.otHoursNight * hourlyRate * config.otNightBonus)
  if (input.otHoursNight > 0) {
    allItems.push({
      code: 'OT_NIGHT',
      name: 'Phụ cấp đêm',
      category: 'OVERTIME',
      itemType: 'EARNING',
      amount: otNight,
      quantity: input.otHoursNight,
      rate: hourlyRate,
      multiplier: config.otNightBonus,
      isTaxable: true,
      isInsuranceable: false,
      sortOrder: 13,
    })
  }

  const totalOT = otWeekday + otWeekend + otHoliday + otNight

  // ═══════════════════════════════════════════════════════════════
  // 3. Process Allowances
  // ═══════════════════════════════════════════════════════════════
  let allowancesTaxable = 0
  let allowancesNonTaxable = 0
  const allowanceItems: PayrollItem[] = []

  if (input.allowances) {
    for (const allowance of input.allowances) {
      if (allowance.isTaxable) {
        allowancesTaxable += allowance.amount
      } else {
        allowancesNonTaxable += allowance.amount
      }

      allowanceItems.push({
        code: allowance.code,
        name: allowance.name,
        category: allowance.isTaxable ? 'ALLOWANCE_TAXABLE' : 'ALLOWANCE_NON_TAXABLE',
        itemType: 'EARNING',
        amount: allowance.amount,
        isTaxable: allowance.isTaxable,
        isInsuranceable: allowance.isInsuranceable,
        sortOrder: 20,
      })
    }
    allItems.push(...allowanceItems)
  }

  const totalAllowances = allowancesTaxable + allowancesNonTaxable

  // ═══════════════════════════════════════════════════════════════
  // 4. Calculate GROSS
  // ═══════════════════════════════════════════════════════════════
  const grossSalary = proRatedSalary + totalOT + totalAllowances

  // ═══════════════════════════════════════════════════════════════
  // 5. Calculate Insurance
  // ═══════════════════════════════════════════════════════════════
  const insurance = calculateInsurance({
    insuranceSalary: input.insuranceSalary,
    salaryCap: config.insuranceSalaryCap,
    bhxhEmployeeRate: config.bhxhEmployeeRate,
    bhxhEmployerRate: config.bhxhEmployerRate,
    bhytEmployeeRate: config.bhytEmployeeRate,
    bhytEmployerRate: config.bhytEmployerRate,
    bhtnEmployeeRate: config.bhtnEmployeeRate,
    bhtnEmployerRate: config.bhtnEmployerRate,
  })

  // Add insurance items (employee)
  allItems.push({
    code: 'BHXH_EE',
    name: 'BHXH (8%)',
    category: 'INSURANCE_EMPLOYEE',
    itemType: 'DEDUCTION',
    amount: insurance.bhxh.employee,
    isTaxable: false,
    isInsuranceable: false,
    sortOrder: 30,
  })

  allItems.push({
    code: 'BHYT_EE',
    name: 'BHYT (1.5%)',
    category: 'INSURANCE_EMPLOYEE',
    itemType: 'DEDUCTION',
    amount: insurance.bhyt.employee,
    isTaxable: false,
    isInsuranceable: false,
    sortOrder: 31,
  })

  allItems.push({
    code: 'BHTN_EE',
    name: 'BHTN (1%)',
    category: 'INSURANCE_EMPLOYEE',
    itemType: 'DEDUCTION',
    amount: insurance.bhtn.employee,
    isTaxable: false,
    isInsuranceable: false,
    sortOrder: 32,
  })

  // Add insurance items (employer)
  allItems.push({
    code: 'BHXH_ER',
    name: 'BHXH công ty (17.5%)',
    category: 'INSURANCE_EMPLOYER',
    itemType: 'EMPLOYER_COST',
    amount: insurance.bhxh.employer,
    isTaxable: false,
    isInsuranceable: false,
    sortOrder: 60,
  })

  allItems.push({
    code: 'BHYT_ER',
    name: 'BHYT công ty (3%)',
    category: 'INSURANCE_EMPLOYER',
    itemType: 'EMPLOYER_COST',
    amount: insurance.bhyt.employer,
    isTaxable: false,
    isInsuranceable: false,
    sortOrder: 61,
  })

  allItems.push({
    code: 'BHTN_ER',
    name: 'BHTN công ty (1%)',
    category: 'INSURANCE_EMPLOYER',
    itemType: 'EMPLOYER_COST',
    amount: insurance.bhtn.employer,
    isTaxable: false,
    isInsuranceable: false,
    sortOrder: 62,
  })

  // ═══════════════════════════════════════════════════════════════
  // 6. Calculate PIT
  // ═══════════════════════════════════════════════════════════════
  // Taxable income = Gross - Insurance - Non-taxable allowances
  const taxableIncome = grossSalary - insurance.totals.employee - allowancesNonTaxable

  const pit = calculatePIT({
    taxableIncome,
    dependentCount: input.dependentCount,
    personalDeduction: config.personalDeduction,
    dependentDeduction: config.dependentDeduction,
  })

  allItems.push({
    code: 'PIT',
    name: 'Thuế TNCN',
    category: 'PIT',
    itemType: 'DEDUCTION',
    amount: pit.pitAmount,
    isTaxable: false,
    isInsuranceable: false,
    sortOrder: 40,
  })

  // ═══════════════════════════════════════════════════════════════
  // 7. Process Other Deductions
  // ═══════════════════════════════════════════════════════════════
  let otherDeductionsTotal = 0
  const otherDeductionItems: PayrollItem[] = []

  if (input.deductions) {
    for (const deduction of input.deductions) {
      otherDeductionsTotal += deduction.amount

      otherDeductionItems.push({
        code: deduction.code,
        name: deduction.name,
        category: 'OTHER_DEDUCTION',
        itemType: 'DEDUCTION',
        amount: deduction.amount,
        isTaxable: false,
        isInsuranceable: false,
        sortOrder: 50,
      })
    }
    allItems.push(...otherDeductionItems)
  }

  // ═══════════════════════════════════════════════════════════════
  // 8. Calculate NET
  // ═══════════════════════════════════════════════════════════════
  const totalDeductions = insurance.totals.employee + pit.pitAmount + otherDeductionsTotal
  const netSalary = grossSalary - totalDeductions

  // ═══════════════════════════════════════════════════════════════
  // Sort items by sortOrder
  // ═══════════════════════════════════════════════════════════════
  allItems.sort((a, b) => a.sortOrder - b.sortOrder)

  // ═══════════════════════════════════════════════════════════════
  // Return Result
  // ═══════════════════════════════════════════════════════════════
  return {
    // Input echo
    employeeId: input.employeeId,
    employeeCode: input.employeeCode,
    employeeName: input.employeeName,
    departmentName: input.departmentName,
    positionName: input.positionName,
    baseSalary: input.baseSalary,
    insuranceSalary: input.insuranceSalary,
    bankAccount: input.bankAccount,
    bankName: input.bankName,
    bankCode: input.bankCode,

    // Attendance
    workDays: input.workDays,
    standardDays: input.standardDays,
    otHoursWeekday: input.otHoursWeekday,
    otHoursWeekend: input.otHoursWeekend,
    otHoursHoliday: input.otHoursHoliday,
    otHoursNight: input.otHoursNight,

    // Earnings
    earnings: {
      proRatedSalary,
      otWeekday,
      otWeekend,
      otHoliday,
      otNight,
      totalOT,
      allowancesTaxable,
      allowancesNonTaxable,
      totalAllowances,
      items: allItems.filter(i => i.itemType === 'EARNING'),
    },

    // Gross
    grossSalary,

    // Insurance
    insurance,
    bhxhEmployee: insurance.bhxh.employee,
    bhytEmployee: insurance.bhyt.employee,
    bhtnEmployee: insurance.bhtn.employee,
    totalInsuranceEmployee: insurance.totals.employee,

    // PIT
    pit,
    taxableIncome,
    personalDeduction: pit.personalDeduction,
    dependentDeduction: pit.dependentDeduction,
    dependentCount: pit.dependentCount,
    assessableIncome: pit.assessableIncome,
    pitAmount: pit.pitAmount,

    // Other deductions
    otherDeductions: {
      total: otherDeductionsTotal,
      items: otherDeductionItems,
    },

    // Net
    totalDeductions,
    netSalary,

    // Employer cost
    bhxhEmployer: insurance.bhxh.employer,
    bhytEmployer: insurance.bhyt.employer,
    bhtnEmployer: insurance.bhtn.employer,
    totalEmployerCost: insurance.totals.employer,

    // All items
    allItems,
  }
}

// ═══════════════════════════════════════════════════════════════
// Batch Calculation
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate payroll for multiple employees
 */
export function calculatePayrollBatch(
  inputs: PayrollInput[]
): { results: PayrollResult[]; totals: PayrollTotals } {
  const results = inputs.map(calculatePayroll)

  const totals: PayrollTotals = {
    totalEmployees: results.length,
    totalGross: results.reduce((sum, r) => sum + r.grossSalary, 0),
    totalInsuranceEmployee: results.reduce((sum, r) => sum + r.totalInsuranceEmployee, 0),
    totalPIT: results.reduce((sum, r) => sum + r.pitAmount, 0),
    totalOtherDeductions: results.reduce((sum, r) => sum + r.otherDeductions.total, 0),
    totalDeductions: results.reduce((sum, r) => sum + r.totalDeductions, 0),
    totalNet: results.reduce((sum, r) => sum + r.netSalary, 0),
    totalInsuranceEmployer: results.reduce((sum, r) => sum + r.totalEmployerCost, 0),
  }

  return { results, totals }
}

export interface PayrollTotals {
  totalEmployees: number
  totalGross: number
  totalInsuranceEmployee: number
  totalPIT: number
  totalOtherDeductions: number
  totalDeductions: number
  totalNet: number
  totalInsuranceEmployer: number
}

// ═══════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════

export { calculatePIT, calculateInsurance }
export type { PITResult, InsuranceResult }
