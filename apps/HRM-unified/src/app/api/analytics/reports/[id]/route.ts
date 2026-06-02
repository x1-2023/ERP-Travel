// src/app/api/analytics/reports/[id]/route.ts
// Single Report Operations API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { analyticsReportService } from '@/services/analytics/report.service'

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

    const report = await analyticsReportService.getById(
      session.user.tenantId,
      id
    )

    if (!report) {
      return NextResponse.json(
        { error: 'Báo cáo không tồn tại' },
        { status: 404 }
      )
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error fetching report:', error)
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

    if (!['ADMIN', 'HR_MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    const report = await analyticsReportService.update(
      session.user.tenantId,
      id,
      body
    )

    return NextResponse.json(report)
  } catch (error) {
    if (error instanceof Error && error.message.includes('không tồn tại')) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    console.error('Error updating report:', error)
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

    if (!['ADMIN', 'HR_MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    await analyticsReportService.delete(
      session.user.tenantId,
      id
    )

    return NextResponse.json({ message: 'Đã xóa báo cáo thành công' })
  } catch (error) {
    if (error instanceof Error && error.message.includes('không tồn tại')) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    console.error('Error deleting report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
