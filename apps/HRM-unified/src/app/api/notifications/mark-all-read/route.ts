// src/app/api/notifications/mark-all-read/route.ts
// Mark all notifications as read

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { notificationService } from '@/services/notification.service'

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await notificationService.markAllAsRead(
      session.user.id
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark all notifications as read' },
      { status: 500 }
    )
  }
}
