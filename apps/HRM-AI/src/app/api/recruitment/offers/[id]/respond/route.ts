import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { respondToOffer } from '@/services/recruitment/offer.service'

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
    const { accepted, note } = body as { accepted: boolean; note?: string }

    if (typeof accepted !== 'boolean') {
      return NextResponse.json({ success: false, error: 'accepted field is required and must be a boolean' }, { status: 400 })
    }

    const ctx = { tenantId: session.user.tenantId, userId: session.user.id, userEmail: session.user.email || '' }

    const result = await respondToOffer(id, ctx.tenantId, accepted, note)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('POST /api/recruitment/offers/[id]/respond error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
