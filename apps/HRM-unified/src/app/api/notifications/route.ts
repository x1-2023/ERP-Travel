// src/app/api/notifications/route.ts
// Get notifications for current user

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { notificationService } from '@/services/notification.service'
import { safeParseInt } from '@/lib/api/parse-params'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const limit = safeParseInt(searchParams.get('limit'), 50)

    const notifications = await notificationService.getByUser(
      session.user.id,
      { isRead: unreadOnly ? false : undefined, pageSize: limit }
    )

    return NextResponse.json({ data: notifications })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}
