// src/app/api/payroll/adjustments/[id]/route.ts
// Single Payroll Adjustment API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { payrollAdjustmentService } from '@/services/payroll-adjustment.service'
import { z } from 'zod'

const updateAdjustmentSchema = z.object({
  name: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  isTaxable: z.boolean().optional(),
  reason: z.string().min(1).optional(),
  notes: z.string().optional(),
})

const approvalSchema = z.object({
  action: z.enum(['approve', 'reject']),
  rejectionReason: z.string().optional(),
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
    const adjustment = await payrollAdjustmentService.findById(
      session.user.tenantId,
      id
    )

    if (!adjustment) {
      return NextResponse.json(
        { error: 'Điều chỉnh không tồn tại' },
        { status: 404 }
      )
    }

    return NextResponse.json(adjustment)
  } catch (error) {
    console.error('Error fetching payroll adjustment:', error)
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

    if (!['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'HR_STAFF'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    // Check if this is an approval action
    if (body.action) {
      const { action, rejectionReason } = approvalSchema.parse(body)

      if (!['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(session.user.role)) {
        return NextResponse.json(
          { error: 'Không có quyền duyệt điều chỉnh' },
          { status: 403 }
        )
      }

      if (action === 'approve') {
        const adjustment = await payrollAdjustmentService.approve(
          session.user.tenantId,
          id,
          session.user.id
        )
        return NextResponse.json(adjustment)
      } else {
        if (!rejectionReason) {
          return NextResponse.json(
            { error: 'Vui lòng nhập lý do từ chối' },
            { status: 400 }
          )
        }
        const adjustment = await payrollAdjustmentService.reject(
          session.user.tenantId,
          id,
          session.user.id,
          rejectionReason
        )
        return NextResponse.json(adjustment)
      }
    }

    // Regular update
    const validatedData = updateAdjustmentSchema.parse(body)
    const adjustment = await payrollAdjustmentService.update(
      session.user.tenantId,
      id,
      validatedData
    )

    return NextResponse.json(adjustment)
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
    console.error('Error updating payroll adjustment:', error)
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

    if (!['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'HR_STAFF'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    await payrollAdjustmentService.delete(session.user.tenantId, id)

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Error deleting payroll adjustment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
