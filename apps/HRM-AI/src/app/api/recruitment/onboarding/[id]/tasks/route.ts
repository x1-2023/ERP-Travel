import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { updateTaskStatus } from '@/services/recruitment/onboarding.service'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await params
    const body = await request.json()
    const { taskId, status, notes } = body as {
      taskId: string
      status: string
      notes?: string
    }

    if (!taskId || !status) {
      return NextResponse.json(
        { success: false, error: 'taskId and status are required' },
        { status: 400 }
      )
    }

    const ctx = { tenantId: session.user.tenantId, userId: session.user.id, userEmail: session.user.email || '' }

    const result = await updateTaskStatus(taskId, status, ctx.userId, notes)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('PUT /api/recruitment/onboarding/[id]/tasks error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
