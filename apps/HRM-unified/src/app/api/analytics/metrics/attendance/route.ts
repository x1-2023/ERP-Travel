// src/app/api/analytics/metrics/attendance/route.ts
// Attendance Metrics API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { attendanceAnalyticsService } from '@/services/analytics/attendance-analytics.service'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'HR_MANAGER', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get('date')
    const date = dateStr ? new Date(dateStr) : new Date()

    const data = await attendanceAnalyticsService.getAttendanceAnalytics(
      session.user.tenantId,
      date
    )

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching attendance metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
