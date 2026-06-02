import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import * as requestService from '@/services/learning/request.service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const tenantId = session.user.tenantId
    const userId = session.user.id

    const { id } = await params
    const body = await request.json()
    const result = await requestService.approveTrainingRequest(id, tenantId, userId, body.role || 'manager', body.comments)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error approving request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
