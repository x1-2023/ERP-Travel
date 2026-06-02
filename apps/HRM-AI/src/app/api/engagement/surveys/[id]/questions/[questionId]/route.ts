import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { updateQuestion, deleteQuestion } from '@/services/engagement/engagement.service'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; questionId: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, questionId } = await params
    const body = await request.json()
    const question = await updateQuestion(session.user.tenantId, id, questionId, body)
    return NextResponse.json({ success: true, data: question })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update question'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string; questionId: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, questionId } = await params
    await deleteQuestion(session.user.tenantId, id, questionId)
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete question'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
