import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getComments, addComment } from '@/services/engagement/recognition.service'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const comments = await getComments(session.user.tenantId, id)
    return NextResponse.json({ success: true, data: comments })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get comments'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId || !session.user.employeeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { content } = await request.json()
    const comment = await addComment(session.user.tenantId, id, session.user.employeeId, content)
    return NextResponse.json({ success: true, data: comment }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to add comment'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
