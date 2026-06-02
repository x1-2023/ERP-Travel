// src/app/api/insights/generate/route.ts
// Generate Insights API (Admin only)

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { insightService } from '@/services/insight.service'

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only admins can trigger insight generation
    if (!['ADMIN', 'HR_MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const result = await insightService.generateAllInsights(
      session.user.tenantId
    )

    return NextResponse.json({
      success: true,
      message: `Đã tạo ${result.total} insights mới`,
      ...result,
    })
  } catch (error) {
    console.error('Generate insights error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
