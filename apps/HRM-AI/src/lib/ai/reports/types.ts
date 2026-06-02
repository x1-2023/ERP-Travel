// src/lib/ai/reports/types.ts
// AI Reports Types

export interface WeeklySummary {
  period: {
    start: Date
    end: Date
    weekNumber: number
  }
  workforce: {
    totalEmployees: number
    newHires: number
    resignations: number
    promotions: number
    statusChanges: Array<{
      from: string
      to: string
      count: number
    }>
  }
  attendance: {
    averageAttendanceRate: number
    totalLateInstances: number
    totalAbsences: number
    topLateEmployees: Array<{
      employeeName: string
      count: number
    }>
    weekdayBreakdown: Array<{
      day: string
      attendanceRate: number
      lateCount: number
    }>
  }
  leave: {
    totalRequests: number
    approvedDays: number
    pendingRequests: number
    topLeaveTypes: Array<{
      type: string
      count: number
    }>
  }
  overtime: {
    totalHours: number
    totalEmployees: number
    averageHoursPerEmployee: number
    topOvertimeEmployees: Array<{
      employeeName: string
      hours: number
    }>
  }
  highlights: string[]
  concerns: string[]
  aiAnalysis: string
  recommendations: string[]
  generatedAt: Date
}

export interface SummaryContext {
  tenantId: string
  userId: string
  startDate?: Date
  endDate?: Date
}

export interface MonthlyTrend {
  month: string
  value: number
  change: number
}
