import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getRequisitionById, updateRequisition } from '@/services/recruitment/requisition.service'

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
    const result = await getRequisitionById(id, session.user.tenantId)

    if (!result) {
      return NextResponse.json({ success: false, error: 'Requisition not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('GET /api/recruitment/requisitions/[id] error:', error)
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
    const ctx = { tenantId: session.user.tenantId, userId: session.user.id, userEmail: session.user.email || '' }

    const result = await updateRequisition(id, ctx.tenantId, body, ctx)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('PUT /api/recruitment/requisitions/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
