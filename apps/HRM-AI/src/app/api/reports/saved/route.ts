// src/app/api/reports/saved/route.ts
// Saved Reports API

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { reportService } from '@/services/report.service'
import { z } from 'zod'
import { safeParseInt } from '@/lib/api/parse-params'

const saveReportSchema = z.object({
  name: z.string().min(1, { message: 'Tên báo cáo không được để trống' }),
  description: z.string().optional(),
  reportType: z.string().min(1),
  parameters: z.record(z.string(), z.unknown()),
  isScheduled: z.boolean().optional(),
  cronExpression: z.string().optional(),
})

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const page = safeParseInt(searchParams.get('page'), 1)
    const pageSize = safeParseInt(searchParams.get('pageSize'), 20)

    const result = await reportService.getSavedReports(
      session.user.tenantId,
      page,
      pageSize
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Get saved reports error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
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

    const body = await request.json()
    const data = saveReportSchema.parse(body)

    const report = await reportService.saveReport(
      session.user.tenantId,
      session.user.id,
      data
    )

    return NextResponse.json({ data: report }, { status: 201 })
  } catch (error) {
    console.error('Save report error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
