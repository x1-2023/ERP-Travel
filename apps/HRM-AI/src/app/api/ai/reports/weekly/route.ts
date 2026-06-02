// src/app/api/ai/reports/weekly/route.ts
// Weekly AI Summary API

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createWeeklySummaryGenerator } from '@/lib/ai/reports'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check role - only HR and Admin can access summaries
    if (!['ADMIN', 'HR_MANAGER', 'HR_STAFF'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Parse optional date parameters
    const { searchParams } = new URL(request.url)
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')

    const startDate = startDateParam ? new Date(startDateParam) : undefined
    const endDate = endDateParam ? new Date(endDateParam) : undefined

    // Generate summary
    const generator = createWeeklySummaryGenerator(session.user.tenantId)
    const summary = await generator.generateSummary({
      tenantId: session.user.tenantId,
      userId: session.user.id,
      startDate,
      endDate
    })

    return NextResponse.json(summary)
  } catch (error) {
    console.error('Weekly summary error:', error)
    return NextResponse.json(
      { error: 'Failed to generate weekly summary' },
      { status: 500 }
    )
  }
}
