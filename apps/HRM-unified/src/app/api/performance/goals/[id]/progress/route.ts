import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import * as goalService from '@/services/performance/goal.service'

export async function PATCH(
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
    const { currentValue, notes } = body

    const result = await goalService.updateGoalProgress(params.id, tenantId, userId, {
      currentValue,
      notes,
    })
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Error updating goal progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
