// src/app/api/analytics/metrics/calculate/route.ts
// Metric Calculation Trigger API - Admin only

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headcountService } from '@/services/analytics/headcount.service'
import { turnoverService } from '@/services/analytics/turnover.service'
import { attendanceAnalyticsService } from '@/services/analytics/attendance-analytics.service'
import { laborCostService } from '@/services/analytics/labor-cost.service'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { type, date: dateStr } = body
    const date = dateStr ? new Date(dateStr) : new Date()

    const results: Record<string, unknown> = {}

    if (!type || type === 'all' || type === 'HEADCOUNT') {
      results.headcount = await headcountService.calculateAndStoreHeadcount(
        session.user.tenantId,
        date
      )
    }

    if (!type || type === 'all' || type === 'TURNOVER') {
      results.turnover = await turnoverService.calculateAndStoreTurnover(
        session.user.tenantId,
        date
      )
    }

    if (!type || type === 'all' || type === 'ATTENDANCE') {
      results.attendance = await attendanceAnalyticsService.calculateAndStoreAttendance(
        session.user.tenantId,
        date
      )
    }

    if (!type || type === 'all' || type === 'LABOR_COST') {
      results.laborCost = await laborCostService.calculateAndStoreLaborCost(
        session.user.tenantId,
        date
      )
    }

    return NextResponse.json({
      message: 'Tính toán metrics thành công',
      results,
    })
  } catch (error) {
    console.error('Error calculating metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
