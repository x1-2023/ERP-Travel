// src/app/api/reports/route.ts
// Reports API

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { reportService } from '@/services/report.service'
import { z } from 'zod'

const generateReportSchema = z.object({
  query: z.string().optional(),
  reportType: z.string().optional(),
  title: z.string().optional(),
  parameters: z.object({
    startDate: z.string(),
    endDate: z.string(),
    departmentId: z.string().optional(),
    groupBy: z.string().optional(),
  }).optional(),
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only managers and admins can generate reports
    if (!['ADMIN', 'HR_MANAGER', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const data = generateReportSchema.parse(body)

    let reportParams

    if (data.query) {
      // Parse natural language query
      reportParams = await reportService.parseReportQuery(data.query)
    } else if (data.reportType && data.parameters) {
      // Use provided parameters
      reportParams = {
        reportType: data.reportType,
        title: data.title || 'Báo cáo',
        parameters: data.parameters,
      }
    } else {
      return NextResponse.json(
        { error: 'Cần cung cấp query hoặc reportType + parameters' },
        { status: 400 }
      )
    }

    const result = await reportService.generateReport(
      session.user.tenantId,
      reportParams
    )

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('Generate report error:', error)

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
