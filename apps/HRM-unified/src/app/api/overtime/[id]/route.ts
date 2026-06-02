// src/app/api/overtime/[id]/route.ts
// Single overtime request API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { overtimeService } from '@/services/overtime.service'
import { z } from 'zod'

const updateOvertimeSchema = z.object({
  date: z.coerce.date().optional(),
  startTime: z.coerce.date().optional(),
  endTime: z.coerce.date().optional(),
  dayType: z.enum(['NORMAL', 'WEEKEND', 'HOLIDAY', 'COMPENSATORY']).optional(),
  reason: z.string().optional(),
  attachmentUrl: z.string().optional(),
  notes: z.string().optional(),
})

const approveSchema = z.object({
  actualHours: z.number().optional(),
})

const rejectSchema = z.object({
  reason: z.string().min(1, 'Lý do từ chối là bắt buộc'),
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
    const overtime = await overtimeService.findById(session.user.tenantId, id)

    if (!overtime) {
      return NextResponse.json({ error: 'Không tìm thấy đơn tăng ca' }, { status: 404 })
    }

    return NextResponse.json(overtime)
  } catch (error) {
    console.error('Error fetching overtime request:', error)
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

    const { id } = await params
    const body = await request.json()
    const validatedData = updateOvertimeSchema.parse(body)

    const overtime = await overtimeService.update(session.user.tenantId, id, validatedData)
    return NextResponse.json(overtime)
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
    console.error('Error updating overtime request:', error)
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

    const { id } = await params
    await overtimeService.delete(session.user.tenantId, id)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Error deleting overtime request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only HR/Admin can approve/reject
    if (!['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    const body = await request.json()

    if (action === 'approve') {
      const { actualHours } = approveSchema.parse(body)
      const overtime = await overtimeService.approve(
        session.user.tenantId,
        id,
        session.user.id,
        actualHours
      )
      return NextResponse.json(overtime)
    }

    if (action === 'reject') {
      const { reason } = rejectSchema.parse(body)
      const overtime = await overtimeService.reject(
        session.user.tenantId,
        id,
        session.user.id,
        reason
      )
      return NextResponse.json(overtime)
    }

    if (action === 'cancel') {
      const overtime = await overtimeService.cancel(session.user.tenantId, id)
      return NextResponse.json(overtime)
    }

    return NextResponse.json(
      { error: 'Invalid action' },
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
    console.error('Error processing overtime action:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
