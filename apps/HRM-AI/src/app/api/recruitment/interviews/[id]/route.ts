import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getInterviewById, updateInterviewResult, rescheduleInterview } from '@/services/recruitment/interview.service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const result = await getInterviewById(id, session.user.tenantId)

    if (!result) {
      return NextResponse.json({ success: false, error: 'Interview not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('GET /api/recruitment/interviews/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
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
    const { action, result: interviewResult, notes, scheduledAt, reason } = body as {
      action: 'result' | 'reschedule'
      result?: string
      notes?: string
      scheduledAt?: string
      reason?: string
    }
    const ctx = { tenantId: session.user.tenantId, userId: session.user.id, userEmail: session.user.email || '' }

    let result

    switch (action) {
      case 'result':
        result = await updateInterviewResult(id, ctx.tenantId, interviewResult!, notes, ctx.userId)
        break
      case 'reschedule':
        if (!scheduledAt) {
          return NextResponse.json({ success: false, error: 'scheduledAt is required for reschedule' }, { status: 400 })
        }
        result = await rescheduleInterview(id, ctx.tenantId, new Date(scheduledAt), reason, ctx.userId)
        break
      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('PUT /api/recruitment/interviews/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
