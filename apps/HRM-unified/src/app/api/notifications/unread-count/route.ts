// src/app/api/notifications/unread-count/route.ts
// Get unread notification count

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { notificationService } from '@/services/notification.service'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const count = await notificationService.getUnreadCount(
      session.user.id
    )

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Error fetching unread count:', error)
    return NextResponse.json(
      { error: 'Failed to fetch unread count' },
      { status: 500 }
    )
  }
}
