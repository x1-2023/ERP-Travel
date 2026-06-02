import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { reportBuilderService } from '@/services/analytics'

// GET /api/analytics/reports/data-sources
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dataSources = await reportBuilderService.getAvailableDataSources()

    return NextResponse.json({
      success: true,
      data: dataSources,
    })
  } catch (error) {
    console.error('Error fetching data sources:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data sources' },
      { status: 500 }
    )
  }
}
