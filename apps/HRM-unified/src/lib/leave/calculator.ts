// src/lib/leave/calculator.ts
// Leave Days Calculator

import { eachDayOfInterval, isWeekend, isSameDay } from 'date-fns'

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface CalculateLeaveDaysInput {
  startDate: Date
  endDate: Date
  startHalf?: 'AM' | 'PM' | null
  endHalf?: 'AM' | 'PM' | null
  holidays?: Date[]
}

export interface ValidateLeaveInput {
  balance: number
  requestDays: number
  minDays: number
  maxDays: number | null
  allowNegative: boolean
  advanceNoticeDays: number
  startDate: Date
}

export interface ValidationResult {
  valid: boolean
  error?: string
}

// ═══════════════════════════════════════════════════════════════
// Calculate Leave Days
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate the number of leave days, excluding weekends and holidays
 * Supports half-day leave
 */
export function calculateLeaveDays(input: CalculateLeaveDaysInput): number {
  const { startDate, endDate, startHalf, endHalf, holidays = [] } = input

  // Get all days in the range
  const days = eachDayOfInterval({ start: startDate, end: endDate })

  // Filter out weekends and holidays
  const workDays = days.filter(day => {
    if (isWeekend(day)) return false
    if (holidays.some(h => isSameDay(h, day))) return false
    return true
  })

  if (workDays.length === 0) return 0

  let totalDays = workDays.length

  // Handle single day with half day option
  if (workDays.length === 1) {
    if (startHalf || endHalf) {
      return 0.5
    }
    return 1
  }

  // Handle multiple days with half day adjustments
  if (startHalf === 'PM') {
    totalDays -= 0.5 // Start from afternoon, skip morning
  }
  if (endHalf === 'AM') {
    totalDays -= 0.5 // End at morning, skip afternoon
  }

  return totalDays
}

// ═══════════════════════════════════════════════════════════════
// Validate Leave Request
// ═══════════════════════════════════════════════════════════════

/**
 * Validate a leave request against policy rules
 */
export function validateLeaveRequest(input: ValidateLeaveInput): ValidationResult {
  const {
    balance,
    requestDays,
    minDays,
    maxDays,
    allowNegative,
    advanceNoticeDays,
    startDate,
  } = input

  // Check minimum days
  if (requestDays < minDays) {
    return {
      valid: false,
      error: `Số ngày tối thiểu là ${minDays} ngày`,
    }
  }

  // Check maximum days
  if (maxDays && requestDays > maxDays) {
    return {
      valid: false,
      error: `Số ngày tối đa là ${maxDays} ngày`,
    }
  }

  // Check balance
  if (!allowNegative && requestDays > balance) {
    return {
      valid: false,
      error: `Số dư không đủ. Còn lại ${balance} ngày`,
    }
  }

  // Check advance notice
  if (advanceNoticeDays > 0) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)

    const diffTime = start.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < advanceNoticeDays) {
      return {
        valid: false,
        error: `Cần báo trước ${advanceNoticeDays} ngày`,
      }
    }
  }

  return { valid: true }
}

// ═══════════════════════════════════════════════════════════════
// Balance Calculations
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate available balance from components
 */
export function calculateAvailableBalance(
  entitlement: number,
  carryOver: number,
  adjustment: number,
  used: number,
  pending: number
): number {
  return entitlement + carryOver + adjustment - used - pending
}

/**
 * Calculate usage percentage for display
 */
export function calculateUsagePercentage(used: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(100, Math.round((used / total) * 100))
}

// ═══════════════════════════════════════════════════════════════
// Date Helpers
// ═══════════════════════════════════════════════════════════════

/**
 * Get working days in a month (excluding weekends)
 */
export function getWorkingDaysInMonth(year: number, month: number): number {
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 0)
  const days = eachDayOfInterval({ start, end })

  return days.filter(day => !isWeekend(day)).length
}

/**
 * Check if a date range overlaps with another
 */
export function dateRangesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 <= end2 && end1 >= start2
}

/**
 * Generate request code
 */
export function generateRequestCode(prefix: string = 'LR'): string {
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  const seq = String(Date.now()).slice(-4)
  return `${prefix}-${year}-${seq}${random}`
}
