// src/lib/ai/insights/dashboard-insights.ts
// Dashboard Insights Generator

import Anthropic from '@anthropic-ai/sdk'
import { db } from '@/lib/db'
import { nanoid } from 'nanoid'
import {
  DashboardInsight,
  InsightCategory,
  InsightSeverity,
  InsightsResult,
  InsightContext,
  InsightAction
} from './types'

// ═══════════════════════════════════════════════════════════════
// DASHBOARD INSIGHTS GENERATOR
// ═══════════════════════════════════════════════════════════════

export class DashboardInsightsGenerator {
  private client: Anthropic
  private tenantId: string

  constructor(tenantId: string) {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || ''
    })
    this.tenantId = tenantId
  }

  /**
   * Generate all dashboard insights
   */
  async generateInsights(context: InsightContext): Promise<InsightsResult> {
    const insights: DashboardInsight[] = []

    // Run all insight generators in parallel
    const [
      workforceInsights,
      attendanceInsights,
      leaveInsights,
      complianceInsights
    ] = await Promise.all([
      this.generateWorkforceInsights(),
      this.generateAttendanceInsights(),
      this.generateLeaveInsights(),
      this.generateComplianceInsights()
    ])

    insights.push(...workforceInsights)
    insights.push(...attendanceInsights)
    insights.push(...leaveInsights)
    insights.push(...complianceInsights)

    // Sort by severity (critical first)
    const severityOrder: Record<InsightSeverity, number> = {
      CRITICAL: 0,
      WARNING: 1,
      INFO: 2,
      SUCCESS: 3
    }
    insights.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

    // Generate summary
    const summary = {
      total: insights.length,
      critical: insights.filter(i => i.severity === 'CRITICAL').length,
      warning: insights.filter(i => i.severity === 'WARNING').length,
      info: insights.filter(i => i.severity === 'INFO').length,
      success: insights.filter(i => i.severity === 'SUCCESS').length
    }

    return {
      insights,
      summary,
      lastUpdated: new Date()
    }
  }

  /**
   * Generate workforce insights
   */
  private async generateWorkforceInsights(): Promise<DashboardInsight[]> {
    const insights: DashboardInsight[] = []
    const today = new Date()
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)

    // Total employees
    const totalEmployees = await db.employee.count({
      where: {
        tenantId: this.tenantId,
        status: { in: ['ACTIVE', 'PROBATION'] },
        deletedAt: null
      }
    })

    const lastMonthTotal = await db.employee.count({
      where: {
        tenantId: this.tenantId,
        status: { in: ['ACTIVE', 'PROBATION'] },
        hireDate: { lte: lastMonthEnd },
        deletedAt: null,
        OR: [
          { resignationDate: null },
          { resignationDate: { gt: lastMonthEnd } }
        ]
      }
    })

    // New hires this month
    const newHires = await db.employee.count({
      where: {
        tenantId: this.tenantId,
        hireDate: { gte: thisMonth },
        deletedAt: null
      }
    })

    // Resignations this month
    const resignations = await db.employee.count({
      where: {
        tenantId: this.tenantId,
        status: 'RESIGNED',
        resignationDate: { gte: thisMonth },
        deletedAt: null
      }
    })

    // Headcount insight
    const headcountChange = totalEmployees - lastMonthTotal
    if (headcountChange !== 0) {
      insights.push({
        id: nanoid(),
        category: 'WORKFORCE',
        severity: headcountChange < 0 ? 'WARNING' : 'INFO',
        title: headcountChange > 0 ? 'Nhân sự tăng trưởng' : 'Nhân sự giảm',
        message: headcountChange > 0
          ? `Tổng nhân sự tăng ${headcountChange} người so với tháng trước`
          : `Tổng nhân sự giảm ${Math.abs(headcountChange)} người so với tháng trước`,
        metric: {
          value: totalEmployees,
          label: 'nhân viên',
          trend: headcountChange > 0 ? 'up' : 'down',
          changePercent: lastMonthTotal > 0
            ? Math.round((headcountChange / lastMonthTotal) * 100 * 10) / 10
            : 0
        },
        actions: [
          { type: 'navigate', label: 'Xem danh sách', url: '/employees' },
          { type: 'create_report', label: 'Báo cáo chi tiết', params: { type: 'headcount' } }
        ],
        generatedAt: new Date()
      })
    }

    // New hires insight
    if (newHires > 0) {
      insights.push({
        id: nanoid(),
        category: 'WORKFORCE',
        severity: 'SUCCESS',
        title: 'Tuyển dụng thành công',
        message: `Đã tuyển ${newHires} nhân viên mới trong tháng này`,
        metric: {
          value: newHires,
          label: 'nhân viên mới',
          trend: 'up'
        },
        actions: [
          { type: 'navigate', label: 'Xem nhân viên mới', url: '/employees?status=new' }
        ],
        generatedAt: new Date()
      })
    }

    // Resignations insight
    if (resignations > 0) {
      const resignationRate = totalEmployees > 0
        ? Math.round((resignations / totalEmployees) * 100 * 10) / 10
        : 0

      insights.push({
        id: nanoid(),
        category: 'WORKFORCE',
        severity: resignationRate > 5 ? 'CRITICAL' : resignations > 3 ? 'WARNING' : 'INFO',
        title: 'Nhân viên nghỉ việc',
        message: `${resignations} nhân viên nghỉ việc trong tháng (tỷ lệ ${resignationRate}%)`,
        metric: {
          value: resignations,
          label: 'nghỉ việc',
          trend: 'up',
          changePercent: resignationRate
        },
        actions: [
          { type: 'navigate', label: 'Xem chi tiết', url: '/employees?status=resigned' },
          { type: 'view_details', label: 'Phân tích nguyên nhân', url: '/ai/predictions' }
        ],
        generatedAt: new Date()
      })
    }

    // Probation employees
    const probationCount = await db.employee.count({
      where: {
        tenantId: this.tenantId,
        status: 'PROBATION',
        deletedAt: null
      }
    })

    if (probationCount > 0) {
      insights.push({
        id: nanoid(),
        category: 'WORKFORCE',
        severity: 'INFO',
        title: 'Nhân viên thử việc',
        message: `Có ${probationCount} nhân viên đang trong giai đoạn thử việc`,
        metric: {
          value: probationCount,
          label: 'thử việc'
        },
        actions: [
          { type: 'navigate', label: 'Xem danh sách', url: '/employees?status=probation' }
        ],
        generatedAt: new Date()
      })
    }

    return insights
  }

  /**
   * Generate attendance insights
   */
  private async generateAttendanceInsights(): Promise<DashboardInsight[]> {
    const insights: DashboardInsight[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    // Today's attendance
    const todayAttendance = await db.attendance.groupBy({
      by: ['status'],
      where: {
        tenantId: this.tenantId,
        date: today
      },
      _count: true
    })

    const present = todayAttendance.find(a => a.status === 'PRESENT')?._count || 0
    const late = todayAttendance.filter(a =>
      ['LATE', 'LATE_AND_EARLY'].includes(a.status)
    ).reduce((sum, a) => sum + a._count, 0)
    const absent = todayAttendance.find(a => a.status === 'ABSENT')?._count || 0

    // Today attendance insight
    if (present > 0 || late > 0) {
      const totalToday = present + late + absent
      const lateRate = totalToday > 0 ? Math.round((late / totalToday) * 100) : 0

      insights.push({
        id: nanoid(),
        category: 'ATTENDANCE',
        severity: lateRate > 20 ? 'WARNING' : lateRate > 10 ? 'INFO' : 'SUCCESS',
        title: 'Chấm công hôm nay',
        message: `${present} đúng giờ, ${late} đi muộn (${lateRate}%), ${absent} vắng mặt`,
        metric: {
          value: `${present + late}/${totalToday}`,
          label: 'có mặt'
        },
        actions: [
          { type: 'navigate', label: 'Chi tiết chấm công', url: '/attendance' }
        ],
        generatedAt: new Date()
      })
    }

    // Weekly late pattern
    const weeklyLate = await db.attendance.count({
      where: {
        tenantId: this.tenantId,
        date: { gte: weekAgo },
        status: { in: ['LATE', 'LATE_AND_EARLY'] }
      }
    })

    const weeklyTotal = await db.attendance.count({
      where: {
        tenantId: this.tenantId,
        date: { gte: weekAgo }
      }
    })

    if (weeklyTotal > 0) {
      const weeklyLateRate = Math.round((weeklyLate / weeklyTotal) * 100)

      if (weeklyLateRate > 15) {
        insights.push({
          id: nanoid(),
          category: 'ATTENDANCE',
          severity: weeklyLateRate > 25 ? 'CRITICAL' : 'WARNING',
          title: 'Xu hướng đi muộn cao',
          message: `${weeklyLateRate}% nhân viên đi muộn trong tuần qua (${weeklyLate}/${weeklyTotal})`,
          metric: {
            value: weeklyLateRate,
            label: '% đi muộn',
            trend: 'up'
          },
          actions: [
            { type: 'navigate', label: 'Xem báo cáo', url: '/attendance/reports' },
            { type: 'send_notification', label: 'Nhắc nhở nhân viên' }
          ],
          generatedAt: new Date()
        })
      }
    }

    // Frequent late employees
    const frequentLate = await db.attendance.groupBy({
      by: ['employeeId'],
      where: {
        tenantId: this.tenantId,
        date: { gte: weekAgo },
        status: { in: ['LATE', 'LATE_AND_EARLY'] }
      },
      _count: true,
      having: {
        employeeId: { _count: { gte: 3 } }
      }
    })

    if (frequentLate.length > 0) {
      insights.push({
        id: nanoid(),
        category: 'ATTENDANCE',
        severity: 'WARNING',
        title: 'Nhân viên đi muộn thường xuyên',
        message: `${frequentLate.length} nhân viên đi muộn 3+ lần trong tuần`,
        metric: {
          value: frequentLate.length,
          label: 'nhân viên'
        },
        actions: [
          { type: 'view_details', label: 'Xem danh sách', url: '/attendance/late-report' }
        ],
        generatedAt: new Date()
      })
    }

    return insights
  }

  /**
   * Generate leave insights
   */
  private async generateLeaveInsights(): Promise<DashboardInsight[]> {
    const insights: DashboardInsight[] = []

    // Pending leave requests
    const pendingLeaves = await db.leaveRequest.count({
      where: {
        tenantId: this.tenantId,
        status: 'PENDING'
      }
    })

    if (pendingLeaves > 0) {
      insights.push({
        id: nanoid(),
        category: 'LEAVE',
        severity: pendingLeaves > 10 ? 'WARNING' : 'INFO',
        title: 'Đơn nghỉ phép chờ duyệt',
        message: `Có ${pendingLeaves} đơn nghỉ phép đang chờ phê duyệt`,
        metric: {
          value: pendingLeaves,
          label: 'đơn chờ duyệt'
        },
        actions: [
          { type: 'navigate', label: 'Duyệt đơn', url: '/leave/approvals' }
        ],
        generatedAt: new Date()
      })
    }

    // Leave balance check - low balance
    const lowBalanceEmployees = await db.leaveBalance.count({
      where: {
        tenantId: this.tenantId,
        year: new Date().getFullYear(),
        available: { lt: 2 },
        entitlement: { gt: 5 }
      }
    })

    if (lowBalanceEmployees > 0) {
      insights.push({
        id: nanoid(),
        category: 'LEAVE',
        severity: 'INFO',
        title: 'Nhân viên sắp hết phép',
        message: `${lowBalanceEmployees} nhân viên còn ít hơn 2 ngày phép năm`,
        metric: {
          value: lowBalanceEmployees,
          label: 'nhân viên'
        },
        actions: [
          { type: 'view_details', label: 'Xem chi tiết', url: '/leave/balances?filter=low' }
        ],
        generatedAt: new Date()
      })
    }

    // Upcoming approved leaves
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    const nextWeek = new Date(tomorrow)
    nextWeek.setDate(nextWeek.getDate() + 7)

    const upcomingLeaves = await db.leaveRequest.count({
      where: {
        tenantId: this.tenantId,
        status: 'APPROVED',
        startDate: {
          gte: tomorrow,
          lte: nextWeek
        }
      }
    })

    if (upcomingLeaves > 0) {
      insights.push({
        id: nanoid(),
        category: 'LEAVE',
        severity: upcomingLeaves > 5 ? 'WARNING' : 'INFO',
        title: 'Nhân viên nghỉ tuần tới',
        message: `${upcomingLeaves} nhân viên đã đăng ký nghỉ trong 7 ngày tới`,
        metric: {
          value: upcomingLeaves,
          label: 'nghỉ phép'
        },
        actions: [
          { type: 'navigate', label: 'Xem lịch nghỉ', url: '/leave/calendar' }
        ],
        generatedAt: new Date()
      })
    }

    return insights
  }

  /**
   * Generate compliance insights
   */
  private async generateComplianceInsights(): Promise<DashboardInsight[]> {
    const insights: DashboardInsight[] = []
    const today = new Date()
    const thirtyDays = new Date(today)
    thirtyDays.setDate(thirtyDays.getDate() + 30)

    // Expiring contracts
    const expiringContracts = await db.contract.count({
      where: {
        tenantId: this.tenantId,
        status: 'ACTIVE',
        endDate: {
          gte: today,
          lte: thirtyDays
        }
      }
    })

    if (expiringContracts > 0) {
      insights.push({
        id: nanoid(),
        category: 'COMPLIANCE',
        severity: expiringContracts > 5 ? 'CRITICAL' : 'WARNING',
        title: 'Hợp đồng sắp hết hạn',
        message: `${expiringContracts} hợp đồng sẽ hết hạn trong 30 ngày tới`,
        metric: {
          value: expiringContracts,
          label: 'hợp đồng'
        },
        actions: [
          { type: 'navigate', label: 'Xem danh sách', url: '/contracts?filter=expiring' },
          { type: 'create_report', label: 'Báo cáo', params: { type: 'expiring_contracts' } }
        ],
        generatedAt: new Date()
      })
    }

    // Expired contracts (past due)
    const expiredContracts = await db.contract.count({
      where: {
        tenantId: this.tenantId,
        status: 'ACTIVE',
        endDate: { lt: today }
      }
    })

    if (expiredContracts > 0) {
      insights.push({
        id: nanoid(),
        category: 'COMPLIANCE',
        severity: 'CRITICAL',
        title: 'Hợp đồng đã hết hạn',
        message: `${expiredContracts} hợp đồng đã hết hạn nhưng chưa được gia hạn`,
        metric: {
          value: expiredContracts,
          label: 'hợp đồng'
        },
        actions: [
          { type: 'navigate', label: 'Xử lý ngay', url: '/contracts?filter=expired' }
        ],
        generatedAt: new Date()
      })
    }

    // Missing documents check - simplified
    const employeesWithoutContracts = await db.employee.count({
      where: {
        tenantId: this.tenantId,
        status: { in: ['ACTIVE', 'PROBATION'] },
        deletedAt: null,
        contracts: { none: { status: 'ACTIVE' } }
      }
    })

    if (employeesWithoutContracts > 0) {
      insights.push({
        id: nanoid(),
        category: 'COMPLIANCE',
        severity: 'WARNING',
        title: 'Thiếu hợp đồng lao động',
        message: `${employeesWithoutContracts} nhân viên chưa có hợp đồng đang hiệu lực`,
        metric: {
          value: employeesWithoutContracts,
          label: 'nhân viên'
        },
        actions: [
          { type: 'navigate', label: 'Xem danh sách', url: '/employees?filter=no_contract' }
        ],
        generatedAt: new Date()
      })
    }

    return insights
  }

  /**
   * Generate AI-powered insight with Claude
   */
  async generateAIInsight(
    category: InsightCategory,
    data: Record<string, unknown>
  ): Promise<DashboardInsight | null> {
    try {
      const prompt = `Bạn là HR AI analyst. Phân tích dữ liệu sau và tạo insight ngắn gọn (2-3 câu):

Danh mục: ${category}
Dữ liệu: ${JSON.stringify(data, null, 2)}

Trả về JSON với format:
{
  "severity": "INFO|WARNING|CRITICAL|SUCCESS",
  "title": "Tiêu đề ngắn",
  "message": "Mô tả insight",
  "recommendation": "Đề xuất hành động"
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
          const parsed = JSON.parse(jsonMatch[0])

          return {
            id: nanoid(),
            category,
            severity: parsed.severity || 'INFO',
            title: parsed.title,
            message: parsed.message,
            actions: parsed.recommendation
              ? [{ type: 'view_details', label: parsed.recommendation }]
              : [],
            generatedAt: new Date()
          }
        }
      }
    } catch (error) {
      console.error('Error generating AI insight:', error)
    }

    return null
  }
}

// ═══════════════════════════════════════════════════════════════
// FACTORY FUNCTION
// ═══════════════════════════════════════════════════════════════

export function createDashboardInsightsGenerator(tenantId: string): DashboardInsightsGenerator {
  return new DashboardInsightsGenerator(tenantId)
}
