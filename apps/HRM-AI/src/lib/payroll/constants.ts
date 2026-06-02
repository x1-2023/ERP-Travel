// src/lib/payroll/constants.ts
// Vietnam Payroll Constants 2024-2026

// ═══════════════════════════════════════════════════════════════
// PIT (Personal Income Tax) - Thuế TNCN
// ═══════════════════════════════════════════════════════════════

/**
 * Vietnam PIT Progressive Tax Brackets (7 brackets)
 * Based on Circular 111/2013/TT-BTC and amendments
 */
export const PIT_BRACKETS = [
  { from: 0, to: 5_000_000, rate: 0.05 },        // 5%
  { from: 5_000_000, to: 10_000_000, rate: 0.10 }, // 10%
  { from: 10_000_000, to: 18_000_000, rate: 0.15 }, // 15%
  { from: 18_000_000, to: 32_000_000, rate: 0.20 }, // 20%
  { from: 32_000_000, to: 52_000_000, rate: 0.25 }, // 25%
  { from: 52_000_000, to: 80_000_000, rate: 0.30 }, // 30%
  { from: 80_000_000, to: Infinity, rate: 0.35 },   // 35%
] as const

export type PITBracket = (typeof PIT_BRACKETS)[number]

/**
 * PIT Deductions
 */
export const PIT_DEDUCTIONS = {
  PERSONAL: 11_000_000,    // 11tr/tháng - Giảm trừ bản thân
  DEPENDENT: 4_400_000,    // 4.4tr/người/tháng - Giảm trừ người phụ thuộc
} as const

// ═══════════════════════════════════════════════════════════════
// Social Insurance - BHXH/BHYT/BHTN
// ═══════════════════════════════════════════════════════════════

/**
 * Insurance Rates (2024-2026)
 * Based on Labor Code 2019 and Social Insurance Law 2014
 */
export const INSURANCE_RATES = {
  BHXH: {
    EMPLOYEE: 0.08,    // 8% - NLĐ đóng
    EMPLOYER: 0.175,   // 17.5% - Công ty đóng (17% retirement + 0.5% sickness)
  },
  BHYT: {
    EMPLOYEE: 0.015,   // 1.5% - NLĐ đóng
    EMPLOYER: 0.03,    // 3% - Công ty đóng
  },
  BHTN: {
    EMPLOYEE: 0.01,    // 1% - NLĐ đóng
    EMPLOYER: 0.01,    // 1% - Công ty đóng
  },
  // Total employee: 8% + 1.5% + 1% = 10.5%
  // Total employer: 17.5% + 3% + 1% = 21.5%
  TOTAL_EMPLOYEE: 0.105,
  TOTAL_EMPLOYER: 0.215,
} as const

/**
 * Insurance Salary Cap
 * = 20 x Base Salary (mức lương cơ sở)
 * Base salary 2024: 2,340,000 VND
 * Cap = 20 x 2,340,000 = 46,800,000 VND
 */
export const INSURANCE_SALARY_CAP = 46_800_000

/**
 * Base salary (Lương cơ sở) for reference
 * Used for calculating insurance cap and some allowances
 */
export const BASE_SALARY_REFERENCE = 2_340_000

// ═══════════════════════════════════════════════════════════════
// Overtime Rates - Hệ số tăng ca
// ═══════════════════════════════════════════════════════════════

/**
 * OT Multipliers based on Labor Code 2019
 * Article 98 - Wages for overtime work, night shift work
 */
export const OT_RATES = {
  WEEKDAY: 1.5,      // 150% - Ngày thường
  WEEKEND: 2.0,      // 200% - Cuối tuần
  HOLIDAY: 3.0,      // 300% - Ngày lễ
  NIGHT_BONUS: 0.3,  // +30% - Phụ cấp đêm (22:00 - 06:00)
} as const

/**
 * Night shift hours definition
 */
export const NIGHT_SHIFT_HOURS = {
  START: 22, // 22:00
  END: 6,    // 06:00
} as const

// ═══════════════════════════════════════════════════════════════
// Work Settings - Cài đặt ngày công
// ═══════════════════════════════════════════════════════════════

export const WORK_SETTINGS = {
  STANDARD_WORK_DAYS: 22,      // Ngày công chuẩn/tháng
  STANDARD_WORK_HOURS: 8,      // Giờ công/ngày
  MAX_OT_HOURS_DAY: 4,         // Giờ OT tối đa/ngày
  MAX_OT_HOURS_MONTH: 40,      // Giờ OT tối đa/tháng
  MAX_OT_HOURS_YEAR: 200,      // Giờ OT tối đa/năm (300 với ngành đặc biệt)
} as const

