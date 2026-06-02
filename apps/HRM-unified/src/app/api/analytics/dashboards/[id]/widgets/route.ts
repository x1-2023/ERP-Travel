// src/app/api/analytics/dashboards/[id]/widgets/route.ts
// Dashboard Widget Operations API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { dashboardService } from '@/services/analytics/dashboard.service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'HR_MANAGER', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id: dashboardId } = await params
    const body = await request.json()
    const { widgetType, title, x, y, width, height, config, dataSource } = body

    if (!widgetType || !title || x === undefined || y === undefined || !width || !height || !config || !dataSource) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc: widgetType, title, x, y, width, height, config, dataSource' },
        { status: 400 }
      )
    }

    const widget = await dashboardService.addWidget(
      session.user.tenantId,
      session.user.id,
      dashboardId,
      { widgetType, title, x, y, width, height, config, dataSource }
    )

    return NextResponse.json(widget, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.includes('không tồn tại')) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    console.error('Error adding widget:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'HR_MANAGER', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id: dashboardId } = await params
    const body = await request.json()
    const { widgetId, ...updateData } = body

    if (!widgetId) {
      return NextResponse.json(
        { error: 'Thiếu widgetId' },
        { status: 400 }
      )
    }

    const widget = await dashboardService.updateWidget(
      session.user.tenantId,
      session.user.id,
      dashboardId,
      widgetId,
      updateData
    )

    return NextResponse.json(widget)
  } catch (error) {
    if (error instanceof Error && error.message.includes('không tồn tại')) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    console.error('Error updating widget:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'HR_MANAGER', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id: dashboardId } = await params
    const { searchParams } = new URL(request.url)
    const widgetId = searchParams.get('widgetId')

    if (!widgetId) {
      return NextResponse.json(
        { error: 'Thiếu widgetId' },
        { status: 400 }
      )
    }

    await dashboardService.removeWidget(
      session.user.tenantId,
      session.user.id,
      dashboardId,
      widgetId
    )

    return NextResponse.json({ message: 'Đã xóa widget thành công' })
  } catch (error) {
    if (error instanceof Error && error.message.includes('không tồn tại')) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    console.error('Error removing widget:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
