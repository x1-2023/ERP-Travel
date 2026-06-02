/**
 * FileAdapter — Parse attendance Excel/CSV exports from fingerprint devices
 *
 * Supports: ZKTeco, Ronald Jack, Suprema, Hikvision, Generic
 * Auto-detection: Reads headers to identify device format
 */
import * as XLSX from "xlsx"
import { parseDate, parseTime } from "@/lib/import/parsers"
import type {
  AttendanceAdapter, AttendanceRawRecord, ParseResult, ParseError, ParseOptions,
  DeviceFormat
} from "./adapter"
import { DEVICE_SIGNATURES } from "./adapter"

export class FileAdapter implements AttendanceAdapter {
  readonly name = "File Import"
  readonly type = "file" as const

  async parse(source: Buffer | ArrayBuffer, options?: ParseOptions): Promise<ParseResult> {
    const workbook = XLSX.read(source, { type: "buffer", cellDates: true })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const rawData: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" })

    if (rawData.length < 2) {
      return {
        records: [],
        errors: [{ row: 0, field: "file", message: "File trống hoặc không có dữ liệu", severity: "error" }],
        meta: { deviceType: "unknown", totalRows: 0, parsedRows: 0, dateRange: null, employeeCodes: [] },
      }
    }

    // Find header row (first row with at least 3 non-empty cells)
    let headerRowIdx = 0
    for (let i = 0; i < Math.min(rawData.length, 10); i++) {
      const nonEmpty = rawData[i].filter(c => c !== "" && c !== null && c !== undefined)
      if (nonEmpty.length >= 3) {
        headerRowIdx = i
        break
      }
    }

    const headers = rawData[headerRowIdx].map(h => String(h || "").trim().toLowerCase())
    const format = options?.deviceFormat && options.deviceFormat !== "auto"
      ? options.deviceFormat
      : detectFormat(headers)

    const dataRows = rawData.slice(headerRowIdx + 1).filter(row =>
      row.some(cell => cell !== "" && cell !== null && cell !== undefined)
    )

    const records: AttendanceRawRecord[] = []
    const errors: ParseError[] = []
    const employeeCodes = new Set<string>()

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i]
      const rowNum = headerRowIdx + i + 2 // 1-indexed, +1 for header

      try {
        const parsed = parseRow(row, headers, format, rowNum)
        if (parsed.error) {
          errors.push(parsed.error)
          continue
        }
        if (parsed.record) {
          // Date range filter
          if (options?.dateFrom && parsed.record.date < options.dateFrom) continue
          if (options?.dateTo && parsed.record.date > options.dateTo) continue

          records.push(parsed.record)
          if (parsed.record.employeeCode) {
            employeeCodes.add(parsed.record.employeeCode)
          }
        }
      } catch (err) {
        errors.push({
          row: rowNum,
          field: "general",
          message: err instanceof Error ? err.message : "Lỗi parse dòng",
          severity: "error",
        })
      }
    }

    // For event-log formats (ZKTeco, Suprema, Hikvision), merge multiple events per day
    const mergedRecords = format === "generic" || format === "ronald_jack"
      ? records
      : mergeEventRecords(records)

    // Calculate date range
    let dateRange: { from: Date; to: Date } | null = null
    if (mergedRecords.length > 0) {
      const dates = mergedRecords.map(r => r.date.getTime())
      dateRange = { from: new Date(Math.min(...dates)), to: new Date(Math.max(...dates)) }
    }

    return {
      records: mergedRecords,
      errors,
      meta: {
        deviceType: DEVICE_SIGNATURES[format]?.label || format,
        totalRows: dataRows.length,
        parsedRows: mergedRecords.length,
        dateRange,
        employeeCodes: Array.from(employeeCodes),
      },
    }
  }
}

// ═══════════════ FORMAT DETECTION ═══════════════

