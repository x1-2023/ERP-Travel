// PIT Calculator — 7 Bậc Thuế TNCN Việt Nam
// Configurable via PAYROLL_CONFIG env or defaults below
// Áp dụng cho thu nhập tính thuế/tháng

// ═══════════════════════════════════════════════════════════
// CẤU HÌNH THUẾ & BẢO HIỂM — Cập nhật khi Nghị định/Thông tư mới
// ═══════════════════════════════════════════════════════════

const PIT_BRACKETS = [
  { from: 0, to: 5_000_000, rate: 0.05 },
  { from: 5_000_000, to: 10_000_000, rate: 0.10 },
  { from: 10_000_000, to: 18_000_000, rate: 0.15 },
  { from: 18_000_000, to: 32_000_000, rate: 0.20 },
  { from: 32_000_000, to: 52_000_000, rate: 0.25 },
  { from: 52_000_000, to: 80_000_000, rate: 0.30 },
  { from: 80_000_000, to: Infinity, rate: 0.35 },
]

/** Tính thuế TNCN theo phương pháp lũy tiến từng phần */
export function calculatePIT(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0
  let tax = 0
  for (const bracket of PIT_BRACKETS) {
    if (taxableIncome <= bracket.from) break
    const taxableInBracket = Math.min(taxableIncome, bracket.to) - bracket.from
    tax += taxableInBracket * bracket.rate
  }
  return Math.round(tax)
}

// Hằng số bảo hiểm — Nghị định 58/2020, cập nhật 2024
export const INSURANCE_RATES = {
  employee: { bhxh: 0.08, bhyt: 0.015, bhtn: 0.01 }, // 10.5%
  employer: { bhxh: 0.17, bhyt: 0.03, bhtn: 0.01, bhtnld: 0.005 }, // 21.5%
}

// Giảm trừ gia cảnh — Nghị quyết 954/2020/UBTVQH14
// Cập nhật: thay đổi khi có Nghị quyết mới
export const TAX_DEDUCTIONS = {
  personal: Number(process.env.PIT_PERSONAL_DEDUCTION) || 11_000_000,
  dependent: Number(process.env.PIT_DEPENDENT_DEDUCTION) || 4_400_000,
}

// Phụ cấp không tính thuế (Thông tư 78/2021/TT-BTC)
export const TAX_FREE_CAPS = {
  meal: 730_000, // Tiền cơm tối đa 730k/tháng
  phone: 1_000_000, // Điện thoại tối đa 1 triệu/tháng (theo quy chế công ty)
  fuel: 2_000_000, // Xăng xe tối đa 2 triệu/tháng (theo quy chế công ty)
}

// Mức lương cơ sở & trần BHXH (Nghị định 73/2024, áp dụng từ 01/07/2024)
export const INSURANCE_CAPS = {
  minimumWage: 2_340_000, // Lương cơ sở 2024
  maxMultiplier: 20, // Trần BHXH = 20× lương cơ sở
  get maxInsuranceBase() {
    return this.minimumWage * this.maxMultiplier // 46.800.000
  },
}
