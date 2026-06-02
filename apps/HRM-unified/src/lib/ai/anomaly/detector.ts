// src/lib/ai/anomaly/detector.ts
// Anomaly Detection Engine

import Anthropic from '@anthropic-ai/sdk'
import { db } from '@/lib/db'
import { nanoid } from 'nanoid'
import {
  Anomaly,
  AnomalyCategory,
  AnomalySeverity,
  AnomalyDetectionResult,
  AnomalyContext,
  AnomalyDetail,
  ANOMALY_THRESHOLDS
} from './types'

// ═══════════════════════════════════════════════════════════════
// ANOMALY DETECTOR CLASS
// ═══════════════════════════════════════════════════════════════

export class AnomalyDetector {
  private client: Anthropic
  private tenantId: string

  constructor(tenantId: string) {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || ''
    })
    this.tenantId = tenantId
  }

  /**
   * Detect all anomalies
   */
  async detectAnomalies(context: AnomalyContext): Promise<AnomalyDetectionResult> {
    const anomalies: Anomaly[] = []

    // Run all detectors in parallel
    const [
      attendanceAnomalies,
      payrollAnomalies,
      leaveAnomalies,
      overtimeAnomalies
    ] = await Promise.all([
      this.detectAttendanceAnomalies(context),
      this.detectPayrollAnomalies(context),
      this.detectLeaveAnomalies(context),
      this.detectOvertimeAnomalies(context)
    ])

    anomalies.push(...attendanceAnomalies)
    anomalies.push(...payrollAnomalies)
    anomalies.push(...leaveAnomalies)
    anomalies.push(...overtimeAnomalies)

    // Sort by severity
    const severityOrder: Record<AnomalySeverity, number> = {
      CRITICAL: 0,
      HIGH: 1,
      MEDIUM: 2,
      LOW: 3
    }
    anomalies.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

    // Generate summary
    const summary = this.generateSummary(anomalies)

    return {
      anomalies,
      summary,
      detectionTime: new Date()
    }
  }

  /**
   * Detect attendance anomalies
   */
  private async detectAttendanceAnomalies(context: AnomalyContext): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = []
    const thresholds = ANOMALY_THRESHOLDS.attendance
    const today = new Date()
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    // 1. Employees with excessive late arrivals this month
    const monthlyLateStats = await db.attendance.groupBy({
      by: ['employeeId'],
      where: {
        tenantId: this.tenantId,
        date: { gte: monthStart },
        status: { in: ['LATE', 'LATE_AND_EARLY'] }
      },
      _count: true,
      having: {
        employeeId: { _count: { gte: thresholds.monthlyLateCount } }
      }
    })

    for (const stat of monthlyLateStats) {
      const employee = await db.employee.findUnique({
        where: { id: stat.employeeId },
        select: { id: true, fullName: true, employeeCode: true }
      })

      if (employee) {
        anomalies.push({
          id: nanoid(),
          category: 'ATTENDANCE',
          severity: stat._count >= thresholds.monthlyLateCount * 2 ? 'HIGH' : 'MEDIUM',
          title: 'Đi muộn nhiều lần',
          description: `Nhân viên ${employee.fullName} đã đi muộn ${stat._count} lần trong tháng`,
          entityType: 'EMPLOYEE',
          entityId: employee.id,
          entityName: `${employee.fullName} (${employee.employeeCode})`,
          details: [
            { field: 'Số lần đi muộn', expected: `< ${thresholds.monthlyLateCount}`, actual: stat._count }
          ],
          detectedAt: new Date()
        })
      }
    }

    // 2. Employees with consecutive absences
    const recentAbsences = await db.attendance.findMany({
      where: {
        tenantId: this.tenantId,
        date: { gte: weekAgo },
        status: 'ABSENT'
      },
      select: {
        employeeId: true,
        date: true,
        employee: {
          select: { fullName: true, employeeCode: true }
        }
      },
      orderBy: [{ employeeId: 'asc' }, { date: 'asc' }]
    })

    // Group by employee and check for consecutive days
    const employeeAbsences = new Map<string, { dates: Date[]; name: string; code: string }>()
    for (const absence of recentAbsences) {
      const existing = employeeAbsences.get(absence.employeeId)
      if (existing) {
        existing.dates.push(absence.date)
      } else {
        employeeAbsences.set(absence.employeeId, {
          dates: [absence.date],
          name: absence.employee.fullName,
          code: absence.employee.employeeCode
        })
      }
    }

    for (const [employeeId, data] of Array.from(employeeAbsences.entries())) {
      if (data.dates.length >= thresholds.consecutiveAbsentDays) {
        // Check if dates are consecutive
        const sortedDates = data.dates.sort((a: Date, b: Date) => a.getTime() - b.getTime())
        let consecutive = 1
        let maxConsecutive = 1

        for (let i = 1; i < sortedDates.length; i++) {
          const diff = (sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / (1000 * 60 * 60 * 24)
          if (diff === 1) {
            consecutive++
            maxConsecutive = Math.max(maxConsecutive, consecutive)
          } else {
            consecutive = 1
          }
        }

        if (maxConsecutive >= thresholds.consecutiveAbsentDays) {
          anomalies.push({
            id: nanoid(),
            category: 'ATTENDANCE',
            severity: maxConsecutive >= 3 ? 'HIGH' : 'MEDIUM',
            title: 'Vắng mặt liên tiếp',
            description: `Nhân viên ${data.name} vắng mặt ${maxConsecutive} ngày liên tiếp`,
            entityType: 'EMPLOYEE',
            entityId: employeeId,
            entityName: `${data.name} (${data.code})`,
            details: [
              { field: 'Ngày vắng liên tiếp', expected: `< ${thresholds.consecutiveAbsentDays}`, actual: maxConsecutive }
            ],
            detectedAt: new Date()
          })
        }
      }
    }

    // 3. Excessive late minutes
    const excessiveLate = await db.attendance.findMany({
      where: {
        tenantId: this.tenantId,
        date: { gte: weekAgo },
        lateMinutes: { gte: thresholds.lateMinutesCritical }
      },
      include: {
        employee: {
          select: { fullName: true, employeeCode: true }
        }
      }
    })

    for (const record of excessiveLate) {
      const lateMinutes = Number(record.lateMinutes)
      anomalies.push({
        id: nanoid(),
        category: 'ATTENDANCE',
        severity: lateMinutes >= 120 ? 'CRITICAL' : 'HIGH',
        title: 'Đi muộn nghiêm trọng',
        description: `${record.employee.fullName} đi muộn ${lateMinutes} phút ngày ${record.date.toLocaleDateString('vi-VN')}`,
        entityType: 'EMPLOYEE',
        entityId: record.employeeId,
        entityName: `${record.employee.fullName} (${record.employee.employeeCode})`,
        details: [
          { field: 'Số phút đi muộn', expected: `< ${thresholds.lateMinutesCritical}`, actual: lateMinutes },
          { field: 'Ngày', expected: '-', actual: record.date.toLocaleDateString('vi-VN') }
        ],
        detectedAt: new Date()
      })
    }

    return anomalies
  }

  /**
   * Detect payroll anomalies
   */
  private async detectPayrollAnomalies(context: AnomalyContext): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = []
    const thresholds = ANOMALY_THRESHOLDS.payroll

    // Get employees with active contracts and their positions
    const employeesWithContracts = await db.employee.findMany({
      where: {
        tenantId: this.tenantId,
        status: { in: ['ACTIVE', 'PROBATION'] },
        deletedAt: null,
        positionId: { not: null },
        contracts: {
          some: { status: 'ACTIVE' }
        }
      },
      include: {
        position: { select: { id: true, name: true } },
        contracts: {
          where: { status: 'ACTIVE' },
          orderBy: { startDate: 'desc' },
          take: 1,
          select: { baseSalary: true }
        }
      }
    })

    // Group by position and calculate stats
    const positionSalaries = new Map<string, { name: string; salaries: number[] }>()

    for (const emp of employeesWithContracts) {
      if (!emp.positionId || !emp.position || !emp.contracts[0]) continue

      const salary = Number(emp.contracts[0].baseSalary)
      const existing = positionSalaries.get(emp.positionId)

      if (existing) {
        existing.salaries.push(salary)
      } else {
        positionSalaries.set(emp.positionId, {
          name: emp.position.name,
          salaries: [salary]
        })
      }
    }

    // Find outliers for each position
    for (const [positionId, data] of Array.from(positionSalaries.entries())) {
      if (data.salaries.length < 2) continue // Need at least 2 employees for comparison

      const avgSalary = data.salaries.reduce((a, b) => a + b, 0) / data.salaries.length
      const lowerBound = avgSalary * (1 - thresholds.salaryDeviationPercent / 100)
      const upperBound = avgSalary * (1 + thresholds.salaryDeviationPercent / 100)

      // Find employees with outlier salaries
      const outliersForPosition = employeesWithContracts.filter(emp =>
        emp.positionId === positionId &&
        emp.contracts[0] &&
        (Number(emp.contracts[0].baseSalary) < lowerBound || Number(emp.contracts[0].baseSalary) > upperBound)
      )

      for (const outlier of outliersForPosition) {
        const salary = Number(outlier.contracts[0].baseSalary)
        const deviation = Math.round(((salary - avgSalary) / avgSalary) * 100)

        anomalies.push({
          id: nanoid(),
          category: 'PAYROLL',
          severity: Math.abs(deviation) > 30 ? 'HIGH' : 'MEDIUM',
          title: deviation > 0 ? 'Lương cao bất thường' : 'Lương thấp bất thường',
          description: `${outlier.fullName} có lương ${deviation > 0 ? 'cao hơn' : 'thấp hơn'} ${Math.abs(deviation)}% so với trung bình vị trí ${data.name}`,
          entityType: 'EMPLOYEE',
          entityId: outlier.id,
          entityName: `${outlier.fullName} (${outlier.employeeCode})`,
          details: [
            { field: 'Lương hiện tại', expected: avgSalary.toLocaleString('vi-VN'), actual: salary.toLocaleString('vi-VN') },
            { field: 'Độ lệch', expected: `±${thresholds.salaryDeviationPercent}%`, actual: `${deviation}%`, deviation: Math.abs(deviation) }
          ],
          detectedAt: new Date()
        })
      }
    }

    return anomalies
  }

  /**
   * Detect leave anomalies
   */
  private async detectLeaveAnomalies(context: AnomalyContext): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = []
    const thresholds = ANOMALY_THRESHOLDS.leave
    const currentYear = new Date().getFullYear()
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

    // 1. Employees with too many leave requests this month
    const monthlyLeaveRequests = await db.leaveRequest.groupBy({
      by: ['employeeId'],
      where: {
        tenantId: this.tenantId,
        createdAt: { gte: monthStart }
      },
      _count: true,
      having: {
        employeeId: { _count: { gte: thresholds.monthlyLeaveRequestsWarning } }
      }
    })

    for (const stat of monthlyLeaveRequests) {
      const employee = await db.employee.findUnique({
        where: { id: stat.employeeId },
        select: { fullName: true, employeeCode: true }
      })

      if (employee) {
        anomalies.push({
          id: nanoid(),
          category: 'LEAVE',
          severity: stat._count >= 5 ? 'HIGH' : 'MEDIUM',
          title: 'Nhiều đơn nghỉ phép',
          description: `${employee.fullName} đã gửi ${stat._count} đơn nghỉ phép trong tháng`,
          entityType: 'EMPLOYEE',
          entityId: stat.employeeId,
          entityName: `${employee.fullName} (${employee.employeeCode})`,
          details: [
            { field: 'Số đơn trong tháng', expected: `< ${thresholds.monthlyLeaveRequestsWarning}`, actual: stat._count }
          ],
          detectedAt: new Date()
        })
      }
    }

    // 2. Employees not using their leave
    const unusedLeaveBalances = await db.leaveBalance.findMany({
      where: {
        tenantId: this.tenantId,
        year: currentYear,
        available: { gte: thresholds.unusedLeaveWarning },
        entitlement: { gte: 10 }
      },
      include: {
        employee: { select: { fullName: true, employeeCode: true } },
        policy: { select: { name: true } }
      }
    })

    // Only flag if we're past Q3
    const currentMonth = new Date().getMonth()
    if (currentMonth >= 8) { // September onwards
      for (const balance of unusedLeaveBalances) {
        const available = Number(balance.available)
        const entitlement = Number(balance.entitlement)
        const usageRate = Math.round(((entitlement - available) / entitlement) * 100)

        if (usageRate < 50) {
          anomalies.push({
            id: nanoid(),
            category: 'LEAVE',
            severity: usageRate < 25 ? 'MEDIUM' : 'LOW',
            title: 'Chưa sử dụng nhiều ngày phép',
            description: `${balance.employee.fullName} còn ${available} ngày phép ${balance.policy.name} chưa sử dụng (${usageRate}% đã dùng)`,
            entityType: 'EMPLOYEE',
            entityId: balance.employeeId,
            entityName: `${balance.employee.fullName} (${balance.employee.employeeCode})`,
            details: [
              { field: 'Ngày phép còn lại', expected: `< ${thresholds.unusedLeaveWarning}`, actual: available },
              { field: 'Tỷ lệ sử dụng', expected: '> 50%', actual: `${usageRate}%` }
            ],
            detectedAt: new Date()
          })
        }
      }
    }

    // 3. Long consecutive leave
    const longLeaves = await db.leaveRequest.findMany({
      where: {
        tenantId: this.tenantId,
        status: 'APPROVED',
        totalDays: { gte: thresholds.consecutiveLeaveWarning }
      },
      include: {
        employee: { select: { fullName: true, employeeCode: true } }
      }
    })

    for (const leave of longLeaves) {
      anomalies.push({
        id: nanoid(),
        category: 'LEAVE',
        severity: Number(leave.totalDays) >= 15 ? 'HIGH' : 'MEDIUM',
        title: 'Nghỉ phép dài ngày',
        description: `${leave.employee.fullName} nghỉ ${leave.totalDays} ngày liên tiếp từ ${leave.startDate.toLocaleDateString('vi-VN')}`,
        entityType: 'EMPLOYEE',
        entityId: leave.employeeId,
        entityName: `${leave.employee.fullName} (${leave.employee.employeeCode})`,
        details: [
          { field: 'Số ngày nghỉ', expected: `< ${thresholds.consecutiveLeaveWarning}`, actual: Number(leave.totalDays) },
          { field: 'Từ ngày', expected: '-', actual: leave.startDate.toLocaleDateString('vi-VN') }
        ],
        detectedAt: new Date()
      })
    }

    return anomalies
  }

  /**
   * Detect overtime anomalies
   */
  private async detectOvertimeAnomalies(context: AnomalyContext): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = []
    const thresholds = ANOMALY_THRESHOLDS.overtime
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

    // Monthly overtime hours
    const monthlyOT = await db.attendance.groupBy({
      by: ['employeeId'],
      where: {
        tenantId: this.tenantId,
        date: { gte: monthStart },
        otHours: { gt: 0 }
      },
      _sum: { otHours: true }
    })

    for (const stat of monthlyOT) {
      const totalOT = Number(stat._sum.otHours || 0)

      if (totalOT >= thresholds.monthlyOtHoursWarning) {
        const employee = await db.employee.findUnique({
          where: { id: stat.employeeId },
          select: { fullName: true, employeeCode: true }
        })

        if (employee) {
          anomalies.push({
            id: nanoid(),
            category: 'OVERTIME',
            severity: totalOT >= 60 ? 'CRITICAL' : totalOT >= 50 ? 'HIGH' : 'MEDIUM',
            title: 'Tăng ca quá nhiều',
            description: `${employee.fullName} đã tăng ca ${totalOT} giờ trong tháng`,
            entityType: 'EMPLOYEE',
            entityId: stat.employeeId,
            entityName: `${employee.fullName} (${employee.employeeCode})`,
            details: [
              { field: 'Giờ tăng ca tháng', expected: `< ${thresholds.monthlyOtHoursWarning}`, actual: totalOT }
            ],
            detectedAt: new Date()
          })
        }
      }
    }

    return anomalies
  }

  /**
   * Generate summary statistics
   */
  private generateSummary(anomalies: Anomaly[]): AnomalyDetectionResult['summary'] {
    const byCategory: Record<AnomalyCategory, number> = {
      ATTENDANCE: 0,
      PAYROLL: 0,
      LEAVE: 0,
      OVERTIME: 0,
      PERFORMANCE: 0,
      COMPLIANCE: 0
    }

    const bySeverity: Record<AnomalySeverity, number> = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0
    }

    for (const anomaly of anomalies) {
      byCategory[anomaly.category]++
      bySeverity[anomaly.severity]++
    }

    return {
      total: anomalies.length,
      byCategory,
      bySeverity
    }
  }

  /**
   * Get AI analysis for an anomaly
   */
  async analyzeAnomaly(anomaly: Anomaly): Promise<{ analysis: string; recommendation: string }> {
    try {
      const prompt = `Phân tích anomaly HR sau và đưa ra recommendation:

Loại: ${anomaly.category}
Mức độ: ${anomaly.severity}
Tiêu đề: ${anomaly.title}
Mô tả: ${anomaly.description}
Chi tiết: ${JSON.stringify(anomaly.details)}

Trả về JSON:
{
  "analysis": "Phân tích ngắn gọn (2-3 câu)",
  "recommendation": "Đề xuất hành động cụ thể"
}`

      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      })

      const textBlock = response.content.find(
        (block): block is Anthropic.TextBlock => block.type === 'text'
      )

      if (textBlock?.text) {
        const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0])
        }
      }
    } catch (error) {
      console.error('Error analyzing anomaly:', error)
    }

    return {
      analysis: 'Không thể phân tích',
      recommendation: 'Vui lòng kiểm tra thủ công'
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// FACTORY FUNCTION
// ═══════════════════════════════════════════════════════════════

export function createAnomalyDetector(tenantId: string): AnomalyDetector {
  return new AnomalyDetector(tenantId)
}
