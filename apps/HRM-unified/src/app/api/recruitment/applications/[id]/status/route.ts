import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { updateApplicationStatus } from '@/services/recruitment/application.service'

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
    const { status, rejectionReason, screeningScore, screeningNotes } = body as {
      status: string
      rejectionReason?: string
      screeningScore?: number
      screeningNotes?: string
    }

    if (!status) {
      return NextResponse.json({ success: false, error: 'Status is required' }, { status: 400 })
    }

    const ctx = { tenantId: session.user.tenantId, userId: session.user.id, userEmail: session.user.email || '' }

    const result = await updateApplicationStatus(id, ctx.tenantId, status, ctx.userId, {
      rejectionReason,
      screeningScore,
      screeningNotes,
    }, ctx)

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('PUT /api/recruitment/applications/[id]/status error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
