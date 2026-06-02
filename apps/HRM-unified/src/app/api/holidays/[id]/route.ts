// src/app/api/holidays/[id]/route.ts
// Single holiday API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { holidayService } from '@/services/holiday.service'
import { z } from 'zod'

const updateHolidaySchema = z.object({
  name: z.string().min(1).optional(),
  date: z.coerce.date().optional(),
  endDate: z.coerce.date().optional().nullable(),
  dayType: z.enum(['NORMAL', 'WEEKEND', 'HOLIDAY', 'COMPENSATORY']).optional(),
  compensatoryDate: z.coerce.date().optional().nullable(),
  isRecurring: z.boolean().optional(),
  isNational: z.boolean().optional(),
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
    const holiday = await holidayService.findById(session.user.tenantId, id)

    if (!holiday) {
      return NextResponse.json({ error: 'Không tìm thấy ngày lễ' }, { status: 404 })
    }

    return NextResponse.json(holiday)
  } catch (error) {
    console.error('Error fetching holiday:', error)
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
    const validatedData = updateHolidaySchema.parse(body)

    const holiday = await holidayService.update(session.user.tenantId, id, validatedData)
    return NextResponse.json(holiday)
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
    console.error('Error updating holiday:', error)
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
    await holidayService.delete(session.user.tenantId, id)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Error deleting holiday:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
