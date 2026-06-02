import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { publishJobPosting, closeJobPosting } from '@/services/recruitment/job-posting.service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { action } = body as { action: 'publish' | 'close' }
    const ctx = { tenantId: session.user.tenantId, userId: session.user.id, userEmail: session.user.email || '' }

    let result

    switch (action) {
      case 'publish':
        result = await publishJobPosting(id, ctx.tenantId, ctx)
        break
      case 'close':
        result = await closeJobPosting(id, ctx.tenantId, ctx)
        break
      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('POST /api/recruitment/jobs/[id]/publish error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
