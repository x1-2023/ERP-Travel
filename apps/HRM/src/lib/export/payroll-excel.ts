import * as XLSX from "xlsx"

// Prisma Decimal comes as string|number from JSON serialization
type DecimalLike = string | number | { toString(): string }

interface PayrollItemData {
  type: string
  amount: DecimalLike
}

interface EmployeePayrollData {
  employee: {
    employeeCode: string
    fullName: string
    nameNoAccent: string
    department: { name: string } | null
    position: { name: string } | null
    contracts: { type: string }[]
  }
  actualDays: DecimalLike
  standardDays: DecimalLike
  baseSalary: DecimalLike
  mealAllowance: DecimalLike
  phoneAllowance: DecimalLike
  fuelAllowance: DecimalLike
  perfAllowance: DecimalLike
  totalContractSalary: DecimalLike
  totalActualSalary: DecimalLike
  personalDeduction: DecimalLike
  dependentCount: number
  dependentDeduction: DecimalLike
  totalIncome: DecimalLike
  taxableIncome: DecimalLike
  insuranceBase: DecimalLike
  bhxhEmployee: DecimalLike
  bhytEmployee: DecimalLike
  bhtnEmployee: DecimalLike
  totalEmployeeIns: DecimalLike
  pitAmount: DecimalLike
  advanceDeduction: DecimalLike
  netSalary: DecimalLike
  bhxhEmployer: DecimalLike
  bhytEmployer: DecimalLike
  bhtnEmployer: DecimalLike
  bhtnldEmployer: DecimalLike
  totalEmployerIns: DecimalLike
  remainingLeave: DecimalLike
  bankAccount: string | null
  nameNoAccent: string | null
  items: PayrollItemData[]
}

interface PeriodData {
  month: number
  year: number
  status: string
  employeePayrolls: EmployeePayrollData[]
}

const HEADER_ROW = [
  // A - ĐỊNH DANH
  "STT", "Mã NV", "Họ Tên", "Phòng Ban", "Chức Vụ", "Loại HĐ",
  // B - CÔNG
  "Công Chuẩn", "Công TL",
  // C - LƯƠNG HĐ
  "Lương CB", "Cơm", "ĐT", "Xăng", "HQ", "Tổng HĐ",
  // D - LƯƠNG THỰC TẾ
  "Lương TT",
  // E - TĂNG THÊM
  "KPI T0", "KPI T-1", "KPI T-2", "OT Ngày TH", "OT T7/CN", "OT Lễ",
  "Trực Đêm", "Công Tác", "Phụ Cấp Khác", "Tổng Tăng",
  // F - GIẢM TRỪ CÁ NHÂN
  "Giảm Trừ BT", "Số NPT", "Giảm Trừ NPT",
  // G - TỔNG TN & CHỊU THUẾ
  "Tổng TN", "TN Chịu Thuế",
  // H - KHẤU TRỪ
  "BHXH NLĐ", "BHYT NLĐ", "BHTN NLĐ", "Tổng BH NLĐ", "Thuế TNCN", "Tạm Ứng", "Tổng Khấu Trừ",
  // I - THỰC LĨNH
  "THỰC LĨNH",
  // J - CÔNG TY ĐÓNG
  "BHXH CTY", "BHYT CTY", "BHTN CTY", "BHTNLĐ CTY", "Tổng BH CTY",
  // K - NGÂN HÀNG & PHÉP
  "Phép Còn", "Số TK", "Tên Không Dấu",
]

function n(val: DecimalLike | number): number {
  return Number(val)
}

