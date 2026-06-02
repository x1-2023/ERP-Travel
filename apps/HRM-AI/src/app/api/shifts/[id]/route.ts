// src/app/api/shifts/[id]/route.ts
// Single shift management API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { shiftService } from '@/services/shift.service'
import { z } from 'zod'

const updateShiftSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  shiftType: z.enum(['STANDARD', 'MORNING', 'AFTERNOON', 'NIGHT', 'FLEXIBLE', 'ROTATING']).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  breakStartTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  breakEndTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  breakMinutes: z.number().min(0).optional(),
  workHoursPerDay: z.number().min(0).max(24).optional(),
  lateGrace: z.number().min(0).optional(),
  earlyGrace: z.number().min(0).optional(),
  otStartAfter: z.number().min(0).optional(),
  nightShiftStart: z.string().optional().nullable(),
  nightShiftEnd: z.string().optional().nullable(),
  isOvernight: z.boolean().optional(),
  color: z.string().optional(),
  isActive: z.boolean().optional(),
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
    const shift = await shiftService.findById(session.user.tenantId, id)

    if (!shift) {
      return NextResponse.json({ error: 'Không tìm thấy ca làm việc' }, { status: 404 })
    }

    return NextResponse.json(shift)
  } catch (error) {
    console.error('Error fetching shift:', error)
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
    const validatedData = updateShiftSchema.parse(body)

    const shift = await shiftService.update(session.user.tenantId, id, validatedData)
    return NextResponse.json(shift)
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
    console.error('Error updating shift:', error)
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

    if (!['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    await shiftService.delete(session.user.tenantId, id)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Error deleting shift:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