// ═══════════════════════════════════════════════════════════════
// Payroll Status Labels - Nhãn trạng thái
// ═══════════════════════════════════════════════════════════════

export const PAYROLL_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Nháp',
  CALCULATING: 'Đang tính',
  SIMULATED: 'Đã mô phỏng',
  PENDING_APPROVAL: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  PAID: 'Đã thanh toán',
  CANCELLED: 'Đã hủy',
}

export const PAYROLL_STATUS_COLORS: Record<string, string> = {
  DRAFT: '#6B7280',           // Gray
  CALCULATING: '#F59E0B',     // Amber
  SIMULATED: '#3B82F6',       // Blue
  PENDING_APPROVAL: '#8B5CF6', // Purple
  APPROVED: '#10B981',        // Green
  PAID: '#059669',            // Emerald
  CANCELLED: '#EF4444',       // Red
}

// ═══════════════════════════════════════════════════════════════
// Component Category Labels - Nhãn danh mục
// ═══════════════════════════════════════════════════════════════

export const COMPONENT_CATEGORY_LABELS: Record<string, string> = {
  BASE_SALARY: 'Lương cơ bản',
  ALLOWANCE_TAXABLE: 'Phụ cấp chịu thuế',
  ALLOWANCE_NON_TAXABLE: 'Phụ cấp không thuế',
  OVERTIME: 'Tăng ca',
  BONUS: 'Thưởng',
  COMMISSION: 'Hoa hồng',
  INSURANCE_EMPLOYEE: 'BHXH/BHYT/BHTN (NLĐ)',
  INSURANCE_EMPLOYER: 'BHXH/BHYT/BHTN (Cty)',
  PIT: 'Thuế TNCN',
  ADVANCE: 'Tạm ứng',
  LOAN: 'Khoản vay',
  OTHER_DEDUCTION: 'Khấu trừ khác',
  OTHER_EARNING: 'Thu nhập khác',
}

export const ITEM_TYPE_LABELS: Record<string, string> = {
  EARNING: 'Thu nhập',
  DEDUCTION: 'Khấu trừ',
  EMPLOYER_COST: 'Chi phí công ty',
}

// ═══════════════════════════════════════════════════════════════
// Bank Codes - Mã ngân hàng
// ═══════════════════════════════════════════════════════════════

export const BANK_CODE_LABELS: Record<string, string> = {
  VCB: 'Vietcombank',
  TCB: 'Techcombank',
  ACB: 'ACB',
  BIDV: 'BIDV',
  VTB: 'Vietinbank',
  MB: 'MB Bank',
  VPB: 'VPBank',
  TPB: 'TPBank',
  STB: 'Sacombank',
  SHB: 'SHB',
  MSB: 'MSB',
  OCB: 'OCB',
  OTHER: 'Ngân hàng khác',
}

// ═══════════════════════════════════════════════════════════════
// Default Salary Components - Các khoản lương mặc định
// ═══════════════════════════════════════════════════════════════

