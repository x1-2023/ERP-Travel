// src/app/api/attendance/clock/route.ts
// Clock in/out API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { attendanceService } from '@/services/attendance.service'
import { z } from 'zod'

const clockSchema = z.object({
  source: z.enum(['MANUAL', 'WEB_CLOCK', 'MOBILE_APP', 'FINGERPRINT', 'FACE_ID', 'CARD', 'IMPORT']),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
  note: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Must have employeeId to clock in
    if (!session.user.employeeId) {
      return NextResponse.json(
        { error: 'Tài khoản chưa được liên kết với nhân viên' },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') // 'in' or 'out'

    const body = await request.json()
    const validatedData = clockSchema.parse(body)

    if (action === 'in') {
      const result = await attendanceService.clockIn(
        session.user.tenantId,
        session.user.employeeId,
        validatedData
      )
      return NextResponse.json(result)
    }

    if (action === 'out') {
      const result = await attendanceService.clockOut(
        session.user.tenantId,
        session.user.employeeId,
        validatedData
      )
      return NextResponse.json(result)
    }

    return NextResponse.json(
      { error: 'Invalid action. Use ?action=in or ?action=out' },
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
    console.error('Error clocking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!session.user.employeeId) {
      return NextResponse.json(
        { error: 'Tài khoản chưa được liên kết với nhân viên' },
        { status: 400 }
      )
    }

    const result = await attendanceService.getTodayStatus(
      session.user.tenantId,
      session.user.employeeId
    )
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error getting today status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
