// src/lib/attendance/time-utils.ts
// Time utility functions for attendance calculations

import { NIGHT_SHIFT_HOURS } from '@/constants/attendance'

/**
 * Parse time string "HH:mm" to minutes from midnight
 */
export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Convert minutes from midnight to "HH:mm" format
 */
export function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24
  const mins = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

/**
 * Get minutes from midnight for a Date object
 */
export function getMinutesFromMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes()
}

/**
 * Create a Date object for a specific time on a given date
 */
export function setTimeOnDate(date: Date, timeString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number)
  const result = new Date(date)
  result.setHours(hours, minutes, 0, 0)
  return result
}

/**
 * Calculate difference in minutes between two times
 */
export function getTimeDiffInMinutes(start: Date, end: Date): number {
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60))
}

/**
 * Calculate difference in hours between two times (decimal)
 */
export function getTimeDiffInHours(start: Date, end: Date): number {
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60)
}

/**
 * Check if a time is within night shift hours (22:00-06:00)
 */
export function isNightTime(time: Date): boolean {
  const hours = time.getHours()
  const nightStart = parseInt(NIGHT_SHIFT_HOURS.START.split(':')[0])
  const nightEnd = parseInt(NIGHT_SHIFT_HOURS.END.split(':')[0])

  // Night shift spans midnight: 22:00-06:00
  return hours >= nightStart || hours < nightEnd
}

/**
 * Calculate night hours within a time range
 * Night hours: 22:00 - 06:00
 */
export function calculateNightHours(checkIn: Date, checkOut: Date): number {
  let nightMinutes = 0
  const current = new Date(checkIn)

  while (current < checkOut) {
    if (isNightTime(current)) {
      nightMinutes++
    }
    current.setMinutes(current.getMinutes() + 1)
  }

  return Math.round((nightMinutes / 60) * 100) / 100
}

/**
 * Optimized calculation of night hours
 */
export function calculateNightHoursOptimized(checkIn: Date, checkOut: Date): number {
  const NIGHT_START_HOUR = 22
  const NIGHT_END_HOUR = 6

  let totalNightMinutes = 0
  let current = new Date(checkIn)
  const end = new Date(checkOut)

  while (current < end) {
    const currentHour = current.getHours()
    const isNight = currentHour >= NIGHT_START_HOUR || currentHour < NIGHT_END_HOUR

    if (isNight) {
      // Find end of current night period
      let periodEnd: Date
      if (currentHour >= NIGHT_START_HOUR) {
        // Night period ends at 06:00 next day
        periodEnd = new Date(current)
        periodEnd.setDate(periodEnd.getDate() + 1)
        periodEnd.setHours(NIGHT_END_HOUR, 0, 0, 0)
      } else {
        // Night period ends at 06:00 same day
        periodEnd = new Date(current)
        periodEnd.setHours(NIGHT_END_HOUR, 0, 0, 0)
      }

      // Use the earlier of period end or check out
      const effectiveEnd = periodEnd < end ? periodEnd : end
      totalNightMinutes += getTimeDiffInMinutes(current, effectiveEnd)
      current = effectiveEnd
    } else {
      // Skip to next night period start (22:00)
      const nextNightStart = new Date(current)
      nextNightStart.setHours(NIGHT_START_HOUR, 0, 0, 0)
      if (nextNightStart <= current) {
        nextNightStart.setDate(nextNightStart.getDate() + 1)
      }
      current = nextNightStart < end ? nextNightStart : end
    }
  }

  return Math.round((totalNightMinutes / 60) * 100) / 100
}

/**
 * Get start and end of a day
 */
export function getDayBounds(date: Date): { start: Date; end: Date } {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)

  const end = new Date(date)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

/**
 * Format date to YYYY-MM-DD string
 */
export function formatDateToYMD(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Format date to DD/MM/YYYY string (Vietnam format)
 */
export function formatDateToVN(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Format time to HH:mm string
 */
export function formatTimeToHM(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * Format datetime to full string DD/MM/YYYY HH:mm
 */
export function formatDateTime(date: Date): string {
  return `${formatDateToVN(date)} ${formatTimeToHM(date)}`
}

/**
 * Get all dates in a month
 */
export function getDatesInMonth(year: number, month: number): Date[] {
  const dates: Date[] = []
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)

  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d))
  }

  return dates
}

/**
 * Get working days in a month (excluding weekends)
 */
export function getWorkingDaysInMonth(
  year: number,
  month: number,
  workDays: number[] = [1, 2, 3, 4, 5]
): number {
  let count = 0
  const dates = getDatesInMonth(year, month)

  for (const date of dates) {
    if (workDays.includes(date.getDay())) {
      count++
    }
  }

  return count
}

/**
 * Check if a date is a weekend (Saturday or Sunday)
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

/**
 * Get the Monday of the week for a given date
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Get the Sunday of the week for a given date
 */
export function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

/**
 * Round hours to 2 decimal places
 */
export function roundHours(hours: number): number {
  return Math.round(hours * 100) / 100
}

/**
 * Round minutes to nearest 5 or 15 minutes
 */
export function roundMinutes(minutes: number, roundTo: 5 | 15 = 15): number {
  return Math.round(minutes / roundTo) * roundTo
}
