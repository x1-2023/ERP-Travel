import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import * as requestService from '@/services/learning/request.service'
import { safeParseInt } from '@/lib/api/parse-params'

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
      employeeId: searchParams.get('employeeId') || userId,
      status: searchParams.get('status') || undefined,
      page: safeParseInt(searchParams.get('page'), 1),
      limit: safeParseInt(searchParams.get('limit'), 20),
    }

    const result = await requestService.getTrainingRequests(tenantId, {
      employeeId: params.employeeId,
      status: params.status,
    }, params.page, params.limit)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching requests:', error)
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
    const result = await requestService.createTrainingRequest(tenantId, userId, body)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
