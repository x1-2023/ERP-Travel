// src/lib/compliance/tax/constants.ts
// Vietnam Personal Income Tax (TNCN) Constants

// ═══════════════════════════════════════════════════════════════
// TAX BRACKETS (Biểu thuế lũy tiến từng phần)
// Based on Law No. 04/2007/QH12 and subsequent amendments
// ═══════════════════════════════════════════════════════════════

/**
 * Vietnam Progressive Tax Brackets for Employment Income
 * Applied to monthly taxable income
 */
export const TAX_BRACKETS = [
  {
    level: 1,
    minIncome: 0,
    maxIncome: 5_000_000,
    rate: 0.05, // 5%
    quickDeduction: 0,
    description: 'Đến 5 triệu đồng',
  },
  {
    level: 2,
    minIncome: 5_000_000,
    maxIncome: 10_000_000,
    rate: 0.10, // 10%
    quickDeduction: 250_000,
    description: 'Trên 5 triệu đến 10 triệu đồng',
  },
  {
    level: 3,
    minIncome: 10_000_000,
    maxIncome: 18_000_000,
    rate: 0.15, // 15%
    quickDeduction: 750_000,
    description: 'Trên 10 triệu đến 18 triệu đồng',
  },
  {
    level: 4,
    minIncome: 18_000_000,
    maxIncome: 32_000_000,
    rate: 0.20, // 20%
    quickDeduction: 1_650_000,
    description: 'Trên 18 triệu đến 32 triệu đồng',
  },
  {
    level: 5,
    minIncome: 32_000_000,
    maxIncome: 52_000_000,
    rate: 0.25, // 25%
    quickDeduction: 3_250_000,
    description: 'Trên 32 triệu đến 52 triệu đồng',
  },
  {
    level: 6,
    minIncome: 52_000_000,
    maxIncome: 80_000_000,
    rate: 0.30, // 30%
    quickDeduction: 5_850_000,
    description: 'Trên 52 triệu đến 80 triệu đồng',
  },
  {
    level: 7,
    minIncome: 80_000_000,
    maxIncome: Number.MAX_SAFE_INTEGER,
    rate: 0.35, // 35%
    quickDeduction: 9_850_000,
    description: 'Trên 80 triệu đồng',
  },
] as const

// ═══════════════════════════════════════════════════════════════
// DEDUCTIONS (Giảm trừ gia cảnh)
// ═══════════════════════════════════════════════════════════════

/**
 * Personal and Dependent Deductions
 * As of 2024 (Resolution 954/2020/UBTVQH14)
 */
export const TAX_DEDUCTIONS = {
  // Giảm trừ bản thân
  PERSONAL: 11_000_000, // 11 triệu/tháng

  // Giảm trừ người phụ thuộc
  DEPENDENT: 4_400_000, // 4.4 triệu/người/tháng

  // Annual equivalents
  PERSONAL_YEARLY: 132_000_000, // 132 triệu/năm
  DEPENDENT_YEARLY: 52_800_000, // 52.8 triệu/người/năm
} as const

// ═══════════════════════════════════════════════════════════════
// INSURANCE DEDUCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Mandatory insurance contributions (BHXH, BHYT, BHTN)
 * These are deducted from gross income before tax calculation
 */
export const INSURANCE_DEDUCTION_RATES = {
  EMPLOYEE_TOTAL: 0.105, // 10.5% = 8% BHXH + 1.5% BHYT + 1% BHTN
} as const

// ═══════════════════════════════════════════════════════════════
// OTHER DEDUCTIONS
// ═══════════════════════════════════════════════════════════════

export const OTHER_DEDUCTIONS = {
  // Retirement fund contributions (Quỹ hưu trí tự nguyện)
  MAX_RETIREMENT_CONTRIBUTION: 1_000_000, // 1 triệu/tháng

  // Charity donations (no limit but requires documentation)
  CHARITY_DEDUCTIBLE: true,
} as const

// ═══════════════════════════════════════════════════════════════
// TAX SETTLEMENT STATUS
// ═══════════════════════════════════════════════════════════════

export const TAX_SETTLEMENT_STATUS = {
  DRAFT: { label: 'Nháp', color: 'gray' },
  FINALIZED: { label: 'Hoàn thành', color: 'blue' },
  SUBMITTED: { label: 'Đã nộp', color: 'green' },
} as const

// ═══════════════════════════════════════════════════════════════
// DEPENDENT TYPES
// ═══════════════════════════════════════════════════════════════

export const DEPENDENT_TYPES = {
  SPOUSE: {
    code: '01',
    name: 'Vợ/Chồng',
    description: 'Không có thu nhập hoặc thu nhập < 1 triệu/tháng',
  },
  CHILD_UNDER_18: {
    code: '02',
    name: 'Con dưới 18 tuổi',
    description: 'Bao gồm con đẻ, con nuôi, con riêng',
  },
  CHILD_STUDENT: {
    code: '03',
    name: 'Con từ 18-23 tuổi đang học',
    description: 'Đang học đại học, cao đẳng, trung cấp',
  },
  CHILD_DISABLED: {
    code: '04',
    name: 'Con bị khuyết tật',
    description: 'Không có khả năng lao động',
  },
  PARENT: {
    code: '05',
    name: 'Cha mẹ',
    description: 'Cha mẹ đẻ, cha mẹ vợ/chồng, cha mẹ nuôi',
  },
  OTHER: {
    code: '09',
    name: 'Người phụ thuộc khác',
    description: 'Anh chị em ruột, ông bà, cháu...',
  },
} as const

// ═══════════════════════════════════════════════════════════════
// HELPER TYPES
// ═══════════════════════════════════════════════════════════════

export interface TaxCalculationResult {
  grossIncome: number
  insuranceDeduction: number
  personalDeduction: number
  dependentDeduction: number
  otherDeductions: number
  taxableIncome: number
  taxAmount: number
  netIncome: number
  effectiveRate: number
  bracketLevel: number
}

export interface AnnualTaxSummary {
  year: number
  totalGrossIncome: number
  totalInsuranceDeduction: number
  totalPersonalDeduction: number
  totalDependentDeduction: number
  totalOtherDeductions: number
  totalTaxableIncome: number
  totalTaxAmount: number
  totalTaxPaid: number
  taxRefund: number
  taxOwed: number
}

export type TaxSettlementStatusType = keyof typeof TAX_SETTLEMENT_STATUS
export type DependentType = keyof typeof DEPENDENT_TYPES
