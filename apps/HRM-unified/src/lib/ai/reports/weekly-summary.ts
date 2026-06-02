// src/lib/ai/reports/weekly-summary.ts
// Weekly AI Summary Generator

import Anthropic from '@anthropic-ai/sdk'
import { db } from '@/lib/db'
import { WeeklySummary, SummaryContext } from './types'

// ═══════════════════════════════════════════════════════════════
// WEEKLY SUMMARY GENERATOR CLASS
// ═══════════════════════════════════════════════════════════════

export class WeeklySummaryGenerator {
  private client: Anthropic
  private tenantId: string

  constructor(tenantId: string) {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || ''
    })
    this.tenantId = tenantId
  }

  /**
   * Generate weekly summary
   */
  async generateSummary(context: SummaryContext): Promise<WeeklySummary> {
    // Calculate date range (default: last 7 days)
    const endDate = context.endDate || new Date()
    const startDate = context.startDate || new Date(endDate)
    if (!context.startDate) {
      startDate.setDate(startDate.getDate() - 7)
    }

    // Calculate week number
    const weekNumber = this.getWeekNumber(endDate)

    // Gather all data in parallel
    const [
      workforceData,
      attendanceData,
      leaveData,
      overtimeData
    ] = await Promise.all([
      this.gatherWorkforceData(startDate, endDate),
      this.gatherAttendanceData(startDate, endDate),
      this.gatherLeaveData(startDate, endDate),
      this.gatherOvertimeData(startDate, endDate)
    ])

    // Generate AI analysis
    const { highlights, concerns, analysis, recommendations } = await this.generateAIAnalysis({
      workforce: workforceData,
      attendance: attendanceData,
      leave: leaveData,
      overtime: overtimeData,
      period: { start: startDate, end: endDate }
    })

    return {
      period: {
        start: startDate,
        end: endDate,
        weekNumber
      },
      workforce: workforceData,
      attendance: attendanceData,
      leave: leaveData,
      overtime: overtimeData,
      highlights,
      concerns,
      aiAnalysis: analysis,
      recommendations,
      generatedAt: new Date()
    }
  }

  /**
   * Gather workforce data
   */
  private async gatherWorkforceData(startDate: Date, endDate: Date): Promise<WeeklySummary['workforce']> {
    const totalEmployees = await db.employee.count({
      where: {
        tenantId: this.tenantId,
        status: { in: ['ACTIVE', 'PROBATION'] },
        deletedAt: null
      }
    })

    const newHires = await db.employee.count({
      where: {
        tenantId: this.tenantId,
        hireDate: { gte: startDate, lte: endDate },
        deletedAt: null
      }
    })

    const resignations = await db.employee.count({
      where: {
        tenantId: this.tenantId,
        status: 'RESIGNED',
        resignationDate: { gte: startDate, lte: endDate },
        deletedAt: null
      }
    })

    // Promotions (salary increases or position changes via contracts)
    const promotions = await db.contract.count({
      where: {
        tenantId: this.tenantId,
        startDate: { gte: startDate, lte: endDate },
        employee: {
          contracts: {
            some: {
              startDate: { lt: startDate }
            }
          }
        }
      }
    })

    return {
      totalEmployees,
      newHires,
      resignations,
      promotions,
      statusChanges: [] // Simplified for now
    }
  }

  /**
   * Gather attendance data
   */
  private async gatherAttendanceData(startDate: Date, endDate: Date): Promise<WeeklySummary['attendance']> {
    const attendances = await db.attendance.findMany({
      where: {
        tenantId: this.tenantId,
        date: { gte: startDate, lte: endDate }
      },
      include: {
        employee: { select: { fullName: true } }
      }
    })

    const totalRecords = attendances.length
    const presentRecords = attendances.filter(a => a.status === 'PRESENT').length
    const lateRecords = attendances.filter(a => ['LATE', 'LATE_AND_EARLY'].includes(a.status))
    const absentRecords = attendances.filter(a => a.status === 'ABSENT').length

    const averageAttendanceRate = totalRecords > 0
      ? Math.round(((presentRecords + lateRecords.length) / totalRecords) * 100)
      : 0

    // Top late employees
    const lateByEmployee = new Map<string, { name: string; count: number }>()
    for (const record of lateRecords) {
      const existing = lateByEmployee.get(record.employeeId)
      if (existing) {
        existing.count++
      } else {
        lateByEmployee.set(record.employeeId, {
          name: record.employee.fullName,
          count: 1
        })
      }
    }

    const topLateEmployees = Array.from(lateByEmployee.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(e => ({ employeeName: e.name, count: e.count }))

    // Weekday breakdown
    const weekdays = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
    const weekdayStats = new Map<number, { total: number; present: number; late: number }>()

    for (const record of attendances) {
      const dayOfWeek = record.date.getDay()
      const existing = weekdayStats.get(dayOfWeek) || { total: 0, present: 0, late: 0 }
      existing.total++
      if (record.status === 'PRESENT') existing.present++
      if (['LATE', 'LATE_AND_EARLY'].includes(record.status)) existing.late++
      weekdayStats.set(dayOfWeek, existing)
    }

    const weekdayBreakdown = Array.from(weekdayStats.entries())
      .filter(([day]) => day >= 1 && day <= 5) // Mon-Fri only
      .map(([day, stats]) => ({
        day: weekdays[day],
        attendanceRate: stats.total > 0 ? Math.round(((stats.present + stats.late) / stats.total) * 100) : 0,
        lateCount: stats.late
      }))
      .sort((a, b) => weekdays.indexOf(a.day) - weekdays.indexOf(b.day))

    return {
      averageAttendanceRate,
      totalLateInstances: lateRecords.length,
      totalAbsences: absentRecords,
      topLateEmployees,
      weekdayBreakdown
    }
  }

  /**
   * Gather leave data
   */
  private async gatherLeaveData(startDate: Date, endDate: Date): Promise<WeeklySummary['leave']> {
    const leaveRequests = await db.leaveRequest.findMany({
      where: {
        tenantId: this.tenantId,
        createdAt: { gte: startDate, lte: endDate }
      },
      include: {
        policy: { select: { leaveType: true, name: true } }
      }
    })

    const totalRequests = leaveRequests.length
    const approvedRequests = leaveRequests.filter(lr => lr.status === 'APPROVED')
    const approvedDays = approvedRequests.reduce((sum, lr) => sum + Number(lr.totalDays), 0)
    const pendingRequests = leaveRequests.filter(lr => lr.status === 'PENDING').length

    // Top leave types
    const leaveTypeCount = new Map<string, number>()
    for (const request of leaveRequests) {
      const leaveType = request.policy.leaveType
      const current = leaveTypeCount.get(leaveType) || 0
      leaveTypeCount.set(leaveType, current + 1)
    }

    const topLeaveTypes = Array.from(leaveTypeCount.entries())
      .map(([type, count]) => ({ type: this.formatLeaveType(type), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      totalRequests,
      approvedDays,
      pendingRequests,
      topLeaveTypes
    }
  }

  /**
   * Gather overtime data
   */
  private async gatherOvertimeData(startDate: Date, endDate: Date): Promise<WeeklySummary['overtime']> {
    const overtimeRecords = await db.attendance.findMany({
      where: {
        tenantId: this.tenantId,
        date: { gte: startDate, lte: endDate },
        otHours: { gt: 0 }
      },
      include: {
        employee: { select: { fullName: true } }
      }
    })

    const totalHours = overtimeRecords.reduce((sum, r) => sum + Number(r.otHours || 0), 0)
    const employeeIds = new Set(overtimeRecords.map(r => r.employeeId))
    const totalEmployees = employeeIds.size
    const averageHoursPerEmployee = totalEmployees > 0
      ? Math.round((totalHours / totalEmployees) * 10) / 10
      : 0

    // Top overtime employees
    const otByEmployee = new Map<string, { name: string; hours: number }>()
    for (const record of overtimeRecords) {
      const existing = otByEmployee.get(record.employeeId)
      if (existing) {
        existing.hours += Number(record.otHours || 0)
      } else {
        otByEmployee.set(record.employeeId, {
          name: record.employee.fullName,
          hours: Number(record.otHours || 0)
        })
      }
    }

    const topOvertimeEmployees = Array.from(otByEmployee.values())
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5)
      .map(e => ({ employeeName: e.name, hours: Math.round(e.hours * 10) / 10 }))

    return {
      totalHours: Math.round(totalHours * 10) / 10,
      totalEmployees,
      averageHoursPerEmployee,
      topOvertimeEmployees
    }
  }

  /**
   * Generate AI analysis
   */
  private async generateAIAnalysis(data: {
    workforce: WeeklySummary['workforce']
    attendance: WeeklySummary['attendance']
    leave: WeeklySummary['leave']
    overtime: WeeklySummary['overtime']
    period: { start: Date; end: Date }
  }): Promise<{
    highlights: string[]
    concerns: string[]
    analysis: string
    recommendations: string[]
  }> {
    try {
      const prompt = `Bạn là HR analyst. Phân tích dữ liệu HR tuần này và đưa ra báo cáo.

Thời gian: ${data.period.start.toLocaleDateString('vi-VN')} - ${data.period.end.toLocaleDateString('vi-VN')}

Dữ liệu:
- Nhân sự: ${data.workforce.totalEmployees} NV, +${data.workforce.newHires} mới, -${data.workforce.resignations} nghỉ việc
- Chấm công: Tỷ lệ ${data.attendance.averageAttendanceRate}%, ${data.attendance.totalLateInstances} lần đi muộn, ${data.attendance.totalAbsences} vắng
- Nghỉ phép: ${data.leave.totalRequests} đơn, ${data.leave.approvedDays} ngày được duyệt, ${data.leave.pendingRequests} chờ duyệt
- Tăng ca: ${data.overtime.totalHours}h tổng, ${data.overtime.totalEmployees} NV tăng ca, TB ${data.overtime.averageHoursPerEmployee}h/NV

Trả về JSON:
{
  "highlights": ["3 điểm nổi bật tích cực"],
  "concerns": ["2-3 vấn đề cần lưu ý"],
  "analysis": "Đoạn phân tích tổng quan 2-3 câu",
  "recommendations": ["3 đề xuất hành động cụ thể"]
}`

      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
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
      console.error('Error generating AI analysis:', error)
    }

    // Fallback
    return this.generateFallbackAnalysis(data)
  }

  /**
   * Generate fallback analysis without AI
   */
  private generateFallbackAnalysis(data: {
    workforce: WeeklySummary['workforce']
    attendance: WeeklySummary['attendance']
    leave: WeeklySummary['leave']
    overtime: WeeklySummary['overtime']
  }): {
    highlights: string[]
    concerns: string[]
    analysis: string
    recommendations: string[]
  } {
    const highlights: string[] = []
    const concerns: string[] = []
    const recommendations: string[] = []

    // Workforce highlights
    if (data.workforce.newHires > 0) {
      highlights.push(`Chào đón ${data.workforce.newHires} nhân viên mới`)
    }

    if (data.attendance.averageAttendanceRate >= 95) {
      highlights.push(`Tỷ lệ chấm công cao: ${data.attendance.averageAttendanceRate}%`)
    }

    // Concerns
    if (data.workforce.resignations > 0) {
      concerns.push(`${data.workforce.resignations} nhân viên nghỉ việc trong tuần`)
    }

    if (data.attendance.totalLateInstances > 10) {
      concerns.push(`Số lần đi muộn cao: ${data.attendance.totalLateInstances} lần`)
    }

    if (data.overtime.totalHours > 100) {
      concerns.push(`Giờ tăng ca cao: ${data.overtime.totalHours}h`)
    }

    if (data.leave.pendingRequests > 5) {
      concerns.push(`${data.leave.pendingRequests} đơn nghỉ phép đang chờ duyệt`)
    }

    // Recommendations
    if (data.attendance.totalLateInstances > 5) {
      recommendations.push('Xem xét nhắc nhở nhân viên đi muộn thường xuyên')
    }

    if (data.overtime.averageHoursPerEmployee > 10) {
      recommendations.push('Đánh giá lại phân bổ công việc để giảm tăng ca')
    }

    if (data.leave.pendingRequests > 3) {
      recommendations.push('Xử lý các đơn nghỉ phép đang chờ duyệt')
    }

    if (highlights.length === 0) {
      highlights.push('Hoạt động tuần này ổn định')
    }

    const analysis = `Tổng quan tuần: ${data.workforce.totalEmployees} nhân viên với tỷ lệ chấm công ${data.attendance.averageAttendanceRate}%. ` +
      (data.workforce.newHires > 0 ? `Có ${data.workforce.newHires} nhân viên mới. ` : '') +
      (data.overtime.totalHours > 0 ? `Tổng giờ tăng ca ${data.overtime.totalHours}h.` : '')

    return {
      highlights,
      concerns,
      analysis,
      recommendations
    }
  }

  /**
   * Get week number
   */
  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  }

  /**
   * Format leave type
   */
  private formatLeaveType(type: string): string {
    const types: Record<string, string> = {
      ANNUAL: 'Phép năm',
      SICK: 'Ốm đau',
      PERSONAL: 'Việc riêng',
      WEDDING: 'Cưới',
      BEREAVEMENT: 'Tang',
      MATERNITY: 'Thai sản',
      PATERNITY: 'Chăm con',
      UNPAID: 'Không lương'
    }
    return types[type] || type
  }
}

// ═══════════════════════════════════════════════════════════════
// FACTORY FUNCTION
// ═══════════════════════════════════════════════════════════════

export function createWeeklySummaryGenerator(tenantId: string): WeeklySummaryGenerator {
  return new WeeklySummaryGenerator(tenantId)
}
