// src/app/api/analytics/predictions/calculate/route.ts
// Prediction Calculation Trigger API - Admin only

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { predictionService } from '@/services/analytics/prediction.service'

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const predictions = await predictionService.calculatePredictions(
      session.user.tenantId
    )

    return NextResponse.json({
      message: 'Tính toán dự đoán thành công',
      totalEmployees: predictions.length,
      highRisk: predictions.filter((p) => p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL').length,
      data: predictions,
    })
  } catch (error) {
    console.error('Error calculating predictions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
