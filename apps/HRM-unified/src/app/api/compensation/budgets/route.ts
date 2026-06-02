import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import * as budgetService from '@/services/compensation/budget.service'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const cycleId = request.nextUrl.searchParams.get('cycleId')
    if (!cycleId) return NextResponse.json({ error: 'cycleId required' }, { status: 400 })
    const result = await budgetService.getCompensationBudgets(session.user.tenantId, cycleId)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const result = await budgetService.createOrUpdateBudget(session.user.tenantId, body)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
