import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getInterviews, createInterview } from '@/services/recruitment/interview.service'
import { safeParseInt } from '@/lib/api/parse-params'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tenantId = session.user.tenantId
    const filters = {
      applicationId: searchParams.get('applicationId') || undefined,
      interviewerId: searchParams.get('interviewerId') || undefined,
      status: searchParams.get('status') || undefined,
      type: searchParams.get('type') || undefined,
      search: searchParams.get('search') || undefined,
      page: safeParseInt(searchParams.get('page'), 1),
      pageSize: safeParseInt(searchParams.get('pageSize'), 20),
    }

    const result = await getInterviews(tenantId, filters)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('GET /api/recruitment/interviews error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const ctx = { tenantId: session.user.tenantId, userId: session.user.id, userEmail: session.user.email || '' }

    const result = await createInterview(ctx.tenantId, body, ctx.userId)
    return NextResponse.json({ success: true, data: result }, { status: 201 })
  } catch (error) {
    console.error('POST /api/recruitment/interviews error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
