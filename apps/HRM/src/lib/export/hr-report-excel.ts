import * as XLSX from "xlsx"

interface HeadcountMonth {
  month: number
  active: number
  probation: number
  total: number
}

interface Movement {
  employeeCode?: string
  fullName?: string
  startDate?: string | Date | null
  resignDate?: string | Date | null
  department?: { name: string } | null
  employee?: { employeeCode: string; fullName: string }
  effectiveDate?: string | Date | null
  payload?: Record<string, unknown>
}

interface ExpiringContract {
  employee: string
  contractNo: string | null
  officialTo: string | null
  daysLeft: number
}

interface HRReportInput {
  year: number
  quarter: string | null
  headcountByMonth: HeadcountMonth[]
  movements: {
    newHires: { count: number; employees: Movement[] }
    resignations: { count: number; employees: Movement[] }
    transfers: { count: number; employees: Movement[] }
    promotions: { count: number; employees: Movement[] }
  }
  turnoverRate: number
  expiringContracts: ExpiringContract[]
}

function formatDate(d: string | Date | null | undefined): string {
  if (!d) return ""
  return new Date(d).toLocaleDateString("vi-VN")
}

export function generateHRReportExcel(input: HRReportInput): Buffer {
  const wb = XLSX.utils.book_new()
  const periodLabel = input.quarter ? `Quý ${input.quarter}/${input.year}` : `Năm ${input.year}`
  const today = new Date().toLocaleDateString("vi-VN")

  // ─── Sheet 1: Tổng Quan ───
  const overviewHeader: (string | number)[][] = [
    [`BÁO CÁO NHÂN SỰ — ${periodLabel}`],
    ["Đơn vị: CÔNG TY CỔ PHẦN REAL-TIME ROBOTICS VIỆT NAM"],
    [`Ngày xuất: ${today}`],
    [],
    ["Tháng", "Active", "Thử Việc", "Tổng", "Tuyển Mới", "Nghỉ Việc", "Turnover %"],
  ]

  const overviewData = input.headcountByMonth.map((h) => {
    const monthNewHires = input.movements.newHires.employees.filter((e) => {
      const d = e.startDate ? new Date(e.startDate) : null
      return d && d.getMonth() + 1 === h.month
    }).length
    const monthResigns = input.movements.resignations.employees.filter((e) => {
      const d = e.resignDate ? new Date(e.resignDate) : null
      return d && d.getMonth() + 1 === h.month
    }).length
    const turnover = h.total > 0 ? Math.round((monthResigns / h.total) * 1000) / 10 : 0

    return [
      `T${h.month}`, h.active, h.probation, h.total, monthNewHires, monthResigns, turnover,
    ]
  })

  // Total row
  const totalActive = input.headcountByMonth.length > 0 ? input.headcountByMonth[input.headcountByMonth.length - 1].total : 0
  overviewData.push([
    "TỔNG", "", "", totalActive,
    input.movements.newHires.count,
    input.movements.resignations.count,
    input.turnoverRate,
  ])

  const wsOverview = XLSX.utils.aoa_to_sheet([...overviewHeader, ...overviewData])
  wsOverview["!cols"] = [
    { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
  ]
  XLSX.utils.book_append_sheet(wb, wsOverview, "Tổng Quan")

  // ─── Sheet 2: Biến Động ───
  const moveHeader: (string | number)[][] = [
    [`BIẾN ĐỘNG NHÂN SỰ — ${periodLabel}`],
    ["Đơn vị: CÔNG TY CỔ PHẦN REAL-TIME ROBOTICS VIỆT NAM"],
    [`Ngày xuất: ${today}`],
    [],
    ["Loại", "Mã NV", "Họ Tên", "Phòng Ban", "Ngày Hiệu Lực"],
  ]

  const moveData: (string | number)[][] = []

  for (const emp of input.movements.newHires.employees) {
    moveData.push([
      "Tuyển Mới",
      emp.employeeCode || "",
      emp.fullName || "",
      emp.department?.name || "",
      formatDate(emp.startDate),
    ])
  }

  for (const emp of input.movements.resignations.employees) {
    moveData.push([
      "Nghỉ Việc",
      emp.employeeCode || "",
      emp.fullName || "",
      emp.department?.name || "",
      formatDate(emp.resignDate),
    ])
  }

  for (const emp of input.movements.transfers.employees) {
    moveData.push([
      "Điều Chuyển",
      emp.employee?.employeeCode || "",
      emp.employee?.fullName || "",
      "",
      formatDate(emp.effectiveDate),
    ])
  }

  for (const emp of input.movements.promotions.employees) {
    moveData.push([
      "Thăng Chức",
      emp.employee?.employeeCode || "",
      emp.employee?.fullName || "",
      "",
      formatDate(emp.effectiveDate),
    ])
  }

  const wsMove = XLSX.utils.aoa_to_sheet([...moveHeader, ...moveData])
  wsMove["!cols"] = [
    { wch: 14 }, { wch: 16 }, { wch: 25 }, { wch: 20 }, { wch: 15 },
  ]
  XLSX.utils.book_append_sheet(wb, wsMove, "Biến Động")

  // ─── Sheet 3: HĐ Sắp Hết Hạn ───
  const contractHeader: (string | number)[][] = [
    ["HỢP ĐỒNG SẮP HẾT HẠN (60 NGÀY)"],
    ["Đơn vị: CÔNG TY CỔ PHẦN REAL-TIME ROBOTICS VIỆT NAM"],
    [`Ngày xuất: ${today}`],
    [],
    ["Mã NV + Họ Tên", "Số HĐ", "Ngày Hết Hạn", "Còn Lại (ngày)"],
  ]

  const contractData = input.expiringContracts.map((c) => [
    c.employee,
    c.contractNo || "",
    c.officialTo ? new Date(c.officialTo).toLocaleDateString("vi-VN") : "",
    c.daysLeft,
  ])

  if (contractData.length === 0) {
    contractData.push(["Không có HĐ sắp hết hạn", "", "", ""])
  }

  const wsContract = XLSX.utils.aoa_to_sheet([...contractHeader, ...contractData])
  wsContract["!cols"] = [
    { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
  ]
  XLSX.utils.book_append_sheet(wb, wsContract, "HĐ Sắp Hết Hạn")

  return Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }))
}
