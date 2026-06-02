import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getJobPostings, createJobPosting } from '@/services/recruitment/job-posting.service'
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
      status: searchParams.get('status') || undefined,
      isPublic: searchParams.get('isPublic') ? searchParams.get('isPublic') === 'true' : undefined,
      search: searchParams.get('search') || undefined,
    }
    const page = safeParseInt(searchParams.get('page'), 1)
    const pageSize = safeParseInt(searchParams.get('pageSize'), 20)

    const result = await getJobPostings(tenantId, filters, page, pageSize)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('GET /api/recruitment/jobs error:', error)
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

    const result = await createJobPosting(ctx.tenantId, body, ctx)
    return NextResponse.json({ success: true, data: result }, { status: 201 })
  } catch (error) {
    console.error('POST /api/recruitment/jobs error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
