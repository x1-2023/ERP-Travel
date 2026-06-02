// src/app/api/leave/requests/[id]/cancel/route.ts
// Cancel leave request

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { leaveRequestService } from '@/services/leave-request.service'

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
    const body = await request.json().catch(() => ({}))
    const reason = body.reason || 'Hủy yêu cầu'

    const leaveRequest = await leaveRequestService.cancel(
      session.user.tenantId,
      id,
      session.user.id,
      reason
    )

    return NextResponse.json(leaveRequest)
  } catch (error) {
    console.error('Error canceling request:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel request' },
      { status: 400 }
    )
  }
}