export const DEFAULT_SALARY_COMPONENTS = [
  // Earnings
  { code: 'BASE', name: 'Lương cơ bản', category: 'BASE_SALARY', itemType: 'EARNING', isTaxable: true, isInsuranceable: true, isSystem: true, sortOrder: 1 },
  { code: 'ALLOWANCE_POSITION', name: 'Phụ cấp chức vụ', category: 'ALLOWANCE_TAXABLE', itemType: 'EARNING', isTaxable: true, isInsuranceable: false, isSystem: false, sortOrder: 2 },
  { code: 'ALLOWANCE_RESPONSIBILITY', name: 'Phụ cấp trách nhiệm', category: 'ALLOWANCE_TAXABLE', itemType: 'EARNING', isTaxable: true, isInsuranceable: false, isSystem: false, sortOrder: 3 },
  { code: 'ALLOWANCE_LUNCH', name: 'Phụ cấp ăn trưa', category: 'ALLOWANCE_NON_TAXABLE', itemType: 'EARNING', isTaxable: false, isInsuranceable: false, isSystem: false, sortOrder: 4 },
  { code: 'ALLOWANCE_TRANSPORT', name: 'Phụ cấp xăng xe', category: 'ALLOWANCE_NON_TAXABLE', itemType: 'EARNING', isTaxable: false, isInsuranceable: false, isSystem: false, sortOrder: 5 },
  { code: 'ALLOWANCE_PHONE', name: 'Phụ cấp điện thoại', category: 'ALLOWANCE_NON_TAXABLE', itemType: 'EARNING', isTaxable: false, isInsuranceable: false, isSystem: false, sortOrder: 6 },
  { code: 'OT_WEEKDAY', name: 'Tăng ca ngày thường', category: 'OVERTIME', itemType: 'EARNING', isTaxable: true, isInsuranceable: false, isSystem: true, sortOrder: 10 },
  { code: 'OT_WEEKEND', name: 'Tăng ca cuối tuần', category: 'OVERTIME', itemType: 'EARNING', isTaxable: true, isInsuranceable: false, isSystem: true, sortOrder: 11 },
  { code: 'OT_HOLIDAY', name: 'Tăng ca ngày lễ', category: 'OVERTIME', itemType: 'EARNING', isTaxable: true, isInsuranceable: false, isSystem: true, sortOrder: 12 },
  { code: 'OT_NIGHT', name: 'Phụ cấp đêm', category: 'OVERTIME', itemType: 'EARNING', isTaxable: true, isInsuranceable: false, isSystem: true, sortOrder: 13 },
  { code: 'BONUS', name: 'Thưởng', category: 'BONUS', itemType: 'EARNING', isTaxable: true, isInsuranceable: false, isSystem: false, sortOrder: 20 },
  { code: 'COMMISSION', name: 'Hoa hồng', category: 'COMMISSION', itemType: 'EARNING', isTaxable: true, isInsuranceable: false, isSystem: false, sortOrder: 21 },

  // Employee Deductions
  { code: 'BHXH_EE', name: 'BHXH (8%)', category: 'INSURANCE_EMPLOYEE', itemType: 'DEDUCTION', isTaxable: false, isInsuranceable: false, isSystem: true, sortOrder: 30 },
  { code: 'BHYT_EE', name: 'BHYT (1.5%)', category: 'INSURANCE_EMPLOYEE', itemType: 'DEDUCTION', isTaxable: false, isInsuranceable: false, isSystem: true, sortOrder: 31 },
  { code: 'BHTN_EE', name: 'BHTN (1%)', category: 'INSURANCE_EMPLOYEE', itemType: 'DEDUCTION', isTaxable: false, isInsuranceable: false, isSystem: true, sortOrder: 32 },
  { code: 'PIT', name: 'Thuế TNCN', category: 'PIT', itemType: 'DEDUCTION', isTaxable: false, isInsuranceable: false, isSystem: true, sortOrder: 40 },
  { code: 'ADVANCE', name: 'Tạm ứng', category: 'ADVANCE', itemType: 'DEDUCTION', isTaxable: false, isInsuranceable: false, isSystem: false, sortOrder: 50 },
  { code: 'LOAN', name: 'Trừ khoản vay', category: 'LOAN', itemType: 'DEDUCTION', isTaxable: false, isInsuranceable: false, isSystem: false, sortOrder: 51 },

  // Employer Costs
  { code: 'BHXH_ER', name: 'BHXH công ty (17.5%)', category: 'INSURANCE_EMPLOYER', itemType: 'EMPLOYER_COST', isTaxable: false, isInsuranceable: false, isSystem: true, sortOrder: 60 },
  { code: 'BHYT_ER', name: 'BHYT công ty (3%)', category: 'INSURANCE_EMPLOYER', itemType: 'EMPLOYER_COST', isTaxable: false, isInsuranceable: false, isSystem: true, sortOrder: 61 },
  { code: 'BHTN_ER', name: 'BHTN công ty (1%)', category: 'INSURANCE_EMPLOYER', itemType: 'EMPLOYER_COST', isTaxable: false, isInsuranceable: false, isSystem: true, sortOrder: 62 },
] as const

// ═══════════════════════════════════════════════════════════════
// Formatting Helpers
// ═══════════════════════════════════════════════════════════════

/**
 * Format number to VND currency
 */
export function formatVND(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(num)
}

/**
 * Format number with thousand separators
 */
export function formatNumber(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('vi-VN').format(num)
}

/**
 * Parse VND string to number
 */
export function parseVND(value: string): number {
  return parseFloat(value.replace(/[^\d.-]/g, '')) || 0
}
