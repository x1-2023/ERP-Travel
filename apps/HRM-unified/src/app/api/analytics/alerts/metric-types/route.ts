import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { alertService } from '@/services/analytics'

// GET /api/analytics/alerts/metric-types
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const metricTypes = alertService.getAvailableMetricTypes()

    return NextResponse.json({
      success: true,
      data: metricTypes,
    })
  } catch (error) {
    console.error('Error fetching metric types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metric types' },
      { status: 500 }
    )
  }
}
