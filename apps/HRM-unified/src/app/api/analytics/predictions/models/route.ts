import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { predictiveAnalyticsService } from '@/services/analytics'

// GET /api/analytics/predictions/models
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    const models = await predictiveAnalyticsService.getModels(tenantId)

    return NextResponse.json({
      success: true,
      data: models,
    })
  } catch (error) {
    console.error('Error fetching models:', error)
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    )
  }
}
