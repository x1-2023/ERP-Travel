// src/app/api/analytics/predictions/turnover/route.ts
// Turnover Predictions API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { predictionService } from '@/services/analytics/prediction.service'

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
    const riskLevel = searchParams.get('riskLevel')

    let predictions = await predictionService.getPredictions(session.user.tenantId)

    if (riskLevel) {
      predictions = predictions.filter((p) => p.riskLevel === riskLevel)
    }

    return NextResponse.json({ data: predictions })
  } catch (error) {
    console.error('Error fetching turnover predictions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
