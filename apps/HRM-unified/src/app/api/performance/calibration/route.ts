import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import * as calibrationService from '@/services/performance/calibration.service'
import { safeParseInt } from '@/lib/api/parse-params'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const tenantId = session.user.tenantId

    const { searchParams } = request.nextUrl
    const params = {
      cycleId: searchParams.get('cycleId') || undefined,
      status: searchParams.get('status') || undefined,
      page: safeParseInt(searchParams.get('page'), 1),
      pageSize: safeParseInt(searchParams.get('pageSize'), 20),
    }

    const result = await calibrationService.getCalibrationSessions(tenantId, params as any)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error listing calibration sessions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const tenantId = session.user.tenantId
    const userId = session.user.id

    const body = await request.json()
    const result = await calibrationService.createCalibrationSession(tenantId, body)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Error creating calibration session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
