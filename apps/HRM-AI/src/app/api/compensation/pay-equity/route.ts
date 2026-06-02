import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import * as payEquityService from '@/services/compensation/pay-equity.service'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const departmentId = request.nextUrl.searchParams.get('departmentId') || undefined
    const result = await payEquityService.getPayEquityAnalyses(session.user.tenantId, departmentId)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
