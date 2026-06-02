// src/app/api/analytics/dashboards/route.ts
// Custom Dashboards List & Create API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { dashboardService } from '@/services/analytics/dashboard.service'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'HR_MANAGER', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const dashboards = await dashboardService.list(
      session.user.tenantId,
      session.user.id
    )

    return NextResponse.json({ data: dashboards })
  } catch (error) {
    console.error('Error fetching dashboards:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'HR_MANAGER', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, layout, isDefault, isShared } = body

    if (!name || !layout) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc: name, layout' },
        { status: 400 }
      )
    }

    const dashboard = await dashboardService.create(
      session.user.tenantId,
      session.user.id,
      { name, description, layout, isDefault, isShared }
    )

    return NextResponse.json(dashboard, { status: 201 })
  } catch (error) {
    console.error('Error creating dashboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
