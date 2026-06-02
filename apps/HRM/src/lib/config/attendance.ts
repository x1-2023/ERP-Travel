import { getVNHour, getVNMinute } from "@/lib/utils/timezone"

export const ATTENDANCE_CONFIG = {
  workStartTime: "08:00",
  lateThreshold: "08:30",
  morningEndTime: "12:00",
  afternoonStart: "13:00",
  workEndTime: "17:30",
  minWorkHours: 4,
  fullWorkHours: 8,
  // Check-in allowed window
  checkInStartHour: 6,
  checkInEndHour: 12,
} as const

// Day value mapping for attendance summary
export const DAY_VALUES: Record<string, number> = {
  PRESENT: 1.0,
  LATE: 1.0,
  HALF_DAY: 0.5,
  ABSENT: 0.0,
  LEAVE: 1.0,
  HOLIDAY: 1.0,
}

export function calculateWorkHours(checkIn: Date, checkOut: Date): number {
  const diffMs = checkOut.getTime() - checkIn.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  // Subtract 1h lunch break if working across 12:00–13:00 (VN time)
  const hasLunchBreak = getVNHour(checkIn) < 12 && getVNHour(checkOut) >= 13
  return Math.max(0, hasLunchBreak ? diffHours - 1 : diffHours)
}

export type AttendanceStatusType = "PRESENT" | "LATE" | "HALF_DAY" | "ABSENT" | "LEAVE" | "HOLIDAY"

export function determineStatus(checkInAt: Date, workHours: number): AttendanceStatusType {
  const checkInHour = getVNHour(checkInAt)
  const checkInMin = getVNMinute(checkInAt)
  const isLate = checkInHour > 8 || (checkInHour === 8 && checkInMin > 30)

  if (workHours < ATTENDANCE_CONFIG.minWorkHours) return "HALF_DAY"
  return isLate ? "LATE" : "PRESENT"
}
