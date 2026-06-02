// src/lib/ai/automation/workflow-suggester.ts
// Workflow Suggestion Engine

import { db } from '@/lib/db'
import { nanoid } from 'nanoid'
import {
  WorkflowSuggestion,
  WorkflowType,
  WorkflowAction,
  AutomationContext
} from './types'

// ═══════════════════════════════════════════════════════════════
// WORKFLOW SUGGESTER CLASS
// ═══════════════════════════════════════════════════════════════

export class WorkflowSuggester {
  private tenantId: string

  constructor(tenantId: string) {
    this.tenantId = tenantId
  }

  /**
   * Get workflow suggestions based on context
   */
  async getSuggestions(context: AutomationContext): Promise<WorkflowSuggestion[]> {
    const suggestions: WorkflowSuggestion[] = []

    // Run all suggestion generators in parallel
    const [
      pendingApprovals,
      expiringContracts,
      leaveReminders,
      onboardingTasks,
      performanceReviews
    ] = await Promise.all([
      this.checkPendingApprovals(context),
      this.checkExpiringContracts(context),
      this.checkLeaveReminders(context),
      this.checkOnboardingTasks(context),
      this.checkPerformanceReviews(context)
    ])

    suggestions.push(...pendingApprovals)
    suggestions.push(...expiringContracts)
    suggestions.push(...leaveReminders)
    suggestions.push(...onboardingTasks)
    suggestions.push(...performanceReviews)

    // Sort by priority
    const priorityOrder: Record<string, number> = {
      HIGH: 0,
      MEDIUM: 1,
      LOW: 2
    }
    suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

    return suggestions
  }

  /**
   * Check for pending approvals
   */
  private async checkPendingApprovals(context: AutomationContext): Promise<WorkflowSuggestion[]> {
    const suggestions: WorkflowSuggestion[] = []

    // Only for managers and HR
    if (!['ADMIN', 'HR_MANAGER', 'HR_STAFF', 'MANAGER'].includes(context.role)) {
      return suggestions
    }

    const pendingCount = await db.approvalStep.count({
      where: {
        instance: { tenantId: this.tenantId },
        approverId: context.userId,
        status: 'PENDING'
      }
    })

    if (pendingCount > 0) {
      // Get details about pending items
      const pendingItems = await db.approvalStep.findMany({
        where: {
          instance: { tenantId: this.tenantId },
          approverId: context.userId,
          status: 'PENDING'
        },
        include: {
          instance: {
            include: {
              requester: { select: { name: true } }
            }
          }
        },
        take: 5
      })

      const leaveRequests = pendingItems.filter(p => p.instance.referenceType === 'LEAVE_REQUEST').length
      const otherRequests = pendingCount - leaveRequests

      suggestions.push({
        id: nanoid(),
        type: 'LEAVE_REQUEST',
        title: 'Yêu cầu chờ duyệt',
        description: `Bạn có ${pendingCount} yêu cầu đang chờ phê duyệt${leaveRequests > 0 ? ` (${leaveRequests} đơn nghỉ phép)` : ''}`,
        reason: 'Các yêu cầu nên được xử lý kịp thời để không ảnh hưởng đến công việc của nhân viên',
        priority: pendingCount > 5 ? 'HIGH' : 'MEDIUM',
        actions: [
          { type: 'navigate', label: 'Xem danh sách', url: '/approvals' },
          { type: 'navigate', label: 'Duyệt nhanh', url: '/approvals?mode=quick' }
        ],
        metadata: { count: pendingCount, leaveRequests, otherRequests },
        createdAt: new Date()
      })
    }

    return suggestions
  }

