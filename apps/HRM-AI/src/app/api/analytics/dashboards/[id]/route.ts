// src/app/api/analytics/dashboards/[id]/route.ts
// Single Dashboard Operations API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { dashboardService } from '@/services/analytics/dashboard.service'

export async function GET(
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

    const { id } = await params

    const dashboard = await dashboardService.getById(
      session.user.tenantId,
      session.user.id,
      id
    )

    if (!dashboard) {
      return NextResponse.json(
        { error: 'Dashboard không tồn tại' },
        { status: 404 }
      )
    }

    return NextResponse.json(dashboard)
  } catch (error) {
    console.error('Error fetching dashboard:', error)
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

    const { id } = await params
    const body = await request.json()

    const dashboard = await dashboardService.update(
      session.user.tenantId,
      session.user.id,
      id,
      body
    )

    return NextResponse.json(dashboard)
  } catch (error) {
    if (error instanceof Error && error.message.includes('không tồn tại')) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    console.error('Error updating dashboard:', error)
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

    const { id } = await params

    await dashboardService.delete(
      session.user.tenantId,
      session.user.id,
      id
    )

    return NextResponse.json({ message: 'Đã xóa dashboard thành công' })
  } catch (error) {
    if (error instanceof Error && error.message.includes('không tồn tại')) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    console.error('Error deleting dashboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
