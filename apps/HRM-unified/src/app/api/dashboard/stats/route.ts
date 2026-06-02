// src/app/api/dashboard/stats/route.ts
// Dashboard KPI Stats API - Real-time workforce metrics

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
    const lastMonth = new Date(currentYear, currentMonth - 1, 1)
    const lastMonthEnd = new Date(currentYear, currentMonth, 0)

    // 1. Total Employees (Active + Probation)
    const totalEmployees = await db.employee.count({
      where: {
        tenantId,
        status: { in: ['ACTIVE', 'PROBATION'] },
        deletedAt: null
      }
    })

    // Last month for comparison
    const lastMonthEmployees = await db.employee.count({
      where: {
        tenantId,
        status: { in: ['ACTIVE', 'PROBATION'] },
        hireDate: { lte: lastMonthEnd },
        deletedAt: null,
        OR: [
          { resignationDate: null },
          { resignationDate: { gt: lastMonthEnd } }
        ]
      }
    })

    // 2. New Hires This Month
    const newHiresThisMonth = await db.employee.count({
      where: {
        tenantId,
        hireDate: { gte: firstDayOfMonth },
        deletedAt: null
      }
    })

    const newHiresLastMonth = await db.employee.count({
      where: {
        tenantId,
        hireDate: { gte: lastMonth, lt: firstDayOfMonth },
        deletedAt: null
      }
    })

    // 3. Resignations This Month
    const resignationsThisMonth = await db.employee.count({
      where: {
        tenantId,
        status: 'RESIGNED',
        resignationDate: { gte: firstDayOfMonth },
        deletedAt: null
      }
    })

    const resignationsLastMonth = await db.employee.count({
      where: {
        tenantId,
        status: 'RESIGNED',
        resignationDate: { gte: lastMonth, lt: firstDayOfMonth },
        deletedAt: null
      }
    })

    // 4. Average Tenure (in months)
    const employeesWithHireDate = await db.employee.findMany({
      where: {
        tenantId,
        status: { in: ['ACTIVE', 'PROBATION'] },
        deletedAt: null
      },
      select: { hireDate: true }
    })

    let avgTenure = 0
    if (employeesWithHireDate.length > 0) {
      const totalMonths = employeesWithHireDate.reduce((sum, emp) => {
        const months = (today.getTime() - new Date(emp.hireDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
        return sum + months
      }, 0)
      avgTenure = Math.round((totalMonths / employeesWithHireDate.length) * 10) / 10
    }

    // 5. Gender Distribution
    const genderStats = await db.employee.groupBy({
      by: ['gender'],
      where: {
        tenantId,
        status: { in: ['ACTIVE', 'PROBATION'] },
        deletedAt: null
      },
      _count: true
    })

    const genderDistribution = {
      male: genderStats.find(g => g.gender === 'MALE')?._count || 0,
      female: genderStats.find(g => g.gender === 'FEMALE')?._count || 0,
      other: genderStats.find(g => g.gender === 'OTHER')?._count || 0
    }

    // 6. Status Distribution
    const statusStats = await db.employee.groupBy({
      by: ['status'],
      where: {
        tenantId,
        deletedAt: null
      },
      _count: true
    })

    const statusDistribution = {
      active: statusStats.find(s => s.status === 'ACTIVE')?._count || 0,
      probation: statusStats.find(s => s.status === 'PROBATION')?._count || 0,
      resigned: statusStats.find(s => s.status === 'RESIGNED')?._count || 0,
      onLeave: statusStats.find(s => s.status === 'ON_LEAVE')?._count || 0,
      terminated: statusStats.find(s => s.status === 'TERMINATED')?._count || 0
    }

    // 7. Contracts expiring in 30 days
    const thirtyDaysLater = new Date(today)
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30)

    const expiringContracts = await db.contract.count({
      where: {
        tenantId,
        status: 'ACTIVE',
        endDate: {
          gte: today,
          lte: thirtyDaysLater
        }
      }
    })

    // 8. Pending Leave Requests
    const pendingLeaveRequests = await db.leaveRequest.count({
      where: {
        tenantId,
        status: 'PENDING'
      }
    })

    // 9. Pending Approvals (for current user if manager/HR)
    let pendingApprovals = 0
    if (['ADMIN', 'HR_MANAGER', 'HR_STAFF', 'MANAGER'].includes(session.user.role)) {
      pendingApprovals = await db.approvalStep.count({
        where: {
          instance: { tenantId },
          approverId: session.user.id,
          status: 'PENDING'
        }
      })
    }

    // 10. Turnover Rate (last 12 months)
    const oneYearAgo = new Date(today)
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    const resignationsLast12Months = await db.employee.count({
      where: {
        tenantId,
        status: 'RESIGNED',
        resignationDate: { gte: oneYearAgo },
        deletedAt: null
      }
    })

    const avgHeadcount = (totalEmployees + lastMonthEmployees) / 2 || 1
    const turnoverRate = Math.round((resignationsLast12Months / avgHeadcount) * 100 * 10) / 10

    // 11. Attendance today
    const todayEnd = new Date(today)
    todayEnd.setHours(23, 59, 59, 999)

    const attendanceToday = await db.attendance.count({
      where: {
        tenantId,
        date: { gte: today, lte: todayEnd },
        status: { in: ['PRESENT', 'LATE', 'EARLY_LEAVE', 'LATE_AND_EARLY', 'WORK_FROM_HOME'] }
      }
    })

    const onLeaveToday = await db.attendance.count({
      where: {
        tenantId,
        date: { gte: today, lte: todayEnd },
        status: 'ON_LEAVE'
      }
    })

    const attendanceRate = totalEmployees > 0
      ? Math.round((attendanceToday / totalEmployees) * 100 * 10) / 10
      : 0

    // 12. Department distribution
    const departmentStats = await db.employee.groupBy({
      by: ['departmentId'],
      where: {
        tenantId,
        status: { in: ['ACTIVE', 'PROBATION'] },
        deletedAt: null,
        departmentId: { not: null }
      },
      _count: true,
      orderBy: { _count: { departmentId: 'desc' } }
    })

    const departmentIds = departmentStats.map(d => d.departmentId).filter(Boolean) as string[]
    const departments = departmentIds.length > 0
      ? await db.department.findMany({
          where: { id: { in: departmentIds } },
          select: { id: true, name: true }
        })
      : []

    const departmentMap = new Map(departments.map(d => [d.id, d.name]))
    const departmentDistribution = departmentStats.map(d => ({
      name: departmentMap.get(d.departmentId!) || 'Chưa phân bổ',
      headcount: d._count
    }))

    // 13. Weekly attendance trend
    const weekStart = new Date(today)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1) // Monday
    weekStart.setHours(0, 0, 0, 0)

    const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
    const attendanceTrend = []

    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(weekStart)
      dayStart.setDate(dayStart.getDate() + i)
      const dayEnd = new Date(dayStart)
      dayEnd.setHours(23, 59, 59, 999)

      if (dayStart > today) {
        attendanceTrend.push({ name: dayNames[i], value: 0 })
        continue
      }

      const dayAttendance = await db.attendance.count({
        where: {
          tenantId,
          date: { gte: dayStart, lte: dayEnd },
          status: { in: ['PRESENT', 'LATE', 'EARLY_LEAVE', 'LATE_AND_EARLY', 'WORK_FROM_HOME'] }
        }
      })

      const rate = totalEmployees > 0 ? Math.round((dayAttendance / totalEmployees) * 100) : 0
      attendanceTrend.push({ name: dayNames[i], value: rate })
    }

    // 14. Payroll summary (latest period)
    const latestPayrolls = await db.payroll.findMany({
      where: { tenantId, status: { in: ['APPROVED', 'PAID'] } },
      orderBy: { createdAt: 'desc' },
      take: totalEmployees || 100,
      select: { grossSalary: true, periodId: true }
    })

    let totalPayroll = 0
    if (latestPayrolls.length > 0) {
      const latestPeriodId = latestPayrolls[0].periodId
      const periodPayrolls = latestPayrolls.filter(p => p.periodId === latestPeriodId)
      totalPayroll = periodPayrolls.reduce((sum, p) => sum + Number(p.grossSalary), 0)
    }

    // 15. Recent activities from AuditLog
    const recentAuditLogs = await db.auditLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        user: { select: { name: true } }
      }
    })

    const actionLabels: Record<string, string> = {
      CREATE: 'Tạo mới',
      UPDATE: 'Cập nhật',
      DELETE: 'Xóa',
      APPROVE: 'Phê duyệt',
      REJECT: 'Từ chối',
      LOGIN: 'Đăng nhập',
      LOGOUT: 'Đăng xuất',
      IMPORT: 'Nhập dữ liệu',
      EXPORT: 'Xuất dữ liệu',
    }

    const entityLabels: Record<string, string> = {
      employee: 'nhân viên',
      leave_request: 'đơn nghỉ phép',
      payroll: 'bảng lương',
      contract: 'hợp đồng',
      attendance: 'chấm công',
      overtime: 'tăng ca',
    }

    const recentActivities = recentAuditLogs.map(log => {
      const actionLabel = actionLabels[log.action] || log.action
      const entityLabel = entityLabels[log.entityType] || log.entityType
      const entityName = log.entityName ? ` "${log.entityName}"` : ''

      const now = new Date()
      const diffMs = now.getTime() - log.createdAt.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      let timeAgo: string
      if (diffMins < 1) timeAgo = 'Vừa xong'
      else if (diffMins < 60) timeAgo = `${diffMins} phút trước`
      else if (diffMins < 1440) timeAgo = `${Math.floor(diffMins / 60)} giờ trước`
      else timeAgo = `${Math.floor(diffMins / 1440)} ngày trước`

      const statusMap: Record<string, 'pending' | 'success' | 'info'> = {
        CREATE: 'success',
        UPDATE: 'info',
        DELETE: 'info',
        APPROVE: 'success',
        REJECT: 'pending',
        LOGIN: 'info',
        IMPORT: 'success',
      }

      return {
        id: log.id,
        user: log.user?.name || log.userEmail || 'Hệ thống',
        action: `${actionLabel} ${entityLabel}${entityName}`,
        time: timeAgo,
        status: statusMap[log.action] || 'info' as const,
      }
    })

    // 16. Overtime hours this month
    const overtimeAgg = await db.attendance.aggregate({
      where: {
        tenantId,
        date: { gte: firstDayOfMonth },
        otHours: { not: null }
      },
      _sum: { otHours: true }
    })
    const overtimeHours = Number(overtimeAgg._sum.otHours || 0)

    // Calculate changes
    const employeeChange = totalEmployees - lastMonthEmployees
    const newHiresChange = newHiresThisMonth - newHiresLastMonth
    const resignationsChange = resignationsThisMonth - resignationsLastMonth
    const changePercent = lastMonthEmployees > 0
      ? Math.round((employeeChange / lastMonthEmployees) * 100 * 10) / 10
      : 0

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalEmployees: {
            value: totalEmployees,
            change: employeeChange,
            changePercent
          },
          newHires: {
            value: newHiresThisMonth,
            change: newHiresChange,
            label: 'Tháng này'
          },
          resignations: {
            value: resignationsThisMonth,
            change: resignationsChange,
            label: 'Tháng này'
          },
          avgTenure: {
            value: avgTenure,
            label: 'tháng'
          },
          turnoverRate: {
            value: turnoverRate,
            label: '12 tháng'
          }
        },
        attendance: {
          activeToday: attendanceToday,
          onLeaveToday,
          attendanceRate,
        },
        distribution: {
          gender: genderDistribution,
          status: statusDistribution,
          department: departmentDistribution,
        },
        alerts: {
          expiringContracts,
          pendingLeaveRequests,
          pendingApprovals
        },
        payroll: {
          totalPayroll,
        },
        attendanceTrend,
        recentActivities,
        overtimeHours,
        updatedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
