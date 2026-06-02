// src/app/api/ai/insights/route.ts
// Dashboard AI Insights API

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createDashboardInsightsGenerator } from '@/lib/ai/insights'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check role - insights available to managers and HR
    if (!['ADMIN', 'HR_MANAGER', 'HR_STAFF', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Generate insights
    const generator = createDashboardInsightsGenerator(session.user.tenantId)
    const result = await generator.generateInsights({
      tenantId: session.user.tenantId,
      userId: session.user.id,
      role: session.user.role
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Insights API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
}
