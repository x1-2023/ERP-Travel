import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { addReaction } from '@/services/engagement/recognition.service'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId || !session.user.employeeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { emoji } = await request.json()
    const reaction = await addReaction(session.user.tenantId, id, session.user.employeeId, emoji)
    return NextResponse.json({ success: true, data: reaction })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to add reaction'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
