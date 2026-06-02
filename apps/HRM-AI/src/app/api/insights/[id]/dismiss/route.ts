// src/app/api/insights/[id]/dismiss/route.ts
// Dismiss Insight API

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { insightService } from '@/services/insight.service'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!['ADMIN', 'HR_MANAGER', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { id } = await params

    await insightService.dismiss(
      session.user.tenantId,
      id,
      session.user.id
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Dismiss insight error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
