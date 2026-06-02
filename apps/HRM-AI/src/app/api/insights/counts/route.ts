// src/app/api/insights/counts/route.ts
// Insight Counts API

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { insightService } from '@/services/insight.service'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only managers and admins can view insights
    if (!['ADMIN', 'HR_MANAGER', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const counts = await insightService.getCounts(session.user.tenantId)

    return NextResponse.json({ data: counts })
  } catch (error) {
    console.error('Get insight counts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
