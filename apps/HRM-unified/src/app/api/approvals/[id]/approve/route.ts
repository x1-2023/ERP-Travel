// src/app/api/approvals/[id]/approve/route.ts
// Approve an approval step

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
    const body = await request.json().catch(() => ({}))
    const comment = body.comment || ''

    const result = await approvalService.approve(
      id,
      session.user.id,
      comment
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error approving:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to approve' },
      { status: 400 }
    )
  }
}
