import * as XLSX from "xlsx"

interface EmployeeInsData {
  fullName: string
  dateOfBirth: Date | null
  gender: string
  nationalId: string | null
  insuranceCode: string | null
  startDate?: Date | null
  resignDate?: Date | null
  contracts: { baseSalary: unknown }[]
}

interface InsuranceExcelInput {
  companyName: string
  companyInsuranceCode: string
  month: number
  year: number
  allEmployees: EmployeeInsData[]
  newRegistrations: EmployeeInsData[]
  terminations: EmployeeInsData[]
}

function formatDate(d: Date | null | undefined): string {
  if (!d) return ""
  return new Date(d).toLocaleDateString("vi-VN")
}

function salary(e: EmployeeInsData): number {
  return e.contracts[0]?.baseSalary ? Number(e.contracts[0].baseSalary) : 0
}

export function generateInsuranceExcel(input: InsuranceExcelInput): Buffer {
  const wb = XLSX.utils.book_new()

  // ─── Sheet 1: D02-TS ───
  const headerRows: (string | number)[][] = [
    ["MẪU D02-TS"],
    [`Đơn vị: ${input.companyName}`],
    [`Mã đơn vị BHXH: ${input.companyInsuranceCode}`],
    [`DANH SÁCH LAO ĐỘNG THAM GIA BHXH, BHYT, BHTN, BHTNLĐ-BNN`],
    [`Tháng ${String(input.month).padStart(2, "0")}/${input.year}`],
    [],
    [
      "STT", "Họ và Tên", "Ngày Sinh", "Giới Tính",
      "Số CCCD", "Mã BHXH", "Lương Đóng BH",
      "Từ Ngày", "Nơi KCB",
    ],
  ]

  const dataRows = input.allEmployees.map((e, i) => [
    i + 1,
    e.fullName,
    formatDate(e.dateOfBirth),
    e.gender === "MALE" ? "Nam" : e.gender === "FEMALE" ? "Nữ" : "Khác",
    e.nationalId || "",
    e.insuranceCode || "",
    salary(e),
    formatDate(e.startDate),
    "",
  ])

  // Summary row
  const totalSalary = input.allEmployees.reduce((s, e) => s + salary(e), 0)
  const summaryRow: (string | number)[] = [
    "", "TỔNG CỘNG", "", "", "", "", totalSalary, "", "",
  ]

  const allRows = [...headerRows, ...dataRows, summaryRow]
  const ws = XLSX.utils.aoa_to_sheet(allRows)

  ws["!cols"] = [
    { wch: 5 },   // STT
    { wch: 25 },  // Họ Tên
    { wch: 12 },  // Ngày Sinh
    { wch: 8 },   // GT
    { wch: 15 },  // CCCD
    { wch: 15 },  // Mã BHXH
    { wch: 18 },  // Lương
    { wch: 12 },  // Từ Ngày
    { wch: 20 },  // Nơi KCB
  ]

  XLSX.utils.book_append_sheet(wb, ws, "D02-TS")

  // ─── Sheet 2: Đăng ký mới ───
  if (input.newRegistrations.length > 0) {
    const newHeader: (string | number)[][] = [
      [`ĐĂNG KÝ MỚI - Tháng ${input.month}/${input.year}`],
      [],
      ["STT", "Họ và Tên", "Ngày Sinh", "GT", "CCCD", "Mã BHXH", "Lương Đóng BH", "Từ Ngày"],
    ]
    const newRows = input.newRegistrations.map((e, i) => [
      i + 1, e.fullName, formatDate(e.dateOfBirth),
      e.gender === "MALE" ? "Nam" : "Nữ",
      e.nationalId || "", e.insuranceCode || "", salary(e), formatDate(e.startDate),
    ])
    const wsNew = XLSX.utils.aoa_to_sheet([...newHeader, ...newRows])
    wsNew["!cols"] = [{ wch: 5 }, { wch: 25 }, { wch: 12 }, { wch: 6 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 12 }]
    XLSX.utils.book_append_sheet(wb, wsNew, "Đăng Ký Mới")
  }

  // ─── Sheet 3: Thôi tham gia ───
  if (input.terminations.length > 0) {
    const termHeader: (string | number)[][] = [
      [`THÔI THAM GIA - Tháng ${input.month}/${input.year}`],
      [],
      ["STT", "Họ và Tên", "Ngày Sinh", "GT", "CCCD", "Mã BHXH", "Lương Đóng BH", "Đến Ngày"],
    ]
    const termRows = input.terminations.map((e, i) => [
      i + 1, e.fullName, formatDate(e.dateOfBirth),
      e.gender === "MALE" ? "Nam" : "Nữ",
      e.nationalId || "", e.insuranceCode || "", salary(e), formatDate(e.resignDate),
    ])
    const wsTerm = XLSX.utils.aoa_to_sheet([...termHeader, ...termRows])
    wsTerm["!cols"] = [{ wch: 5 }, { wch: 25 }, { wch: 12 }, { wch: 6 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 12 }]
    XLSX.utils.book_append_sheet(wb, wsTerm, "Thôi TG")
  }

  return Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }))
}
