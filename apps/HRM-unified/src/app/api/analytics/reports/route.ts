// src/app/api/analytics/reports/route.ts
// Analytics Reports List & Create API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { analyticsReportService } from '@/services/analytics/report.service'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'HR_MANAGER', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const reports = await analyticsReportService.list(
      session.user.tenantId
    )

    return NextResponse.json({ data: reports })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'HR_MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, dataSource, columns, filters, sorting, grouping, aggregations, isScheduled, schedule } = body

    if (!name || !dataSource || !columns) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc: name, dataSource, columns' },
        { status: 400 }
      )
    }

    const report = await analyticsReportService.create(
      session.user.tenantId,
      session.user.id,
      { name, description, dataSource, columns, filters, sorting, grouping, aggregations, isScheduled, schedule }
    )

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    console.error('Error creating report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
