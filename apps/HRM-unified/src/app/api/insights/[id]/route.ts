// src/app/api/insights/[id]/route.ts
// Single Insight API

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { insightService } from '@/services/insight.service'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
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

    const insight = await insightService.getById(session.user.tenantId, id)

    if (!insight) {
      return NextResponse.json(
        { error: 'Insight not found' },
        { status: 404 }
      )
    }

    // Mark as read
    await insightService.markAsRead(session.user.tenantId, id)

    return NextResponse.json({ data: insight })
  } catch (error) {
    console.error('Get insight error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
