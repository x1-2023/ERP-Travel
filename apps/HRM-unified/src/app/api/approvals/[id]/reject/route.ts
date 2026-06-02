// src/app/api/approvals/[id]/reject/route.ts
// Reject an approval step

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { approvalService } from '@/services/approval.service'

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
    const body = await request.json()
    const reason = body.reason || ''

    if (!reason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      )
    }

    const result = await approvalService.reject(
      id,
      session.user.id,
      reason
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error rejecting:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to reject' },
      { status: 400 }
    )
  }
}
