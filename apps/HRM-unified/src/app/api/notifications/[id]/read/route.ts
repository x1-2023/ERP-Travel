// src/app/api/notifications/[id]/read/route.ts
// Mark notification as read

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { notificationService } from '@/services/notification.service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await notificationService.markAsRead(
      id,
      session.user.id
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 400 }
    )
  }
}
