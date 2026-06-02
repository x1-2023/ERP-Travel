import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getPosting, updatePosting } from '@/services/marketplace/marketplace.service'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const posting = await getPosting(session.user.tenantId, id)
    if (!posting) {
      return NextResponse.json({ error: 'Posting not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: posting })
  } catch (error) {
    console.error('Error getting posting:', error)
    return NextResponse.json({ error: 'Failed to get posting' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const posting = await updatePosting(session.user.tenantId, id, body)
    return NextResponse.json({ success: true, data: posting })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update posting'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