function buildDataRow(ep: EmployeePayrollData, stt: number): (string | number)[] {
  const items: Record<string, number> = {}
  for (const item of ep.items) {
    items[item.type] = (items[item.type] ?? 0) + n(item.amount)
  }

  const totalAdditions =
    (items["KPI_CURRENT"] ?? 0) + (items["KPI_PREV1"] ?? 0) + (items["KPI_PREV2"] ?? 0) +
    (items["OT_WEEKDAY"] ?? 0) + (items["OT_WEEKEND"] ?? 0) + (items["OT_HOLIDAY"] ?? 0) +
    (items["NIGHT_SHIFT"] ?? 0) + (items["BUSINESS_TRIP"] ?? 0) + (items["OTHER_ALLOWANCE"] ?? 0)

  const totalDeductions = n(ep.totalEmployeeIns) + n(ep.pitAmount) + n(ep.advanceDeduction)

  return [
    stt,
    ep.employee.employeeCode,
    ep.employee.fullName,
    ep.employee.department?.name ?? "",
    ep.employee.position?.name ?? "",
    ep.employee.contracts?.[0]?.type ?? "",
    // B
    n(ep.standardDays), n(ep.actualDays),
    // C
    n(ep.baseSalary), n(ep.mealAllowance), n(ep.phoneAllowance),
    n(ep.fuelAllowance), n(ep.perfAllowance), n(ep.totalContractSalary),
    // D
    n(ep.totalActualSalary),
    // E
    items["KPI_CURRENT"] ?? 0, items["KPI_PREV1"] ?? 0, items["KPI_PREV2"] ?? 0,
    items["OT_WEEKDAY"] ?? 0, items["OT_WEEKEND"] ?? 0, items["OT_HOLIDAY"] ?? 0,
    items["NIGHT_SHIFT"] ?? 0, items["BUSINESS_TRIP"] ?? 0, items["OTHER_ALLOWANCE"] ?? 0,
    totalAdditions,
    // F
    n(ep.personalDeduction), ep.dependentCount, n(ep.dependentDeduction),
    // G
    n(ep.totalIncome), n(ep.taxableIncome),
    // H
    n(ep.bhxhEmployee), n(ep.bhytEmployee), n(ep.bhtnEmployee),
    n(ep.totalEmployeeIns), n(ep.pitAmount), n(ep.advanceDeduction), totalDeductions,
    // I
    n(ep.netSalary),
    // J
    n(ep.bhxhEmployer), n(ep.bhytEmployer), n(ep.bhtnEmployer),
    n(ep.bhtnldEmployer), n(ep.totalEmployerIns),
    // K
    n(ep.remainingLeave), ep.bankAccount ?? "", ep.nameNoAccent ?? ep.employee.nameNoAccent ?? "",
  ]
}

function buildSummaryRow(eps: EmployeePayrollData[]): (string | number)[] {
  const row = buildDataRow(eps[0], 0).map(() => 0 as string | number)
  row[0] = ""
  row[1] = ""
  row[2] = "TỔNG CỘNG"
  row[3] = ""
  row[4] = ""
  row[5] = ""

  for (const ep of eps) {
    const dataRow = buildDataRow(ep, 0)
    for (let i = 6; i < dataRow.length - 2; i++) {
      if (typeof dataRow[i] === "number") {
        (row[i] as number) += dataRow[i] as number
      }
    }
  }
  return row
}

export function generatePayrollExcel(period: PeriodData): Buffer {
  const wb = XLSX.utils.book_new()

  const titleRows = [
    [`BẢNG LƯƠNG THÁNG ${period.month}/${period.year}`],
    [`Công ty: CÔNG TY CỔ PHẦN REAL-TIME ROBOTICS VIỆT NAM`],
    [`Trạng thái: ${period.status}   Số NV: ${period.employeePayrolls.length}`],
    [],
  ]

  const dataRows = period.employeePayrolls.map((ep, idx) => buildDataRow(ep, idx + 1))
  const summaryRow = period.employeePayrolls.length > 0
    ? buildSummaryRow(period.employeePayrolls)
    : []

  const allRows = [
    ...titleRows,
    HEADER_ROW,
    ...dataRows,
    ...(summaryRow.length > 0 ? [summaryRow] : []),
  ]

  const ws = XLSX.utils.aoa_to_sheet(allRows)

  // Column widths
  ws["!cols"] = [
    { wch: 4 },   // STT
    { wch: 12 },  // Mã NV
    { wch: 22 },  // Họ Tên
    { wch: 18 },  // Phòng Ban
    { wch: 18 },  // Chức Vụ
    { wch: 10 },  // Loại HĐ
    { wch: 8 },   // Công Chuẩn
    { wch: 8 },   // Công TL
    ...Array(37).fill({ wch: 14 }),  // numeric columns
  ]

  XLSX.utils.book_append_sheet(wb, ws, `Lương ${period.month}-${period.year}`)

  // Sheet 2: Bank Transfer
  const bankHeaders = ["STT", "Tên Không Dấu", "Số TK", "Thực Lĩnh", "Ghi Chú"]
  const bankRows = period.employeePayrolls.map((ep, idx) => [
    idx + 1,
    ep.nameNoAccent ?? ep.employee.nameNoAccent ?? "",
    ep.bankAccount ?? "",
    n(ep.netSalary),
    `Luong T${period.month}/${period.year}`,
  ])
  const bankTotal = period.employeePayrolls.reduce((sum, ep) => sum + n(ep.netSalary), 0)

  const bankSheet = XLSX.utils.aoa_to_sheet([
    [`DANH SÁCH CHUYỂN KHOẢN LƯƠNG THÁNG ${period.month}/${period.year}`],
    [],
    bankHeaders,
    ...bankRows,
    ["", "TỔNG CỘNG", "", bankTotal, ""],
  ])

  bankSheet["!cols"] = [
    { wch: 4 }, { wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 20 },
  ]

  XLSX.utils.book_append_sheet(wb, bankSheet, "Chuyển Khoản")

  return Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }))
}
