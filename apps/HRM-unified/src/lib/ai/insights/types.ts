// src/lib/ai/insights/types.ts
// AI Insights Types

export type InsightCategory =
  | 'WORKFORCE'
  | 'ATTENDANCE'
  | 'LEAVE'
  | 'PERFORMANCE'
  | 'PAYROLL'
  | 'RECRUITMENT'
  | 'COMPLIANCE'
  | 'GENERAL'

export type InsightSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS'

export type InsightActionType =
  | 'navigate'
  | 'create_report'
  | 'send_notification'
  | 'schedule_meeting'
  | 'view_details'
  | 'dismiss'

export interface InsightAction {
  type: InsightActionType
  label: string
  url?: string
  params?: Record<string, unknown>
}

export interface DashboardInsight {
  id: string
  category: InsightCategory
  severity: InsightSeverity
  title: string
  message: string
  metric?: {
    value: number | string
    label: string
    trend?: 'up' | 'down' | 'stable'
    changePercent?: number
  }
  actions: InsightAction[]
  generatedAt: Date
  expiresAt?: Date
  dismissed?: boolean
}

export interface InsightsResult {
  insights: DashboardInsight[]
  summary: {
    total: number
    critical: number
    warning: number
    info: number
    success: number
  }
  lastUpdated: Date
}

export interface InsightContext {
  tenantId: string
  userId: string
  role: string
  departmentId?: string
}

// Insight templates for AI generation
export const INSIGHT_PROMPTS: Record<InsightCategory, string> = {
  WORKFORCE: `Phân tích dữ liệu nhân sự: tổng số, tuyển mới, nghỉ việc, turnover rate.
Đưa ra insight về xu hướng nhân sự, cảnh báo nếu có vấn đề.`,

  ATTENDANCE: `Phân tích chấm công: tỷ lệ đi muộn, vắng mặt, về sớm.
Xác định các pattern bất thường, đề xuất cải thiện.`,

  LEAVE: `Phân tích nghỉ phép: số đơn chờ duyệt, usage rate, peak periods.
Cảnh báo nếu có nhân viên nghỉ quá nhiều hoặc quá ít.`,

  PERFORMANCE: `Phân tích hiệu suất: rating distribution, top/bottom performers.
Đề xuất action items cho talent management.`,

  PAYROLL: `Phân tích lương: tổng quỹ lương, salary range, anomalies.
Cảnh báo về các khoản chi bất thường.`,

  RECRUITMENT: `Phân tích tuyển dụng: vị trí đang tuyển, time-to-fill, pipeline.
Đề xuất cải thiện process.`,

  COMPLIANCE: `Kiểm tra compliance: hợp đồng sắp hết hạn, giấy phép lao động.
Cảnh báo các deadline quan trọng.`,

  GENERAL: `Tổng hợp tình hình HR chung, highlight các metrics quan trọng.`
}
