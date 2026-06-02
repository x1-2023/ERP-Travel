import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import * as cycleService from '@/services/performance/cycle.service'

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

    const result = await cycleService.getCycleById(tenantId, params.id)
    if (!result) {
      return NextResponse.json({ error: 'Cycle not found' }, { status: 404 })
    }
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching cycle:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
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
    const result = await cycleService.updateCycle(tenantId, params.id, userId, body)
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Error updating cycle:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
