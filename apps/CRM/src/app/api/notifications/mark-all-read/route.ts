import { NextResponse } from 'next/server'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { markAllAsRead } from '@/lib/notifications'

// POST /api/notifications/mark-all-read — Mark all notifications as read
export async function POST() {
  try {
    const user = await getCurrentUser()
    const count = await markAllAsRead(user.id)
    return NextResponse.json({ success: true, count })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('POST /api/notifications/mark-all-read error:', error)
    return NextResponse.json({ error: 'Failed to mark all notifications as read' }, { status: 500 })
  }
}
