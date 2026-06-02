// src/app/api/ess/dashboard/route.ts
// ESS Dashboard API - Get employee self-service data

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { leaveBalanceService } from '@/services/leave-balance.service'
import { notificationService } from '@/services/notification.service'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentYear = new Date().getFullYear()

    // Get user with employee info
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        employee: {
          include: {
            department: true,
            position: true,
            directManager: {
              select: {
                id: true,
                fullName: true,
                workEmail: true,
              },
            },
          },
        },
      },
    })

    if (!user?.employee) {
      return NextResponse.json({ error: 'No employee profile' }, { status: 400 })
    }

    // Get leave balances
    await leaveBalanceService.initializeForEmployee(
      session.user.tenantId,
      user.employeeId!,
      currentYear
    )

    const leaveBalances = await leaveBalanceService.getByEmployee(
      session.user.tenantId,
      user.employeeId!,
      currentYear
    )

    // Get recent leave requests
    const recentRequests = await db.leaveRequest.findMany({
      where: {
        tenantId: session.user.tenantId,
        employeeId: user.employeeId!,
      },
      include: {
        policy: {
          select: {
            name: true,
            leaveType: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    // Get pending approvals count (if user is an approver)
    const pendingApprovalsCount = await db.approvalStep.count({
      where: {
        instance: {
          tenantId: session.user.tenantId,
        },
        approverId: session.user.id,
        status: 'PENDING',
      },
    })

    // Get unread notifications count
    const unreadNotificationsCount = await notificationService.getUnreadCount(
      session.user.id
    )

    // Get recent notifications
    const recentNotifications = await notificationService.getByUser(
      session.user.id,
      { pageSize: 5 }
    )

    return NextResponse.json({
      employee: {
        id: user.employee.id,
        employeeCode: user.employee.employeeCode,
        fullName: user.employee.fullName,
        workEmail: user.employee.workEmail,
        department: user.employee.department,
        position: user.employee.position,
        directManager: user.employee.directManager,
        hireDate: user.employee.hireDate,
        avatar: user.employee.avatar,
      },
      leaveBalances,
      recentRequests,
      pendingApprovalsCount,
      unreadNotificationsCount,
      recentNotifications,
    })
  } catch (error) {
    console.error('Error fetching ESS dashboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