  /**
   * Check for expiring contracts
   */
  private async checkExpiringContracts(context: AutomationContext): Promise<WorkflowSuggestion[]> {
    const suggestions: WorkflowSuggestion[] = []

    // Only for HR
    if (!['ADMIN', 'HR_MANAGER', 'HR_STAFF'].includes(context.role)) {
      return suggestions
    }

    const today = new Date()
    const thirtyDays = new Date(today)
    thirtyDays.setDate(thirtyDays.getDate() + 30)

    const expiringContracts = await db.contract.findMany({
      where: {
        tenantId: this.tenantId,
        status: 'ACTIVE',
        endDate: {
          gte: today,
          lte: thirtyDays
        }
      },
      include: {
        employee: { select: { fullName: true, employeeCode: true } }
      },
      take: 10
    })

    if (expiringContracts.length > 0) {
      const urgentCount = expiringContracts.filter(c => {
        const daysLeft = Math.ceil((c.endDate!.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return daysLeft <= 7
      }).length

      suggestions.push({
        id: nanoid(),
        type: 'CONTRACT_RENEWAL',
        title: 'Hợp đồng sắp hết hạn',
        description: `${expiringContracts.length} hợp đồng sẽ hết hạn trong 30 ngày tới${urgentCount > 0 ? ` (${urgentCount} trong 7 ngày)` : ''}`,
        reason: 'Cần chuẩn bị gia hạn hoặc kết thúc hợp đồng trước khi hết hạn',
        priority: urgentCount > 0 ? 'HIGH' : 'MEDIUM',
        actions: [
          { type: 'navigate', label: 'Xem danh sách', url: '/contracts?filter=expiring' },
          { type: 'create', label: 'Tạo hợp đồng mới', url: '/contracts/new' }
        ],
        metadata: {
          total: expiringContracts.length,
          urgent: urgentCount,
          employees: expiringContracts.slice(0, 3).map(c => c.employee.fullName)
        },
        createdAt: new Date()
      })
    }

    return suggestions
  }

  /**
   * Check leave balance reminders
   */
  private async checkLeaveReminders(context: AutomationContext): Promise<WorkflowSuggestion[]> {
    const suggestions: WorkflowSuggestion[] = []

    // For employees - check their own balance
    if (context.employeeId) {
      const currentYear = new Date().getFullYear()
      const currentMonth = new Date().getMonth()

      // Only remind in Q4
      if (currentMonth >= 9) { // October onwards
        const leaveBalances = await db.leaveBalance.findMany({
          where: {
            tenantId: this.tenantId,
            employeeId: context.employeeId,
            year: currentYear,
            available: { gte: 5 }
          },
          include: {
            policy: { select: { name: true } }
          }
        })

        const totalUnused = leaveBalances.reduce((sum, lb) => sum + Number(lb.available), 0)

        if (totalUnused >= 5) {
          suggestions.push({
            id: nanoid(),
            type: 'LEAVE_REQUEST',
            title: 'Nhắc nhở sử dụng phép',
            description: `Bạn còn ${totalUnused} ngày phép chưa sử dụng trong năm nay`,
            reason: 'Ngày phép có thể bị mất nếu không sử dụng trước cuối năm (tùy chính sách)',
            priority: currentMonth >= 11 ? 'HIGH' : 'MEDIUM',
            actions: [
              { type: 'navigate', label: 'Xem chi tiết', url: '/ess/leave/balance' },
              { type: 'create', label: 'Tạo đơn nghỉ phép', url: '/ess/leave/request' }
            ],
            metadata: { totalUnused },
            createdAt: new Date()
          })
        }
      }
    }

    return suggestions
  }

  /**
   * Check onboarding tasks
   */
  private async checkOnboardingTasks(context: AutomationContext): Promise<WorkflowSuggestion[]> {
    const suggestions: WorkflowSuggestion[] = []

    // Only for HR
    if (!['ADMIN', 'HR_MANAGER', 'HR_STAFF'].includes(context.role)) {
      return suggestions
    }

    // Find new employees in probation without complete profiles
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const newEmployees = await db.employee.findMany({
      where: {
        tenantId: this.tenantId,
        status: 'PROBATION',
        hireDate: { gte: thirtyDaysAgo },
        deletedAt: null
      },
      select: {
        id: true,
        fullName: true,
        employeeCode: true,
        hireDate: true,
        _count: {
          select: { contracts: true }
        }
      }
    })

    const incompleteOnboarding = newEmployees.filter(e => e._count.contracts === 0)

    if (incompleteOnboarding.length > 0) {
      suggestions.push({
        id: nanoid(),
        type: 'EMPLOYEE_ONBOARDING',
        title: 'Onboarding chưa hoàn tất',
        description: `${incompleteOnboarding.length} nhân viên mới chưa có hợp đồng`,
        reason: 'Nhân viên cần được hoàn tất thủ tục onboarding trong thời gian quy định',
        priority: 'HIGH',
        actions: [
          { type: 'navigate', label: 'Xem danh sách', url: '/employees?filter=probation' }
        ],
        metadata: {
          employees: incompleteOnboarding.map(e => ({
            id: e.id,
            name: e.fullName,
            code: e.employeeCode
          }))
        },
        createdAt: new Date()
      })
    }

    return suggestions
  }

  /**
   * Check performance review reminders
   */
  private async checkPerformanceReviews(context: AutomationContext): Promise<WorkflowSuggestion[]> {
    const suggestions: WorkflowSuggestion[] = []

    // For managers - check pending reviews
    if (['MANAGER', 'HR_MANAGER', 'ADMIN'].includes(context.role)) {
      const pendingReviews = await db.performanceReview.count({
        where: {
          managerId: context.userId,
          status: { in: ['NOT_STARTED', 'SELF_REVIEW_DONE', 'MANAGER_REVIEW_PENDING'] }
        }
      })

      if (pendingReviews > 0) {
        suggestions.push({
          id: nanoid(),
          type: 'PERFORMANCE_REVIEW',
          title: 'Đánh giá hiệu suất',
          description: `Bạn có ${pendingReviews} đánh giá nhân viên đang chờ`,
          reason: 'Hoàn thành đánh giá đúng hạn giúp nhân viên nhận feedback kịp thời',
          priority: 'MEDIUM',
          actions: [
            { type: 'navigate', label: 'Xem danh sách', url: '/performance/reviews' }
          ],
          metadata: { count: pendingReviews },
          createdAt: new Date()
        })
      }
    }

    // For employees - check own pending self-review
    if (context.employeeId) {
      const selfReviews = await db.performanceReview.count({
        where: {
          employeeId: context.employeeId,
          status: 'NOT_STARTED'
        }
      })

      if (selfReviews > 0) {
        suggestions.push({
          id: nanoid(),
          type: 'PERFORMANCE_REVIEW',
          title: 'Tự đánh giá hiệu suất',
          description: `Bạn có ${selfReviews} bản tự đánh giá cần hoàn thành`,
          reason: 'Tự đánh giá giúp bạn có cơ hội phản ánh thành tích và mục tiêu',
          priority: 'MEDIUM',
          actions: [
            { type: 'navigate', label: 'Bắt đầu', url: '/ess/performance' }
          ],
          metadata: { count: selfReviews },
          createdAt: new Date()
        })
      }
    }

    return suggestions
  }
}

// ═══════════════════════════════════════════════════════════════
// FACTORY FUNCTION
// ═══════════════════════════════════════════════════════════════

export function createWorkflowSuggester(tenantId: string): WorkflowSuggester {
  return new WorkflowSuggester(tenantId)
}
