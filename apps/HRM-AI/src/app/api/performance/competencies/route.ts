import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import * as competencyService from '@/services/performance/competency.service'
import { safeParseInt } from '@/lib/api/parse-params'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const tenantId = session.user.tenantId

    const { searchParams } = request.nextUrl
    const params = {
      category: searchParams.get('category') || undefined,
      frameworkId: searchParams.get('frameworkId') || undefined,
      search: searchParams.get('search') || undefined,
      page: safeParseInt(searchParams.get('page'), 1),
      pageSize: safeParseInt(searchParams.get('pageSize'), 20),
    }

    const result = await competencyService.listCompetencies(tenantId, params)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error listing competencies:', error)
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
    const result = await competencyService.createCompetency(body.frameworkId, body)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Error creating competency:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
