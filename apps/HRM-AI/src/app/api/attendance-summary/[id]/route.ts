// src/app/api/attendance-summary/[id]/route.ts
// Single attendance summary API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { summaryService } from '@/services/summary.service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const summary = await summaryService.findById(session.user.tenantId, id)

    if (!summary) {
      return NextResponse.json({ error: 'Không tìm thấy bảng công' }, { status: 404 })
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error('Error fetching attendance summary:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'lock') {
      const summary = await summaryService.lockSummary(
        session.user.tenantId,
        id,
        session.user.id
      )
      return NextResponse.json(summary)
    }

    if (action === 'unlock') {
      const summary = await summaryService.unlockSummary(
        session.user.tenantId,
        id
      )
      return NextResponse.json(summary)
    }

    return NextResponse.json(
      { error: 'Invalid action. Use ?action=lock or ?action=unlock' },
      { status: 400 }
    )
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Error processing summary action:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
