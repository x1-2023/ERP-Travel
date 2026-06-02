// src/lib/compliance/insurance/constants.ts
// Vietnam Social Insurance (BHXH) Constants and Rates

// ═══════════════════════════════════════════════════════════════
// INSURANCE RATES (2024)
// ═══════════════════════════════════════════════════════════════

/**
 * Vietnam Social Insurance Contribution Rates
 * Based on Circular 59/2015/TT-BLDTBXH and subsequent updates
 */
export const INSURANCE_RATES = {
  // BHXH - Bảo hiểm Xã hội (Social Insurance)
  SOCIAL: {
    EMPLOYEE: 0.08, // 8%
    EMPLOYER: 0.175, // 17.5% (14% retirement + 0.5% sickness + 3% maternity)
    TOTAL: 0.255,
  },

  // BHYT - Bảo hiểm Y tế (Health Insurance)
  HEALTH: {
    EMPLOYEE: 0.015, // 1.5%
    EMPLOYER: 0.03, // 3%
    TOTAL: 0.045,
  },

  // BHTN - Bảo hiểm Thất nghiệp (Unemployment Insurance)
  UNEMPLOYMENT: {
    EMPLOYEE: 0.01, // 1%
    EMPLOYER: 0.01, // 1%
    TOTAL: 0.02,
  },

  // Tổng cộng (Total)
  TOTAL: {
    EMPLOYEE: 0.105, // 10.5% = 8% + 1.5% + 1%
    EMPLOYER: 0.215, // 21.5% = 17.5% + 3% + 1%
    COMBINED: 0.32, // 32%
  },
} as const

// ═══════════════════════════════════════════════════════════════
// SALARY CAP (Mức trần lương đóng BHXH)
// ═══════════════════════════════════════════════════════════════

/**
 * Maximum salary for insurance contribution
 * Currently set at 20x base salary (Mức lương cơ sở)
 */
export const INSURANCE_SALARY_CAP = {
  // Mức lương cơ sở 2024: 1,800,000 VND
  BASE_SALARY_2024: 1_800_000,
  MULTIPLIER: 20,
  // Max = 20 x 1,800,000 = 36,000,000 VND
  MAX_SALARY_2024: 36_000_000,
} as const

// ═══════════════════════════════════════════════════════════════
// UNEMPLOYMENT INSURANCE CAP
// ═══════════════════════════════════════════════════════════════

/**
 * Unemployment Insurance salary cap
 * Currently set at 20x regional minimum wage
 */
export const UNEMPLOYMENT_SALARY_CAP = {
  // Vùng I - Minimum wage: 4,680,000 VND (2024)
  REGION_1_MIN_WAGE: 4_680_000,
  REGION_1_CAP: 93_600_000, // 20x

  // Vùng II - Minimum wage: 4,160,000 VND
  REGION_2_MIN_WAGE: 4_160_000,
  REGION_2_CAP: 83_200_000,

  // Vùng III - Minimum wage: 3,640,000 VND
  REGION_3_MIN_WAGE: 3_640_000,
  REGION_3_CAP: 72_800_000,

  // Vùng IV - Minimum wage: 3,250,000 VND
  REGION_4_MIN_WAGE: 3_250_000,
  REGION_4_CAP: 65_000_000,
} as const

// ═══════════════════════════════════════════════════════════════
// REPORT TYPES
// ═══════════════════════════════════════════════════════════════

export const INSURANCE_REPORT_TYPES = {
  D02_TS: {
    code: 'D02-TS',
    name: 'Báo cáo tăng lao động',
    description: 'Danh sách lao động tham gia BHXH, BHYT, BHTN',
  },
  D03_TS: {
    code: 'D03-TS',
    name: 'Báo cáo giảm lao động',
    description: 'Danh sách lao động dừng đóng BHXH, BHYT, BHTN',
  },
  C12_TS: {
    code: 'C12-TS',
    name: 'Bảng kê đóng BHXH, BHYT, BHTN',
    description: 'Bảng kê tổng hợp số tiền đóng hàng tháng',
  },
  TK1_TS: {
    code: 'TK1-TS',
    name: 'Tờ khai tham gia BHXH',
    description: 'Tờ khai đăng ký tham gia BHXH lần đầu',
  },
} as const

// ═══════════════════════════════════════════════════════════════
// REPORT STATUS LABELS
// ═══════════════════════════════════════════════════════════════

export const INSURANCE_REPORT_STATUS = {
  DRAFT: { label: 'Nháp', color: 'gray' },
  PENDING_REVIEW: { label: 'Chờ duyệt', color: 'yellow' },
  SUBMITTED: { label: 'Đã nộp', color: 'blue' },
  ACCEPTED: { label: 'Đã chấp nhận', color: 'green' },
  REJECTED: { label: 'Từ chối', color: 'red' },
} as const

// ═══════════════════════════════════════════════════════════════
// CHANGE TYPES (For D02/D03 reports)
// ═══════════════════════════════════════════════════════════════

export const INSURANCE_CHANGE_TYPES = {
  // D02 - Increase types
  NEW_HIRE: {
    code: '01',
    name: 'Tuyển mới',
    reportType: 'D02',
  },
  RETURN_FROM_LEAVE: {
    code: '02',
    name: 'Quay lại sau nghỉ không lương',
    reportType: 'D02',
  },
  SALARY_INCREASE: {
    code: '03',
    name: 'Tăng lương',
    reportType: 'D02',
  },
  TRANSFER_IN: {
    code: '04',
    name: 'Chuyển đến từ đơn vị khác',
    reportType: 'D02',
  },

  // D03 - Decrease types
  RESIGNATION: {
    code: '11',
    name: 'Thôi việc',
    reportType: 'D03',
  },
  TERMINATION: {
    code: '12',
    name: 'Chấm dứt HĐLĐ',
    reportType: 'D03',
  },
  UNPAID_LEAVE: {
    code: '13',
    name: 'Nghỉ không lương',
    reportType: 'D03',
  },
  SALARY_DECREASE: {
    code: '14',
    name: 'Giảm lương',
    reportType: 'D03',
  },
  TRANSFER_OUT: {
    code: '15',
    name: 'Chuyển đi đơn vị khác',
    reportType: 'D03',
  },
  DEATH: {
    code: '16',
    name: 'Chết',
    reportType: 'D03',
  },
  RETIREMENT: {
    code: '17',
    name: 'Nghỉ hưu',
    reportType: 'D03',
  },
} as const

// ═══════════════════════════════════════════════════════════════
// HELPER TYPES
// ═══════════════════════════════════════════════════════════════

export type InsuranceReportType = keyof typeof INSURANCE_REPORT_TYPES
export type InsuranceReportStatusType = keyof typeof INSURANCE_REPORT_STATUS
export type InsuranceChangeType = keyof typeof INSURANCE_CHANGE_TYPES

export interface InsuranceContribution {
  baseSalary: number
  cappedSalary: number
  employee: {
    social: number
    health: number
    unemployment: number
    total: number
  }
  employer: {
    social: number
    health: number
    unemployment: number
    total: number
  }
  total: number
}
