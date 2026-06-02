/**
 * Attendance Adapter Pattern — Phase 1: File Import, Phase 2: Device API
 *
 * Architecture:
 *   AttendanceAdapter (interface)
 *     ├── FileAdapter     — Parse Excel/CSV from attendance device export
 *     └── DeviceAdapter   — (Phase 2) Direct API/SDK connection to device
 */

export interface AttendanceRawRecord {
  employeeCode?: string
  employeeName?: string
  date: Date
  checkIn: Date | null
  checkOut: Date | null
  /** Optional: device-provided status (overridden by calculated if times exist) */
  deviceStatus?: string
  /** Source identifier: "ZKTeco", "RonaldJack", "Manual", etc. */
  source: string
}

export interface ParseResult {
  records: AttendanceRawRecord[]
  errors: ParseError[]
  meta: {
    deviceType: string
    totalRows: number
    parsedRows: number
    dateRange: { from: Date; to: Date } | null
    employeeCodes: string[]
  }
}

export interface ParseError {
  row: number
  field: string
  message: string
  severity: "error" | "warning"
  rawValue?: string
}

export interface ImportResult {
  created: number
  updated: number
  skipped: number
  errors: ParseError[]
}

export interface AttendanceAdapter {
  readonly name: string
  readonly type: "file" | "device"

  /**
   * Parse raw data from source into normalized records
   * File adapter: source = Buffer | ArrayBuffer
   * Device adapter: source = connection config
   */
  parse(source: unknown, options?: ParseOptions): Promise<ParseResult>
}

export interface ParseOptions {
  /** Override auto-detected device format */
  deviceFormat?: DeviceFormat
  /** How to handle duplicate records for same employee+date */
  duplicateStrategy?: "skip" | "overwrite" | "merge"
  /** Date range filter */
  dateFrom?: Date
  dateTo?: Date
}

/**
 * Supported attendance device export formats
 * Each format has its own column layout and time format
 */
export type DeviceFormat =
  | "zkteco"       // ZKTeco (K40, iClock, X628, etc.)
  | "ronald_jack"  // Ronald Jack (RJ-919, RJ-550, etc.)
  | "suprema"      // Suprema BioStar
  | "hikvision"    // Hikvision access control
  | "generic"      // Generic CSV: employeeCode, date, checkIn, checkOut
  | "auto"         // Auto-detect from file content

/**
 * Column signature for each device format
 * Used by auto-detect and file parsing
 */
export const DEVICE_SIGNATURES: Record<DeviceFormat, {
  label: string
  description: string
  /** Known column header patterns (lowercase) for auto-detection */
  headerPatterns: string[][]
  /** Typical time format */
  timeFormat: string
}> = {
  zkteco: {
    label: "ZKTeco",
    description: "Máy chấm công ZKTeco (K40, iClock, X628, UA760...)",
    headerPatterns: [
      ["ac-no", "date/time", "status"],
      ["user id", "date", "time", "status"],
      ["no.", "id", "name", "date/time"],
      ["mã nv", "ngày giờ", "trạng thái"],
    ],
    timeFormat: "yyyy-MM-dd HH:mm:ss",
  },
  ronald_jack: {
    label: "Ronald Jack",
    description: "Máy chấm công Ronald Jack (RJ-919, RJ-550, RJ-800...)",
    headerPatterns: [
      ["user id", "name", "date", "timetable", "on duty", "off duty"],
      ["mã nv", "họ tên", "ngày", "giờ vào", "giờ ra"],
      ["no", "a/c no", "name", "date/time"],
    ],
    timeFormat: "HH:mm",
  },
  suprema: {
    label: "Suprema BioStar",
    description: "Máy chấm công Suprema (BioStar 2)",
    headerPatterns: [
      ["user id", "name", "datetime", "event"],
      ["event time", "user id", "user name"],
    ],
    timeFormat: "yyyy-MM-dd HH:mm:ss",
  },
  hikvision: {
    label: "Hikvision",
    description: "Hệ thống Hikvision Access Control",
    headerPatterns: [
      ["employee no", "name", "time", "card no"],
      ["mã nhân viên", "họ tên", "thời gian"],
    ],
    timeFormat: "yyyy-MM-dd HH:mm:ss",
  },
  generic: {
    label: "Chung (CSV/Excel)",
    description: "File CSV/Excel với cột: Mã NV, Ngày, Giờ vào, Giờ ra",
    headerPatterns: [
      ["employee_code", "date", "check_in", "check_out"],
      ["mã nv", "ngày", "giờ vào", "giờ ra"],
      ["ma nv", "ngay", "gio vao", "gio ra"],
    ],
    timeFormat: "HH:mm",
  },
  auto: {
    label: "Tự nhận dạng",
    description: "Hệ thống tự nhận dạng format từ nội dung file",
    headerPatterns: [],
    timeFormat: "",
  },
}
