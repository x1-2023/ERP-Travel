import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import * as calibrationService from '@/services/performance/calibration.service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const tenantId = session.user.tenantId
    const userId = session.user.id

    const body = await request.json()
    const result = await calibrationService.submitCalibrationDecision(params.id, body)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Error submitting calibration decision:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
