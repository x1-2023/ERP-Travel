// src/lib/ai/anomaly/types.ts
// Anomaly Detection Types

export type AnomalyCategory =
  | 'ATTENDANCE'
  | 'PAYROLL'
  | 'LEAVE'
  | 'OVERTIME'
  | 'PERFORMANCE'
  | 'COMPLIANCE'

export type AnomalySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface AnomalyDetail {
  field: string
  expected: string | number
  actual: string | number
  deviation?: number
}

export interface Anomaly {
  id: string
  category: AnomalyCategory
  severity: AnomalySeverity
  title: string
  description: string
  entityType: 'EMPLOYEE' | 'DEPARTMENT' | 'SYSTEM'
  entityId?: string
  entityName?: string
  details: AnomalyDetail[]
  detectedAt: Date
  resolvedAt?: Date
  resolution?: string
  aiAnalysis?: string
  aiRecommendation?: string
}

export interface AnomalyDetectionResult {
  anomalies: Anomaly[]
  summary: {
    total: number
    byCategory: Record<AnomalyCategory, number>
    bySeverity: Record<AnomalySeverity, number>
  }
  detectionTime: Date
}

export interface AnomalyContext {
  tenantId: string
  userId: string
  departmentId?: string
  dateRange?: {
    start: Date
    end: Date
  }
}

// Thresholds for anomaly detection
export const ANOMALY_THRESHOLDS = {
  attendance: {
    lateMinutesWarning: 30,
    lateMinutesCritical: 60,
    consecutiveLateDays: 3,
    consecutiveAbsentDays: 2,
    monthlyLateCount: 5,
    monthlyAbsentCount: 3
  },
  payroll: {
    salaryDeviationPercent: 20,
    otHoursWarning: 40,
    otHoursCritical: 60,
    overtimeRatioWarning: 1.5
  },
  leave: {
    unusedLeaveWarning: 5,
    consecutiveLeaveWarning: 10,
    monthlyLeaveRequestsWarning: 3
  },
  overtime: {
    weeklyOtHoursWarning: 12,
    weeklyOtHoursCritical: 20,
    monthlyOtHoursWarning: 40
  }
}
