import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { workforceAnalyticsService } from '@/services/analytics'

// GET /api/analytics/workforce
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    const { searchParams } = new URL(request.url)

    const startDateStr = searchParams.get('startDate')
    const endDateStr = searchParams.get('endDate')
    const compare = searchParams.get('compare') === 'true'

    const endDate = endDateStr ? new Date(endDateStr) : new Date()
    const startDate = startDateStr
      ? new Date(startDateStr)
      : new Date(endDate.getFullYear(), endDate.getMonth() - 1, endDate.getDate())

    if (compare) {
      // Get previous period for comparison
      const periodLength = endDate.getTime() - startDate.getTime()
      const previousEndDate = new Date(startDate.getTime() - 1)
      const previousStartDate = new Date(previousEndDate.getTime() - periodLength)

      const comparison = await workforceAnalyticsService.compareWorkforceMetrics(
        tenantId,
        startDate,
        endDate,
        previousStartDate,
        previousEndDate
      )

      return NextResponse.json({
        success: true,
        data: comparison,
      })
    }

    const metrics = await workforceAnalyticsService.getWorkforceMetrics(
      tenantId,
      startDate,
      endDate
    )

    return NextResponse.json({
      success: true,
      data: metrics,
    })
  } catch (error) {
    console.error('Error fetching workforce analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workforce analytics' },
      { status: 500 }
    )
  }
}
