// src/app/api/approvals/pending/route.ts
// Get pending approvals for current user

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { approvalService } from '@/services/approval.service'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pendingApprovals = await approvalService.getPending(
      session.user.id
    )

    return NextResponse.json({ data: pendingApprovals })
  } catch (error) {
    console.error('Error fetching pending approvals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending approvals' },
      { status: 500 }
    )
  }
}
