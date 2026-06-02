// src/app/api/payroll/config/route.ts
// Payroll Config API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { payrollConfigService } from '@/services/payroll-config.service'
import { z } from 'zod'

const createConfigSchema = z.object({
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().nullable().optional(),
  bhxhEmployeeRate: z.number().min(0).max(1).optional(),
  bhxhEmployerRate: z.number().min(0).max(1).optional(),
  bhytEmployeeRate: z.number().min(0).max(1).optional(),
  bhytEmployerRate: z.number().min(0).max(1).optional(),
  bhtnEmployeeRate: z.number().min(0).max(1).optional(),
  bhtnEmployerRate: z.number().min(0).max(1).optional(),
  insuranceSalaryCap: z.number().min(0).optional(),
  personalDeduction: z.number().min(0).optional(),
  dependentDeduction: z.number().min(0).optional(),
  pitBrackets: z.array(z.object({
    from: z.number(),
    to: z.number(),
    rate: z.number(),
  })).optional(),
  otWeekdayRate: z.number().min(1).max(5).optional(),
  otWeekendRate: z.number().min(1).max(5).optional(),
  otHolidayRate: z.number().min(1).max(5).optional(),
  otNightBonus: z.number().min(0).max(1).optional(),
  standardWorkDays: z.number().min(1).max(31).optional(),
  standardWorkHours: z.number().min(1).max(24).optional(),
  notes: z.string().optional(),
})

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const config = await payrollConfigService.getCurrentConfig(session.user.tenantId)
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching payroll config:', error)
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

    if (!['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createConfigSchema.parse(body)

    const config = await payrollConfigService.create(
      session.user.tenantId,
      {
        ...validatedData,
        isActive: true,
      }
    )

    return NextResponse.json(config, { status: 201 })
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
    console.error('Error creating payroll config:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
