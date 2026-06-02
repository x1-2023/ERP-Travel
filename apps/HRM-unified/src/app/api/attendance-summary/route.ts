// src/app/api/attendance-summary/route.ts
// Attendance summary (monthly timesheet) API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { summaryService } from '@/services/summary.service'
import { z } from 'zod'
import { safeParseInt, safeParseIntOptional } from '@/lib/api/parse-params'

const generateSchema = z.object({
  employeeId: z.string().optional(),
  departmentId: z.string().optional(),
  year: z.number(),
  month: z.number().min(1).max(12),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filters = {
      employeeId: searchParams.get('employeeId') || undefined,
      departmentId: searchParams.get('departmentId') || undefined,
      year: safeParseIntOptional(searchParams.get('year')),
      month: safeParseIntOptional(searchParams.get('month')),
      isLocked: searchParams.get('isLocked') === 'true' ? true : searchParams.get('isLocked') === 'false' ? false : undefined,
      page: safeParseInt(searchParams.get('page'), 1),
      pageSize: safeParseInt(searchParams.get('pageSize'), 20),
    }

    // If not HR/Admin, only show own summary
    if (!['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'HR_STAFF'].includes(session.user.role)) {
      if (session.user.employeeId) {
        filters.employeeId = session.user.employeeId
      }
    }

    const result = await summaryService.findAll(session.user.tenantId, filters)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching attendance summaries:', error)
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

    if (!['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'HR_STAFF'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    const validatedData = generateSchema.parse(body)

    if (action === 'generate-all') {
      // Generate summaries for all employees in department/tenant
      const result = await summaryService.generateSummariesForMonth(
        session.user.tenantId,
        validatedData.year,
        validatedData.month,
        validatedData.departmentId
      )
      return NextResponse.json(result)
    }

    if (validatedData.employeeId) {
      // Generate summary for single employee
      const summary = await summaryService.generateSummary(
        session.user.tenantId,
        validatedData.employeeId,
        validatedData.year,
        validatedData.month
      )
      return NextResponse.json(summary)
    }

    return NextResponse.json(
      { error: 'employeeId is required for single generation' },
      { status: 400 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Error generating attendance summary:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
