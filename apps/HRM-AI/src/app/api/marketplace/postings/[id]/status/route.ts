import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { updatePostingStatus } from '@/services/marketplace/marketplace.service'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { status, reason } = await request.json()
    const posting = await updatePostingStatus(session.user.tenantId, id, status, reason)
    return NextResponse.json({ success: true, data: posting })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update status'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
