import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import * as totalRewardsService from '@/services/compensation/total-rewards.service'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const result = await totalRewardsService.generateTotalRewardsStatement(session.user.tenantId, body.employeeId, body.year)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
