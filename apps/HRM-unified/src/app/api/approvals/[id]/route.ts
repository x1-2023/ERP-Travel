// src/app/api/approvals/[id]/route.ts
// Get approval step details

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const approvalStep = await db.approvalStep.findFirst({
      where: {
        id,
        instance: {
          tenantId: session.user.tenantId,
        },
      },
      include: {
        instance: {
          include: {
            leaveRequests: {
              include: {
                employee: true,
                policy: true,
              },
            },
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        delegatedFrom: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!approvalStep) {
      return NextResponse.json({ error: 'Approval not found' }, { status: 404 })
    }

    return NextResponse.json(approvalStep)
  } catch (error) {
    console.error('Error fetching approval:', error)
    return NextResponse.json(
      { error: 'Failed to fetch approval' },
      { status: 500 }
    )
  }
}
