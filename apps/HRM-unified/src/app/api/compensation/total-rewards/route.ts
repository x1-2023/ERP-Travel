import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import * as totalRewardsService from '@/services/compensation/total-rewards.service'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = request.nextUrl
    const employeeId = searchParams.get('employeeId')
    const year = searchParams.get('year')
    if (employeeId) {
      const result = await totalRewardsService.getTotalRewardsStatement(session.user.tenantId, employeeId, year ? parseInt(year) : undefined)
      return NextResponse.json(result)
    }
    const result = await totalRewardsService.getTotalRewardsStatements(session.user.tenantId, year ? parseInt(year) : undefined)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
