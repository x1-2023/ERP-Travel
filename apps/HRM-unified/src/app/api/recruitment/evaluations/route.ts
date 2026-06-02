import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getEvaluations, createEvaluation } from '@/services/recruitment/evaluation.service'
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
      evaluatorId: searchParams.get('evaluatorId') || undefined,
      interviewId: searchParams.get('interviewId') || undefined,
      page: safeParseInt(searchParams.get('page'), 1),
      pageSize: safeParseInt(searchParams.get('pageSize'), 20),
    }

    const result = await getEvaluations(tenantId, filters)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('GET /api/recruitment/evaluations error:', error)
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

    const result = await createEvaluation(ctx.tenantId, body)
    return NextResponse.json({ success: true, data: result }, { status: 201 })
  } catch (error) {
    console.error('POST /api/recruitment/evaluations error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
