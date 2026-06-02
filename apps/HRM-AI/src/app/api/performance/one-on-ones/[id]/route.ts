import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import * as oneOnOneService from '@/services/performance/one-on-one.service'

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

    const result = await oneOnOneService.getOneOnOneById(params.id, tenantId)
    if (!result) {
      return NextResponse.json({ error: 'One-on-one not found' }, { status: 404 })
    }
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching one-on-one:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
    const result = await oneOnOneService.updateOneOnOne(params.id, tenantId, body)
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Error updating one-on-one:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
