// src/app/api/payroll/periods/route.ts
// Payroll Periods API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { payrollPeriodService } from '@/services/payroll-period.service'
import { z } from 'zod'
import { safeParseInt, safeParseIntOptional } from '@/lib/api/parse-params'

const createPeriodSchema = z.object({
  year: z.number().min(2020).max(2100),
  month: z.number().min(1).max(12),
  notes: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filters = {
      year: safeParseIntOptional(searchParams.get('year')),
      month: safeParseIntOptional(searchParams.get('month')),
      status: searchParams.get('status') as never || undefined,
      page: safeParseInt(searchParams.get('page'), 1),
      pageSize: safeParseInt(searchParams.get('pageSize'), 12),
    }

    const result = await payrollPeriodService.findAll(
      session.user.tenantId,
      filters
    )
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching payroll periods:', error)
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
    const validatedData = createPeriodSchema.parse(body)

    const period = await payrollPeriodService.create(
      session.user.tenantId,
      validatedData.year,
      validatedData.month,
      validatedData.notes
    )

    return NextResponse.json(period, { status: 201 })
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
    console.error('Error creating payroll period:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
