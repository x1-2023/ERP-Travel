import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import * as oneOnOneService from '@/services/performance/one-on-one.service'
import { safeParseInt } from '@/lib/api/parse-params'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const tenantId = session.user.tenantId
    const userId = session.user.id

    const { searchParams } = request.nextUrl
    const params = {
      userId,
      status: searchParams.get('status') || undefined,
      participantId: searchParams.get('participantId') || undefined,
      page: safeParseInt(searchParams.get('page'), 1),
      pageSize: safeParseInt(searchParams.get('pageSize'), 20),
    }

    const result = await oneOnOneService.getOneOnOnes(tenantId, params as any)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error listing one-on-ones:', error)
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
    const result = await oneOnOneService.createOneOnOne(tenantId, body)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Error creating one-on-one:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
