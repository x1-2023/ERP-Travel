// src/app/api/payroll/periods/[id]/calculate/route.ts
// Payroll Calculation API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { payrollCalculationService } from '@/services/payroll-calculation.service'
import { z } from 'zod'

const calculateSchema = z.object({
  employeeIds: z.array(z.string()).optional(),
  recalculate: z.boolean().optional(),
})

// POST - Run calculation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'HR_STAFF'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const validatedData = calculateSchema.parse(body)

    const result = await payrollCalculationService.calculatePeriod(
      session.user.tenantId,
      id,
      {
        employeeIds: validatedData.employeeIds,
        recalculate: validatedData.recalculate,
      }
    )

    return NextResponse.json(result)
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
    console.error('Error calculating payroll:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