function detectFormat(headers: string[]): DeviceFormat {
  const headerStr = headers.join("|").toLowerCase()

  for (const [format, sig] of Object.entries(DEVICE_SIGNATURES)) {
    if (format === "auto") continue
    for (const pattern of sig.headerPatterns) {
      const matches = pattern.every(p => headerStr.includes(p.toLowerCase()))
      if (matches) return format as DeviceFormat
    }
  }

  // Heuristic detection
  if (headers.some(h => h.includes("ac-no") || h.includes("ac no"))) return "zkteco"
  if (headers.some(h => h.includes("on duty") || h.includes("off duty"))) return "ronald_jack"
  if (headers.some(h => h.includes("event time"))) return "suprema"
  if (headers.some(h => h.includes("card no") || h.includes("số thẻ"))) return "hikvision"

  // Check for Vietnamese attendance column names
  if (headers.some(h => h.includes("giờ vào") || h.includes("gio vao") || h.includes("check_in") || h.includes("check in"))) {
    return "generic"
  }

  return "generic" // fallback
}

// ═══════════════ ROW PARSING ═══════════════

interface RowResult {
  record?: AttendanceRawRecord
  error?: ParseError
}

function parseRow(row: unknown[], headers: string[], format: DeviceFormat, rowNum: number): RowResult {
  switch (format) {
    case "zkteco": return parseZKTecoRow(row, headers, rowNum)
    case "ronald_jack": return parseRonaldJackRow(row, headers, rowNum)
    case "suprema": return parseSupremaRow(row, headers, rowNum)
    case "hikvision": return parseHikvisionRow(row, headers, rowNum)
    case "generic":
    default: return parseGenericRow(row, headers, rowNum)
  }
}

function findCol(headers: string[], ...patterns: string[]): number {
  for (const p of patterns) {
    const idx = headers.findIndex(h => h.includes(p))
    if (idx >= 0) return idx
  }
  return -1
}

function cellStr(row: unknown[], idx: number): string {
  if (idx < 0 || idx >= row.length) return ""
  return String(row[idx] ?? "").trim()
}

// ═══════════════ ZKTECO FORMAT ═══════════════
// Event log: each row = one punch (IN or OUT)
// Columns: AC-No | Date/Time | Status (C/I, C/O)
// or: User ID | Date | Time | Status
function parseZKTecoRow(row: unknown[], headers: string[], rowNum: number): RowResult {
  const idCol = findCol(headers, "ac-no", "ac no", "user id", "mã nv", "id")
  const dtCol = findCol(headers, "date/time", "ngày giờ", "datetime")
  const dateCol = findCol(headers, "date", "ngày")
  const timeCol = findCol(headers, "time", "giờ")
  const nameCol = findCol(headers, "name", "họ tên", "tên")

  const empCode = cellStr(row, idCol)
  const empName = cellStr(row, nameCol)
  if (!empCode && !empName) {
    return { error: { row: rowNum, field: "id", message: "Thiếu mã NV hoặc tên", severity: "error" } }
  }

  let dateObj: Date | null = null
  let checkTime: Date | null = null

  if (dtCol >= 0) {
    // Combined date/time column
    const dtVal = row[dtCol]
    if (dtVal instanceof Date) {
      dateObj = dtVal
      checkTime = dtVal
    } else {
      const dtStr = cellStr(row, dtCol)
      dateObj = parseDate(dtStr.split(" ")[0])
      const timePart = parseTime(dtStr.split(" ")[1])
      if (dateObj && timePart) {
        checkTime = new Date(dateObj)
        checkTime.setHours(timePart.hours, timePart.minutes, 0, 0)
      }
    }
  } else if (dateCol >= 0) {
    const dateVal = row[dateCol]
    dateObj = dateVal instanceof Date ? dateVal : parseDate(cellStr(row, dateCol))
    const timePart = parseTime(cellStr(row, timeCol))
    if (dateObj && timePart) {
      checkTime = new Date(dateObj)
      checkTime.setHours(timePart.hours, timePart.minutes, 0, 0)
    }
  }

  if (!dateObj) {
    return { error: { row: rowNum, field: "date", message: "Không parse được ngày", severity: "error" } }
  }

  // ZKTeco event log: check-in if before 12:00, check-out if after
  const hour = checkTime ? checkTime.getHours() : 0
  const isCheckIn = hour < 12

  return {
    record: {
      employeeCode: empCode || undefined,
      employeeName: empName || undefined,
      date: new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()),
      checkIn: isCheckIn ? checkTime : null,
      checkOut: !isCheckIn ? checkTime : null,
      source: "ZKTeco",
    },
  }
}

