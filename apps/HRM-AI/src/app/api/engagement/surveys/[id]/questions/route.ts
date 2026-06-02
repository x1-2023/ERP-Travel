import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { addQuestion } from '@/services/engagement/engagement.service'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const question = await addQuestion(session.user.tenantId, id, body)
    return NextResponse.json({ success: true, data: question }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to add question'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
