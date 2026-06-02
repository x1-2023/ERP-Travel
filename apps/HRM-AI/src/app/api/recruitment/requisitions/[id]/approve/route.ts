import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { approveRequisition, submitForApproval, openRequisition } from '@/services/recruitment/requisition.service'

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
    const { action, note } = body as { action: 'submit' | 'approve' | 'reject' | 'open'; note?: string }
    const ctx = { tenantId: session.user.tenantId, userId: session.user.id, userEmail: session.user.email || '' }

    let result

    switch (action) {
      case 'submit':
        result = await submitForApproval(id, ctx.tenantId, ctx)
        break
      case 'approve':
        result = await approveRequisition(id, ctx.tenantId, ctx.userId, true, note, ctx)
        break
      case 'reject':
        result = await approveRequisition(id, ctx.tenantId, ctx.userId, false, note, ctx)
        break
      case 'open':
        result = await openRequisition(id, ctx.tenantId, ctx)
        break
      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('POST /api/recruitment/requisitions/[id]/approve error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
