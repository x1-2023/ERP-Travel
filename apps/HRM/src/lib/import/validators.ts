import { prisma } from "@/lib/prisma"
import type { ColumnMapping } from "@/lib/ai/import-mapper"
import { parseDate, parseCurrency, parseGender, parseContractType, parseTime } from "./parsers"

export interface ImportError {
  row: number
  field: string
  message: string
  severity: "error" | "warning"
}

export interface DryRunResult {
  totalRows: number
  validRows: number
  errorRows: number
  warningRows: number
  errors: ImportError[]
  preview: Record<string, unknown>[]
}

// ═══════════════ APPLY MAPPING ═══════════════

export function applyMapping(
  rawRows: Record<string, unknown>[],
  mapping: ColumnMapping
): Record<string, unknown>[] {
  return rawRows.map((row) => {
    const mapped: Record<string, unknown> = {}
    for (const m of mapping.mappings) {
      if (row[m.source] !== undefined && row[m.source] !== null && row[m.source] !== "") {
        mapped[m.target] = row[m.source]
      }
    }
    return mapped
  })
}

// ═══════════════ EMPLOYEE DRY RUN ═══════════════

export async function dryRunEmployees(
  rows: Record<string, unknown>[],
  mapping: ColumnMapping
): Promise<DryRunResult> {
  const mappedRows = applyMapping(rows, mapping)
  const errors: ImportError[] = []
  const seenNationalIds = new Set<string>()

  // Load existing employees for duplicate check
  const existingNationalIds = await prisma.employee.findMany({
    where: { nationalId: { not: null } },
    select: { nationalId: true },
  })
  const existingIdSet = new Set(existingNationalIds.map((e) => e.nationalId))

  // Load existing departments
  const existingDepts = await prisma.department.findMany({ select: { name: true } })
  const deptNames = new Set(existingDepts.map((d) => d.name.toLowerCase()))

  for (let i = 0; i < mappedRows.length; i++) {
    const row = mappedRows[i]
    const rowNum = i + 2 // Excel row (header is row 1)

    // Required: fullName
    if (!row.fullName || !String(row.fullName).trim()) {
      errors.push({ row: rowNum, field: "fullName", message: "Họ tên là bắt buộc", severity: "error" })
    }

    // Required: gender
    if (row.gender) {
      const g = parseGender(row.gender)
      if (!g) {
        errors.push({ row: rowNum, field: "gender", message: `Giới tính không hợp lệ: "${row.gender}"`, severity: "error" })
      }
    }

    // dateOfBirth format
    if (row.dateOfBirth) {
      const d = parseDate(row.dateOfBirth)
      if (!d) {
        errors.push({ row: rowNum, field: "dateOfBirth", message: `Ngày sinh không hợp lệ: "${row.dateOfBirth}"`, severity: "error" })
      }
    }

    // Phone format
    if (row.phone) {
      const phone = String(row.phone).replace(/\s/g, "")
      if (!/^0\d{9,10}$/.test(phone) && !/^\+84\d{9,10}$/.test(phone)) {
        errors.push({ row: rowNum, field: "phone", message: `SĐT không hợp lệ: "${row.phone}"`, severity: "warning" })
      }
    }

    // Duplicate nationalId within file
    if (row.nationalId) {
      const nid = String(row.nationalId).trim()
      if (seenNationalIds.has(nid)) {
        errors.push({ row: rowNum, field: "nationalId", message: `CCCD trùng trong file: "${nid}"`, severity: "error" })
      } else {
        seenNationalIds.add(nid)
      }
      if (existingIdSet.has(nid)) {
        errors.push({ row: rowNum, field: "nationalId", message: `CCCD đã tồn tại trong hệ thống: "${nid}"`, severity: "error" })
      }
    }

    // Warn for new departments
    if (row.departmentName) {
      const deptName = String(row.departmentName).trim().toLowerCase()
      if (!deptNames.has(deptName)) {
        errors.push({ row: rowNum, field: "departmentName", message: `Phòng ban mới sẽ được tạo: "${row.departmentName}"`, severity: "warning" })
      }
    }
  }

  const errorRowNums = new Set(errors.filter((e) => e.severity === "error").map((e) => e.row))
  const warningRowNums = new Set(errors.filter((e) => e.severity === "warning").map((e) => e.row))

  return {
    totalRows: mappedRows.length,
    validRows: mappedRows.length - errorRowNums.size,
    errorRows: errorRowNums.size,
    warningRows: warningRowNums.size,
    errors,
    preview: mappedRows.slice(0, 10),
  }
}

