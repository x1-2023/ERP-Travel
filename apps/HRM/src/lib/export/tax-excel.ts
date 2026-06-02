import * as XLSX from "xlsx"

interface TaxEmployeeData {
  employeeCode: string
  fullName: string
  nationalId: string
  taxCode: string
  totalIncome: number
  totalDeductions: number
  taxableIncome: number
  pitPaid: number
  dependentCount: number
}

interface TaxExcelInput {
  companyName: string
  companyTaxCode: string
  taxAgency: string
  year: number
  employees: TaxEmployeeData[]
}

export function generateTaxExcel(input: TaxExcelInput): Buffer {
  const wb = XLSX.utils.book_new()

  const headerRows: (string | number)[][] = [
    ["PHỤ LỤC BẢNG KÊ 05/QTT-TNCN"],
    [`Kỳ tính thuế: Năm ${input.year}`],
    [`Tên người nộp thuế: ${input.companyName}`],
    [`Mã số thuế: ${input.companyTaxCode}`],
    ...(input.taxAgency ? [[`Cơ quan thuế quản lý: ${input.taxAgency}`] as (string | number)[]] : []),
    [],
    ["BẢNG KÊ THU NHẬP CHỊU THUẾ VÀ THUẾ THU NHẬP CÁ NHÂN ĐÃ KHẤU TRỪ"],
    [],
    [
      "STT",
      "Họ và Tên",
      "Mã số thuế",
      "Số CCCD",
      "Số NPT",
      "Tổng TN chịu thuế",
      "Tổng giảm trừ",
      "TN tính thuế",
      "Thuế TNCN đã khấu trừ",
    ],
  ]

  const dataRows = input.employees.map((e, i) => [
    i + 1,
    e.fullName,
    e.taxCode,
    e.nationalId,
    e.dependentCount,
    Math.round(e.totalIncome),
    Math.round(e.totalDeductions),
    Math.round(e.taxableIncome),
    Math.round(e.pitPaid),
  ])

  // Totals
  const totalIncome = input.employees.reduce((s, e) => s + e.totalIncome, 0)
  const totalDeductions = input.employees.reduce((s, e) => s + e.totalDeductions, 0)
  const totalTaxable = input.employees.reduce((s, e) => s + e.taxableIncome, 0)
  const totalPIT = input.employees.reduce((s, e) => s + e.pitPaid, 0)

  const summaryRow: (string | number)[] = [
    "", "TỔNG CỘNG", "", "", "",
    Math.round(totalIncome),
    Math.round(totalDeductions),
    Math.round(totalTaxable),
    Math.round(totalPIT),
  ]

  const allRows = [...headerRows, ...dataRows, summaryRow]
  const ws = XLSX.utils.aoa_to_sheet(allRows)

  ws["!cols"] = [
    { wch: 5 },   // STT
    { wch: 25 },  // Họ Tên
    { wch: 15 },  // MST
    { wch: 15 },  // CCCD
    { wch: 8 },   // NPT
    { wch: 18 },  // TN chịu thuế
    { wch: 18 },  // Giảm trừ
    { wch: 18 },  // TN tính thuế
    { wch: 18 },  // Thuế khấu trừ
  ]

  XLSX.utils.book_append_sheet(wb, ws, "05-QTT-TNCN")

  return Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }))
}
