// src/app/api/payroll/periods/[id]/route.ts
// Single Payroll Period API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { payrollPeriodService } from '@/services/payroll-period.service'
import { z } from 'zod'

const updatePeriodSchema = z.object({
  status: z.enum([
    'DRAFT',
    'CALCULATING',
    'SIMULATED',
    'PENDING_APPROVAL',
    'APPROVED',
    'PAID',
    'CANCELLED',
  ]).optional(),
  notes: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const period = await payrollPeriodService.findById(session.user.tenantId, id)

    if (!period) {
      return NextResponse.json(
        { error: 'Kỳ lương không tồn tại' },
        { status: 404 }
      )
    }

    return NextResponse.json(period)
  } catch (error) {
    console.error('Error fetching payroll period:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updatePeriodSchema.parse(body)

    // Handle status update separately
    if (validatedData.status) {
      const period = await payrollPeriodService.updateStatus(
        session.user.tenantId,
        id,
        validatedData.status,
        session.user.id
      )
      return NextResponse.json(period)
    }

    const period = await payrollPeriodService.update(
      session.user.tenantId,
      id,
      validatedData
    )

    return NextResponse.json(period)
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
    console.error('Error updating payroll period:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    await payrollPeriodService.delete(session.user.tenantId, id)

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Error deleting payroll period:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
