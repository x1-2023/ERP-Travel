// src/app/api/leave/requests/[id]/submit/route.ts
// Submit leave request for approval

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
    const leaveRequest = await leaveRequestService.submit(
      session.user.tenantId,
      id,
      session.user.id
    )

    return NextResponse.json(leaveRequest)
  } catch (error) {
    console.error('Error submitting request:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit request' },
      { status: 400 }
    )
  }
}
