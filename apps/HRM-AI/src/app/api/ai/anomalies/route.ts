// src/app/api/ai/anomalies/route.ts
// Anomaly Detection API

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createAnomalyDetector } from '@/lib/ai/anomaly'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check role - only HR and Admin can access anomalies
    if (!['ADMIN', 'HR_MANAGER', 'HR_STAFF'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Detect anomalies
    const detector = createAnomalyDetector(session.user.tenantId)
    const result = await detector.detectAnomalies({
      tenantId: session.user.tenantId,
      userId: session.user.id
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Anomaly detection error:', error)
    return NextResponse.json(
      { error: 'Failed to detect anomalies' },
      { status: 500 }
    )
  }
}
