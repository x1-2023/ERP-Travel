import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import * as requestService from '@/services/learning/request.service'

export async function GET(
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
    const result = await requestService.getRequestById(id, tenantId)
    if (!result) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
