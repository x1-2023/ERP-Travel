import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { managerApproval } from '@/services/marketplace/marketplace.service'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { approved, notes } = await request.json()
    const application = await managerApproval(session.user.tenantId, id, approved, notes)
    return NextResponse.json({ success: true, data: application })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to process approval'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
