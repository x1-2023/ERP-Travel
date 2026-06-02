// src/app/api/analytics/metrics/labor-cost/route.ts
// Labor Cost Metrics API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { laborCostService } from '@/services/analytics/labor-cost.service'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'HR_MANAGER', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get('date')
    const date = dateStr ? new Date(dateStr) : new Date()

    const data = await laborCostService.getLaborCostMetrics(
      session.user.tenantId,
      date
    )

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching labor cost metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