// ═══════════════ RONALD JACK FORMAT ═══════════════
// Summary format: each row = one day with both IN and OUT
// Columns: User ID | Name | Date | On Duty | Off Duty
function parseRonaldJackRow(row: unknown[], headers: string[], rowNum: number): RowResult {
  const idCol = findCol(headers, "user id", "mã nv", "a/c no", "id")
  const nameCol = findCol(headers, "name", "họ tên", "tên")
  const dateCol = findCol(headers, "date", "ngày")
  const inCol = findCol(headers, "on duty", "giờ vào", "gio vao", "check in", "vào")
  const outCol = findCol(headers, "off duty", "giờ ra", "gio ra", "check out", "ra")

  const empCode = cellStr(row, idCol)
  const empName = cellStr(row, nameCol)
  if (!empCode && !empName) {
    return { error: { row: rowNum, field: "id", message: "Thiếu mã NV", severity: "error" } }
  }

  const dateVal = row[dateCol]
  const dateObj = dateVal instanceof Date ? dateVal : parseDate(cellStr(row, dateCol))
  if (!dateObj) {
    return { error: { row: rowNum, field: "date", message: "Không parse được ngày", severity: "error" } }
  }

  const inTime = parseTime(cellStr(row, inCol))
  const outTime = parseTime(cellStr(row, outCol))

  let checkIn: Date | null = null
  let checkOut: Date | null = null
  if (inTime) {
    checkIn = new Date(dateObj)
    checkIn.setHours(inTime.hours, inTime.minutes, 0, 0)
  }
  if (outTime) {
    checkOut = new Date(dateObj)
    checkOut.setHours(outTime.hours, outTime.minutes, 0, 0)
  }

  return {
    record: {
      employeeCode: empCode || undefined,
      employeeName: empName || undefined,
      date: new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()),
      checkIn,
      checkOut,
      source: "Ronald Jack",
    },
  }
}

// ═══════════════ SUPREMA FORMAT ═══════════════
// Event log similar to ZKTeco
function parseSupremaRow(row: unknown[], headers: string[], rowNum: number): RowResult {
  const idCol = findCol(headers, "user id", "id")
  const nameCol = findCol(headers, "user name", "name", "họ tên")
  const dtCol = findCol(headers, "event time", "datetime", "time")

  const empCode = cellStr(row, idCol)
  const empName = cellStr(row, nameCol)

  const dtVal = row[dtCol]
  let dateObj: Date | null = null
  let checkTime: Date | null = null

  if (dtVal instanceof Date) {
    dateObj = dtVal
    checkTime = dtVal
  } else {
    const dtStr = cellStr(row, dtCol)
    dateObj = parseDate(dtStr.split(" ")[0])
    const timePart = parseTime(dtStr.split(" ")[1])
    if (dateObj && timePart) {
      checkTime = new Date(dateObj)
      checkTime.setHours(timePart.hours, timePart.minutes, 0, 0)
    }
  }

  if (!dateObj) {
    return { error: { row: rowNum, field: "date", message: "Không parse được ngày", severity: "error" } }
  }

  const hour = checkTime ? checkTime.getHours() : 0
  const isCheckIn = hour < 12

  return {
    record: {
      employeeCode: empCode || undefined,
      employeeName: empName || undefined,
      date: new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()),
      checkIn: isCheckIn ? checkTime : null,
      checkOut: !isCheckIn ? checkTime : null,
      source: "Suprema",
    },
  }
}

