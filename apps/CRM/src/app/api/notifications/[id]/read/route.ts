import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { markAsRead } from '@/lib/notifications'

// PATCH /api/notifications/[id]/read — Mark a notification as read
export async function PATCH(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    await markAsRead(params.id, user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('PATCH /api/notifications/[id]/read error:', error)
    return NextResponse.json({ error: 'Failed to mark notification as read' }, { status: 500 })
  }
}
