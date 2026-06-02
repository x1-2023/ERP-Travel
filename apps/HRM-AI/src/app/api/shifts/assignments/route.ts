// src/app/api/shifts/assignments/route.ts
// Shift assignment API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { shiftService } from '@/services/shift.service'
import { z } from 'zod'
import { safeParseInt } from '@/lib/api/parse-params'

const assignShiftSchema = z.object({
  employeeId: z.string().min(1, 'Nhân viên là bắt buộc'),
  shiftId: z.string().min(1, 'Ca làm việc là bắt buộc'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
  isPrimary: z.boolean().optional(),
  notes: z.string().optional(),
})

const bulkAssignSchema = z.object({
  employeeIds: z.array(z.string()).min(1),
  shiftId: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
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
      shiftId: searchParams.get('shiftId') || undefined,
      departmentId: searchParams.get('departmentId') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      isPrimary: searchParams.get('isPrimary') === 'true' ? true : undefined,
      page: safeParseInt(searchParams.get('page'), 1),
      pageSize: safeParseInt(searchParams.get('pageSize'), 20),
    }

    const result = await shiftService.findAssignments(session.user.tenantId, filters)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching shift assignments:', error)
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

    // Check if bulk assign
    if (body.employeeIds) {
      const validatedData = bulkAssignSchema.parse(body)
      const result = await shiftService.bulkAssignShift(
        session.user.tenantId,
        validatedData.employeeIds,
        validatedData.shiftId,
        validatedData.startDate,
        validatedData.endDate
      )
      return NextResponse.json(result, { status: 201 })
    }

    // Single assign
    const validatedData = assignShiftSchema.parse(body)
    const assignment = await shiftService.assignShift(session.user.tenantId, validatedData)
    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error('Error assigning shift:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