// ═══════════════ HIKVISION FORMAT ═══════════════
function parseHikvisionRow(row: unknown[], headers: string[], rowNum: number): RowResult {
  const idCol = findCol(headers, "employee no", "mã nhân viên", "id")
  const nameCol = findCol(headers, "name", "họ tên")
  const dtCol = findCol(headers, "time", "thời gian", "datetime")

  const empCode = cellStr(row, idCol)
  const empName = cellStr(row, nameCol)

  const dtVal = row[dtCol]
  let dateObj: Date | null = null
  let checkTime: Date | null = null

  if (dtVal instanceof Date) {
    dateObj = dtVal
    checkTime = dtVal
  } else {
    const dtStr = cellStr(row, dtCol)
    dateObj = parseDate(dtStr.split(" ")[0])
    const timePart = parseTime(dtStr.split(" ")[1])
    if (dateObj && timePart) {
      checkTime = new Date(dateObj)
      checkTime.setHours(timePart.hours, timePart.minutes, 0, 0)
    }
  }

  if (!dateObj) {
    return { error: { row: rowNum, field: "date", message: "Không parse được ngày", severity: "error" } }
  }

  const hour = checkTime ? checkTime.getHours() : 0
  const isCheckIn = hour < 12

  return {
    record: {
      employeeCode: empCode || undefined,
      employeeName: empName || undefined,
      date: new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()),
      checkIn: isCheckIn ? checkTime : null,
      checkOut: !isCheckIn ? checkTime : null,
      source: "Hikvision",
    },
  }
}

// ═══════════════ GENERIC FORMAT ═══════════════
// Columns: Mã NV | Ngày | Giờ vào | Giờ ra
function parseGenericRow(row: unknown[], headers: string[], rowNum: number): RowResult {
  const idCol = findCol(headers, "employee_code", "mã nv", "ma nv", "employee", "code", "mã", "id")
  const nameCol = findCol(headers, "name", "họ tên", "ho ten", "employee_name", "tên")
  const dateCol = findCol(headers, "date", "ngày", "ngay")
  const inCol = findCol(headers, "check_in", "check in", "giờ vào", "gio vao", "in", "vào")
  const outCol = findCol(headers, "check_out", "check out", "giờ ra", "gio ra", "out", "ra")

  const empCode = cellStr(row, idCol)
  const empName = cellStr(row, nameCol)
  if (!empCode && !empName) {
    return { error: { row: rowNum, field: "id", message: "Thiếu mã NV hoặc tên", severity: "error" } }
  }

  const dateVal = row[dateCol >= 0 ? dateCol : 1]
  const dateObj = dateVal instanceof Date ? dateVal : parseDate(cellStr(row, dateCol >= 0 ? dateCol : 1))
  if (!dateObj) {
    return { error: { row: rowNum, field: "date", message: `Không parse được ngày: "${cellStr(row, dateCol >= 0 ? dateCol : 1)}"`, severity: "error" } }
  }

  const inTime = parseTime(cellStr(row, inCol >= 0 ? inCol : 2))
  const outTime = parseTime(cellStr(row, outCol >= 0 ? outCol : 3))

  let checkIn: Date | null = null
  let checkOut: Date | null = null
  if (inTime) {
    checkIn = new Date(dateObj)
    checkIn.setHours(inTime.hours, inTime.minutes, 0, 0)
  }
  if (outTime) {
    checkOut = new Date(dateObj)
    checkOut.setHours(outTime.hours, outTime.minutes, 0, 0)
  }

  return {
    record: {
      employeeCode: empCode || undefined,
      employeeName: empName || undefined,
      date: new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()),
      checkIn,
      checkOut,
      source: "Generic",
    },
  }
}

// ═══════════════ MERGE EVENT RECORDS ═══════════════
// For event-log formats: group by employee+date, take earliest as checkIn, latest as checkOut
function mergeEventRecords(records: AttendanceRawRecord[]): AttendanceRawRecord[] {
  const groups = new Map<string, AttendanceRawRecord[]>()

  for (const rec of records) {
    const key = `${rec.employeeCode || rec.employeeName}|${rec.date.toISOString()}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(rec)
  }

  const merged: AttendanceRawRecord[] = []
  for (const [, group] of Array.from(groups.entries())) {
    const base = group[0]
    const allTimes: Date[] = []
    for (const r of group) {
      if (r.checkIn) allTimes.push(r.checkIn)
      if (r.checkOut) allTimes.push(r.checkOut)
    }

    if (allTimes.length === 0) {
      merged.push(base)
      continue
    }

    allTimes.sort((a, b) => a.getTime() - b.getTime())
    merged.push({
      ...base,
      checkIn: allTimes[0],
      checkOut: allTimes.length > 1 ? allTimes[allTimes.length - 1] : null,
    })
  }

  return merged
}