// ═══════════════ PAYROLL DRY RUN ═══════════════

export async function dryRunPayroll(
  rows: Record<string, unknown>[],
  mapping: ColumnMapping
): Promise<DryRunResult> {
  const mappedRows = applyMapping(rows, mapping)
  const errors: ImportError[] = []

  // Load employees for lookup
  const employees = await prisma.employee.findMany({
    select: { employeeCode: true, fullName: true },
  })
  const empCodes = new Set(employees.map((e) => e.employeeCode))
  const empNames = new Set(employees.map((e) => e.fullName.toLowerCase()))

  for (let i = 0; i < mappedRows.length; i++) {
    const row = mappedRows[i]
    const rowNum = i + 2

    // Employee lookup
    const code = row.employeeCode ? String(row.employeeCode).trim() : ""
    const name = row.employeeName ? String(row.employeeName).trim().toLowerCase() : ""
    if (!code && !name) {
      errors.push({ row: rowNum, field: "employeeCode", message: "Mã NV hoặc Tên NV là bắt buộc", severity: "error" })
    } else if (code && !empCodes.has(code)) {
      errors.push({ row: rowNum, field: "employeeCode", message: `Mã NV không tồn tại: "${code}"`, severity: "error" })
    } else if (!code && name && !empNames.has(name)) {
      errors.push({ row: rowNum, field: "employeeName", message: `Tên NV không tìm thấy: "${row.employeeName}"`, severity: "warning" })
    }

    // Month/Year
    const month = Number(row.month)
    const year = Number(row.year)
    if (!row.month || isNaN(month) || month < 1 || month > 12) {
      errors.push({ row: rowNum, field: "month", message: `Tháng không hợp lệ: "${row.month}"`, severity: "error" })
    }
    if (!row.year || isNaN(year) || year < 2020 || year > 2030) {
      errors.push({ row: rowNum, field: "year", message: `Năm không hợp lệ: "${row.year}"`, severity: "error" })
    }

    // Salary numbers
    for (const field of ["baseSalary", "mealAllowance", "phoneAllowance", "fuelAllowance", "perfAllowance"]) {
      if (row[field]) {
        const val = parseCurrency(row[field])
        if (val === null) {
          errors.push({ row: rowNum, field, message: `Số tiền không hợp lệ: "${row[field]}"`, severity: "error" })
        }
      }
    }
  }

  const errorRowNums = new Set(errors.filter((e) => e.severity === "error").map((e) => e.row))
  const warningRowNums = new Set(errors.filter((e) => e.severity === "warning").map((e) => e.row))

  return {
    totalRows: mappedRows.length,
    validRows: mappedRows.length - errorRowNums.size,
    errorRows: errorRowNums.size,
    warningRows: warningRowNums.size,
    errors,
    preview: mappedRows.slice(0, 10),
  }
}

// ═══════════════ ATTENDANCE DRY RUN ═══════════════

