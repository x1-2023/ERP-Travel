import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import * as budgetService from '@/services/learning/budget.service'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const tenantId = session.user.tenantId
    const userId = session.user.id

    const { searchParams } = new URL(request.url)
    const params = {
      tenantId,
      year: parseInt(searchParams.get('year') || new Date().getFullYear().toString()),
      departmentId: searchParams.get('departmentId') || undefined,
    }

    const result = await budgetService.getTrainingBudgets(tenantId, params.year)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching budget:', error)
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
    const result = await budgetService.createOrUpdateBudget(tenantId, body)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating budget:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
