// src/app/api/analytics/reports/[id]/run/route.ts
// Execute Report API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { analyticsReportService } from '@/services/analytics/report.service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'HR_MANAGER', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    const result = await analyticsReportService.runReport(
      session.user.tenantId,
      id
    )

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof Error && error.message.includes('không tồn tại')) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    if (error instanceof Error && error.message.includes('không được hỗ trợ')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Error running report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
