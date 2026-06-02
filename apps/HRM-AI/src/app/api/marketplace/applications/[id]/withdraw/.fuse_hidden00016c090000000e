import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { withdrawApplication } from '@/services/marketplace/marketplace.service'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId || !session.user.employeeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { reason } = await request.json()
    const application = await withdrawApplication(session.user.tenantId, id, session.user.employeeId, reason)
    return NextResponse.json({ success: true, data: application })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to withdraw'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
