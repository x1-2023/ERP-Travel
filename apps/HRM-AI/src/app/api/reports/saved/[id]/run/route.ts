// src/app/api/reports/saved/[id]/run/route.ts
// Run Saved Report API

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { reportService } from '@/services/report.service'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!['ADMIN', 'HR_MANAGER', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { id } = await params

    const result = await reportService.runSavedReport(
      session.user.tenantId,
      id
    )

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('Run saved report error:', error)

    if (error instanceof Error && error.message === 'Báo cáo không tồn tại') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
