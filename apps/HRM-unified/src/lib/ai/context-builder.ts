// src/lib/ai/context-builder.ts
// Build user context for AI conversations

import { db } from '@/lib/db'
import type { UserContext } from '@/types/ai'

/**
 * Build complete user context for AI assistant
 */
export async function buildUserContext(
  userId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tenantId: string
): Promise<UserContext> {
  // Get user with employee info
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      employee: {
        include: {
          department: true,
          position: true,
          subordinates: { select: { id: true } },
        },
      },
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const context: UserContext = {
    user: {
      id: user.id,
      name: user.name || 'Nhân viên',
      role: user.role,
    },
  }

  // Add employee context
  if (user.employee) {
    context.employee = {
      id: user.employee.id,
      code: user.employee.employeeCode,
      department: user.employee.department?.name || 'N/A',
      position: user.employee.position?.name || 'N/A',
    }

    // Check if manager
    const isManager = user.employee.subordinates.length > 0
    if (isManager) {
      context.isManager = true
      context.teamSize = user.employee.subordinates.length

      // Count pending approvals
      const pendingCount = await db.approvalStep.count({
        where: {
          approverId: userId,
          status: 'PENDING',
        },
      })
      context.pendingRequests = pendingCount
    }

    // Get leave balances
    const currentYear = new Date().getFullYear()
    const leaveBalances = await db.leaveBalance.findMany({
      where: {
        employeeId: user.employee.id,
        year: currentYear,
      },
      include: {
        policy: true,
      },
    })

    if (leaveBalances.length > 0) {
      context.leaveBalances = leaveBalances.map((lb) => ({
        type: lb.policy.code,
        typeName: lb.policy.name,
        available: Number(lb.entitlement) - Number(lb.used),
        used: Number(lb.used),
        entitlement: Number(lb.entitlement),
      }))
    }

    // Get current month attendance stats
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const attendances = await db.attendance.findMany({
      where: {
        employeeId: user.employee.id,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    })

    // Calculate work days in month (excluding weekends)
    let workDays = 0
    const checkDate = new Date(startOfMonth)
    while (checkDate <= endOfMonth) {
      const day = checkDate.getDay()
      if (day !== 0 && day !== 6) {
        workDays++
      }
      checkDate.setDate(checkDate.getDate() + 1)
    }

    // Sum up stats
    const actualDays = attendances.filter(
      (r) => r.status === 'PRESENT' || r.status === 'LATE'
    ).length
    const lateDays = attendances.filter(
      (r) => r.status === 'LATE'
    ).length

    // Get OT hours
    const otRecords = await db.overtimeRequest.findMany({
      where: {
        employeeId: user.employee.id,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        status: 'APPROVED',
      },
    })
    const otHours = otRecords.reduce(
      (sum, r) => sum + Number(r.actualHours || r.plannedHours),
      0
    )

    context.currentMonth = {
      workDays,
      actualDays,
      otHours,
      lateDays,
    }
  }

  return context
}

/**
 * Get relevant knowledge articles for a query
 */
export async function getRelevantKnowledge(
  tenantId: string,
  query: string,
  limit: number = 3
): Promise<string> {
  // Simple keyword-based search
  // In production, use vector similarity search
  const keywords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2)

  if (keywords.length === 0) {
    return ''
  }

  const articles = await db.knowledgeArticle.findMany({
    where: {
      tenantId,
      isPublished: true,
      OR: keywords.flatMap((keyword) => [
        { title: { contains: keyword, mode: 'insensitive' } },
        { content: { contains: keyword, mode: 'insensitive' } },
        { keywords: { has: keyword } },
      ]),
    },
    take: limit,
    orderBy: { viewCount: 'desc' },
  })

  if (articles.length === 0) {
    return ''
  }

  return articles
    .map((a) => `### ${a.title}\n${a.content}`)
    .join('\n\n---\n\n')
}
