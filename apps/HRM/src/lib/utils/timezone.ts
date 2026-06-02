import { format } from "date-fns-tz"

export const VN_TZ = "Asia/Ho_Chi_Minh"

/**
 * Get "today" as Date at 00:00:00 UTC with VN date components.
 * Safe for storing in @db.Date fields — the UTC date matches the VN date.
 */
export function todayVN(): Date {
  const dateStr = format(new Date(), "yyyy-MM-dd", { timeZone: VN_TZ })
  return new Date(dateStr + "T00:00:00.000Z")
}

/** Format a date in VN timezone. Safe regardless of server timezone. */
export function formatVN(date: Date | string, fmt: string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return format(d, fmt, { timeZone: VN_TZ })
}

/** Get hour (0-23) in VN timezone from any Date. */
export function getVNHour(date: Date): number {
  return parseInt(format(date, "H", { timeZone: VN_TZ }))
}

/** Get minute (0-59) in VN timezone from any Date. */
export function getVNMinute(date: Date): number {
  return parseInt(format(date, "m", { timeZone: VN_TZ }))
}
