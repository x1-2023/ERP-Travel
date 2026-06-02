// TIP-009: Report Business Logic — Business Trip + OT + Leave

import { differenceInDays, startOfDay, isWeekend, addDays } from "date-fns"

// ═══════════════ BUSINESS TRIP ═══════════════

/** RTR Rule: tính đêm, không tính ngày. VD: 10→12 = 2 đêm */
export function calculateBusinessNights(startDate: Date, endDate: Date): number {
  const start = startOfDay(startDate)
  const end = startOfDay(endDate)
  const nights = differenceInDays(end, start)
  return Math.max(0, nights)
}

// ═══════════════ OT ═══════════════

export type OvertimeTypeValue = "WEEKDAY" | "WEEKEND" | "HOLIDAY" | "NIGHT_SHIFT"

const OT_MULTIPLIERS: Record<OvertimeTypeValue, number> = {
  WEEKDAY: 1.5,
  WEEKEND: 2.0,
  HOLIDAY: 3.0,
  NIGHT_SHIFT: 1.3,
}

/** Calculate OT payment amount */
export function calculateOTRate(
  baseSalary: number,
  standardDays: number,
  hours: number,
  otType: OvertimeTypeValue
): number {
  if (standardDays <= 0 || hours <= 0) return 0
  const dailyRate = baseSalary / standardDays
  const hourlyRate = dailyRate / 8
  const multiplier = OT_MULTIPLIERS[otType]
  return Math.round(hourlyRate * hours * multiplier)
}

/** Parse "HH:MM" to minutes since midnight */
export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return (h || 0) * 60 + (m || 0)
}

/** Calculate hours between two "HH:MM" strings */
export function calculateOTHours(startTime: string, endTime: string): number {
  const startMin = parseTimeToMinutes(startTime)
  const endMin = parseTimeToMinutes(endTime)
  if (endMin <= startMin) return 0
  return (endMin - startMin) / 60
}

export interface OTPayload {
  startTime: string  // "HH:MM"
  endTime: string    // "HH:MM"
  otType: OvertimeTypeValue
  workDescription?: string
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/** Validate OT report per Vietnamese labor law + RTR rules */
export function validateOTReport(payload: OTPayload): ValidationResult {
  const errors: string[] = []

  const hours = calculateOTHours(payload.startTime, payload.endTime)

  if (hours <= 0) {
    errors.push("Thời gian kết thúc phải sau thời gian bắt đầu")
  }

  // Max OT per day = 4 hours (Bộ Luật Lao Động VN)
  if (hours > 4) {
    errors.push("Tăng ca tối đa 4 giờ/ngày theo quy định Bộ Luật Lao Động")
  }

  return { valid: errors.length === 0, errors }
}

// ═══════════════ LEAVE ═══════════════

/** Calculate working days between two dates (exclude weekends for LEAVE_PAID) */
export function calculateLeaveDays(
  startDate: Date,
  endDate: Date,
  excludeWeekends: boolean
): number {
  const start = startOfDay(startDate)
  const end = startOfDay(endDate)
  const totalDays = differenceInDays(end, start) + 1 // inclusive

  if (totalDays <= 0) return 0

  if (!excludeWeekends) return totalDays

  let workDays = 0
  for (let i = 0; i < totalDays; i++) {
    const day = addDays(start, i)
    if (!isWeekend(day)) workDays++
  }
  return workDays
}