export async function dryRunAttendance(
  rows: Record<string, unknown>[],
  mapping: ColumnMapping
): Promise<DryRunResult> {
  const mappedRows = applyMapping(rows, mapping)
  const errors: ImportError[] = []

  const employees = await prisma.employee.findMany({
    select: { employeeCode: true, fullName: true },
  })
  const empCodes = new Set(employees.map((e) => e.employeeCode))

  for (let i = 0; i < mappedRows.length; i++) {
    const row = mappedRows[i]
    const rowNum = i + 2

    const code = row.employeeCode ? String(row.employeeCode).trim() : ""
    const name = row.employeeName ? String(row.employeeName).trim() : ""
    if (!code && !name) {
      errors.push({ row: rowNum, field: "employeeCode", message: "Mã NV hoặc Tên NV là bắt buộc", severity: "error" })
    } else if (code && !empCodes.has(code)) {
      errors.push({ row: rowNum, field: "employeeCode", message: `Mã NV không tồn tại: "${code}"`, severity: "error" })
    }

    if (!row.date) {
      errors.push({ row: rowNum, field: "date", message: "Ngày là bắt buộc", severity: "error" })
    } else if (!parseDate(row.date)) {
      errors.push({ row: rowNum, field: "date", message: `Ngày không hợp lệ: "${row.date}"`, severity: "error" })
    }

    if (row.checkIn && !parseTime(row.checkIn)) {
      errors.push({ row: rowNum, field: "checkIn", message: `Giờ vào không hợp lệ: "${row.checkIn}"`, severity: "warning" })
    }
    if (row.checkOut && !parseTime(row.checkOut)) {
      errors.push({ row: rowNum, field: "checkOut", message: `Giờ ra không hợp lệ: "${row.checkOut}"`, severity: "warning" })
    }
  }

  const errorRowNums = new Set(errors.filter((e) => e.severity === "error").map((e) => e.row))
  const warningRowNums = new Set(errors.filter((e) => e.severity === "warning").map((e) => e.row))

  return {
    totalRows: mappedRows.length,
    validRows: mappedRows.length - errorRowNums.size,
    errorRows: errorRowNums.size,
    warningRows: warningRowNums.size,
    errors,
    preview: mappedRows.slice(0, 10),
  }
}

// ═══════════════ CONTRACTS DRY RUN ═══════════════

export async function dryRunContracts(
  rows: Record<string, unknown>[],
  mapping: ColumnMapping
): Promise<DryRunResult> {
  const mappedRows = applyMapping(rows, mapping)
  const errors: ImportError[] = []

  const employees = await prisma.employee.findMany({
    select: { employeeCode: true, fullName: true },
  })
  const empCodes = new Set(employees.map((e) => e.employeeCode))

  for (let i = 0; i < mappedRows.length; i++) {
    const row = mappedRows[i]
    const rowNum = i + 2

    const code = row.employeeCode ? String(row.employeeCode).trim() : ""
    const name = row.employeeName ? String(row.employeeName).trim() : ""
    if (!code && !name) {
      errors.push({ row: rowNum, field: "employeeCode", message: "Mã NV hoặc Tên NV là bắt buộc", severity: "error" })
    } else if (code && !empCodes.has(code)) {
      errors.push({ row: rowNum, field: "employeeCode", message: `Mã NV không tồn tại: "${code}"`, severity: "error" })
    }

    if (row.contractType) {
      const ct = parseContractType(row.contractType)
      if (!ct) {
        errors.push({ row: rowNum, field: "contractType", message: `Loại HĐ không hợp lệ: "${row.contractType}"`, severity: "error" })
      }
    } else {
      errors.push({ row: rowNum, field: "contractType", message: "Loại HĐ là bắt buộc", severity: "error" })
    }

    for (const field of ["probationFrom", "probationTo", "officialFrom", "officialTo"]) {
      if (row[field] && !parseDate(row[field])) {
        errors.push({ row: rowNum, field, message: `Ngày không hợp lệ: "${row[field]}"`, severity: "error" })
      }
    }

    for (const field of ["baseSalary", "mealAllowance", "phoneAllowance", "fuelAllowance", "perfAllowance", "kpiAmount"]) {
      if (row[field]) {
        const val = parseCurrency(row[field])
        if (val === null) {
          errors.push({ row: rowNum, field, message: `Số tiền không hợp lệ: "${row[field]}"`, severity: "error" })
        }
      }
    }
  }

  const errorRowNums = new Set(errors.filter((e) => e.severity === "error").map((e) => e.row))
  const warningRowNums = new Set(errors.filter((e) => e.severity === "warning").map((e) => e.row))

  return {
    totalRows: mappedRows.length,
    validRows: mappedRows.length - errorRowNums.size,
    errorRows: errorRowNums.size,
    warningRows: warningRowNums.size,
    errors,
    preview: mappedRows.slice(0, 10),
  }
}
