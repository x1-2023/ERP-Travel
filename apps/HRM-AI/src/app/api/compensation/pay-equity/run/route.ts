import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import * as payEquityService from '@/services/compensation/pay-equity.service'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const result = await payEquityService.runPayEquityAnalysis(session.user.tenantId, body.departmentId)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
