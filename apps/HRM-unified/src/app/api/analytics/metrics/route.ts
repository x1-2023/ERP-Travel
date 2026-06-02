// src/app/api/analytics/metrics/route.ts
// Analytics Metrics API - Stored metrics with filters

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

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
    const type = searchParams.get('type')
    const period = searchParams.get('period')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const departmentId = searchParams.get('departmentId')

    const where: Record<string, unknown> = {
      tenantId: session.user.tenantId,
    }

    if (type) {
      where.metricType = type
    }
    if (period) {
      where.period = period
    }
    if (departmentId) {
      where.departmentId = departmentId
    }
    if (startDate || endDate) {
      where.periodStart = {}
      if (startDate) {
        (where.periodStart as Record<string, unknown>).gte = new Date(startDate)
      }
      if (endDate) {
        (where.periodStart as Record<string, unknown>).lte = new Date(endDate)
      }
    }

    const metrics = await db.analyticsMetric.findMany({
      where,
      include: {
        department: {
          select: { id: true, name: true },
        },
      },
      orderBy: { periodStart: 'desc' },
    })

    return NextResponse.json({ data: metrics })
  } catch (error) {
    console.error('Error fetching analytics metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
