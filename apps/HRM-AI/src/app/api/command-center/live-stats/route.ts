// src/app/api/command-center/live-stats/route.ts
// Real-time Command Center Statistics

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

interface LiveStats {
  kpis: {
    totalEmployees: number
    activeToday: number
    newHiresThisMonth: number
    terminationsThisMonth: number
    attendanceRate: number
    pendingApprovals: number
    overtimeHours: number
    aiHealthScore: number
  }
  alerts: Array<{
    id: string
    type: 'critical' | 'warning' | 'info' | 'success'
    title: string
    message: string
    source: string
    timestamp: string
    actionUrl?: string
  }>
  systemStatus: Array<{
    name: string
    status: 'operational' | 'degraded' | 'outage'
    uptime: number
    responseTime: number
  }>
  recentActivity: Array<{
    id: string
    type: string
    description: string
    user: string
    timestamp: string
  }>
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Fetch real data from database
    const [
      totalEmployees,
      activeEmployees,
      newHires,
      terminations,
      pendingApprovals,
      recentNotifications,
      todayAttendance,
    ] = await Promise.all([
      // Total employees
      db.employee.count({
        where: { tenantId, status: { in: ['ACTIVE', 'PROBATION'] } },
      }),

      // Active employees (with attendance today)
      db.attendance.count({
        where: {
          tenantId,
          date: { gte: startOfDay },
          checkIn: { not: null },
        },
      }),

      // New hires this month
      db.employee.count({
        where: {
          tenantId,
          hireDate: { gte: startOfMonth },
        },
      }),

      // Terminations this month
      db.employee.count({
        where: {
          tenantId,
          resignationDate: { gte: startOfMonth },
        },
      }),

      // Pending approvals
      db.approvalStep.count({
        where: {
          instance: { tenantId },
          status: 'PENDING',
        },
      }),

      // Recent notifications for alerts
      db.notification.findMany({
        where: {
          tenantId,
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),

      // Today's attendance count
      db.attendance.count({
        where: {
          tenantId,
          date: { gte: startOfDay },
        },
      }),
    ])

    // Calculate attendance rate
    const attendanceRate = totalEmployees > 0
      ? Math.round((todayAttendance / totalEmployees) * 100 * 10) / 10
      : 0

    // Generate alerts from notifications and system checks
    const alerts = generateAlerts(recentNotifications, pendingApprovals, attendanceRate)

    // System status (mock for now, would connect to real monitoring)
    const systemStatus = [
      { name: 'API Server', status: 'operational' as const, uptime: 99.9, responseTime: 45 },
      { name: 'Database', status: 'operational' as const, uptime: 99.95, responseTime: 12 },
      { name: 'AI Engine', status: 'operational' as const, uptime: 99.5, responseTime: 150 },
      { name: 'Email Service', status: 'operational' as const, uptime: 98.5, responseTime: 200 },
    ]

    // AI Health Score (composite metric)
    const aiHealthScore = calculateAIHealthScore({
      attendanceRate,
      pendingApprovals,
      totalEmployees,
      newHires,
      terminations,
    })

    const stats: LiveStats = {
      kpis: {
        totalEmployees,
        activeToday: activeEmployees,
        newHiresThisMonth: newHires,
        terminationsThisMonth: terminations,
        attendanceRate,
        pendingApprovals,
        overtimeHours: 0, // Would calculate from attendance data
        aiHealthScore,
      },
      alerts,
      systemStatus,
      recentActivity: generateRecentActivity(),
    }

    return NextResponse.json({
      data: stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching live stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch live stats' },
      { status: 500 }
    )
  }
}

function generateAlerts(
  notifications: Array<{ id: string; type: string; title: string; message: string; createdAt: Date }>,
  pendingApprovals: number,
  attendanceRate: number
) {
  const alerts: LiveStats['alerts'] = []

  // Low attendance alert
  if (attendanceRate < 80) {
    alerts.push({
      id: 'attendance-low',
      type: 'warning',
      title: 'Tỷ lệ chuyên cần thấp',
      message: `Tỷ lệ chuyên cần hôm nay chỉ đạt ${attendanceRate}%`,
      source: 'Attendance',
      timestamp: new Date().toISOString(),
      actionUrl: '/attendance',
    })
  }

  // Pending approvals alert
  if (pendingApprovals > 5) {
    alerts.push({
      id: 'approvals-pending',
      type: pendingApprovals > 10 ? 'critical' : 'warning',
      title: `${pendingApprovals} yêu cầu chờ phê duyệt`,
      message: 'Có yêu cầu đang chờ xử lý quá lâu',
      source: 'Workflow',
      timestamp: new Date().toISOString(),
      actionUrl: '/approvals',
    })
  }

  // Convert recent critical notifications to alerts
  notifications
    .filter(n => n.type === 'PENDING_APPROVAL' || n.type === 'BALANCE_LOW')
    .slice(0, 3)
    .forEach(n => {
      alerts.push({
        id: n.id,
        type: n.type === 'BALANCE_LOW' ? 'warning' : 'info',
        title: n.title,
        message: n.message,
        source: 'Notifications',
        timestamp: n.createdAt.toISOString(),
      })
    })

  return alerts
}

function calculateAIHealthScore(metrics: {
  attendanceRate: number
  pendingApprovals: number
  totalEmployees: number
  newHires: number
  terminations: number
}): number {
  let score = 100

  // Deduct for low attendance
  if (metrics.attendanceRate < 95) {
    score -= (95 - metrics.attendanceRate) * 0.5
  }

  // Deduct for pending approvals
  if (metrics.pendingApprovals > 5) {
    score -= Math.min(10, metrics.pendingApprovals - 5)
  }

  // Deduct for high turnover
  const turnoverRisk = metrics.totalEmployees > 0
    ? (metrics.terminations / metrics.totalEmployees) * 100
    : 0
  if (turnoverRisk > 5) {
    score -= (turnoverRisk - 5) * 2
  }

  // Bonus for new hires
  if (metrics.newHires > 0) {
    score += Math.min(5, metrics.newHires)
  }

  return Math.max(0, Math.min(100, Math.round(score)))
}

function generateRecentActivity() {
  // In production, this would fetch from audit logs
  return [
    {
      id: '1',
      type: 'login',
      description: 'Đăng nhập hệ thống',
      user: 'Nguyễn Văn A',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
      id: '2',
      type: 'approval',
      description: 'Phê duyệt đơn nghỉ phép',
      user: 'Trần Thị B',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
      id: '3',
      type: 'create',
      description: 'Tạo hồ sơ nhân viên mới',
      user: 'HR Admin',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
  ]
}
