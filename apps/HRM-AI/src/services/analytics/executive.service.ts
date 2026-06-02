// src/services/analytics/executive.service.ts
// Executive Dashboard Service

import { calculateHeadcountMetrics } from '@/lib/analytics/calculators/headcount'
import { calculateTurnoverMetrics } from '@/lib/analytics/calculators/turnover'
import { calculateAttendanceMetrics } from '@/lib/analytics/calculators/attendance'
import { calculateLaborCostMetrics } from '@/lib/analytics/calculators/labor-cost'
import { db } from '@/lib/db'

export interface Alert {
  type: 'warning' | 'critical' | 'info'
  category: string
  message: string
  value?: number
  threshold?: number
}

export async function getExecutiveDashboard(
  tenantId: string,
  date: Date = new Date()
) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1

  const [headcount, turnover, attendance, laborCost] = await Promise.all([
    calculateHeadcountMetrics({ tenantId, date }),
    calculateTurnoverMetrics({ tenantId, date }),
    calculateAttendanceMetrics({ tenantId, year, month }),
    calculateLaborCostMetrics({ tenantId, year, month }),
  ])

  const alerts = await generateAlerts(tenantId, {
    turnoverRate: turnover.rate,
    attendanceRate: attendance.rate,
  })

  return {
    headcount,
    turnover,
    attendance,
    laborCost,
    alerts,
  }
}

async function generateAlerts(
  tenantId: string,
  data: {
    turnoverRate: number
    attendanceRate: number
  }
): Promise<Alert[]> {
  const alerts: Alert[] = []

  // Check turnover rate > 15%
  if (data.turnoverRate > 15) {
    alerts.push({
      type: 'critical',
      category: 'turnover',
      message: `Tỷ lệ nghỉ việc đang ở mức ${data.turnoverRate.toFixed(1)}%, vượt ngưỡng 15%`,
      value: data.turnoverRate,
      threshold: 15,
    })
  }

  // Check attendance rate < 90%
  if (data.attendanceRate < 90) {
    alerts.push({
      type: 'warning',
      category: 'attendance',
      message: `Tỷ lệ chuyên cần trung bình ${data.attendanceRate.toFixed(1)}%, thấp hơn ngưỡng 90%`,
      value: data.attendanceRate,
      threshold: 90,
    })
  }

  // Check expiring contracts (within 30 days)
  const expiringContracts = await db.contract.count({
    where: {
      tenantId,
      status: 'ACTIVE',
      endDate: {
        gte: new Date(),
        lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    },
  })

  if (expiringContracts > 0) {
    alerts.push({
      type: 'warning',
      category: 'contracts',
      message: `${expiringContracts} hợp đồng sẽ hết hạn trong 30 ngày tới`,
      value: expiringContracts,
    })
  }

  // Check high risk employees (turnover prediction)
  const highRiskEmployees = await db.turnoverPrediction.count({
    where: {
      tenantId,
      riskLevel: { in: ['HIGH', 'CRITICAL'] },
      validUntil: { gte: new Date() },
    },
  })

  if (highRiskEmployees > 0) {
    alerts.push({
      type: highRiskEmployees > 5 ? 'critical' : 'warning',
      category: 'retention',
      message: `${highRiskEmployees} nhân viên có nguy cơ nghỉ việc cao`,
      value: highRiskEmployees,
    })
  }

  return alerts
}

export const executiveService = {
  getExecutiveDashboard,
}
