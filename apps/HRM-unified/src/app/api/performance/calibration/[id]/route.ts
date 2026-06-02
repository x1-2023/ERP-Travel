import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import * as calibrationService from '@/services/performance/calibration.service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const tenantId = session.user.tenantId

    const result = await calibrationService.getCalibrationSessionById(params.id, tenantId)
    if (!result) {
      return NextResponse.json({ error: 'Calibration session not found' }, { status: 404 })
    }
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching calibration session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
