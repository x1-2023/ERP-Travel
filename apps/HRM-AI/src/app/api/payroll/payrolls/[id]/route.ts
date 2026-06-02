// src/app/api/payroll/payrolls/[id]/route.ts
// Single Payroll (Payslip) API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { payrollService } from '@/services/payroll.service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const payroll = await payrollService.findById(session.user.tenantId, id)

    if (!payroll) {
      return NextResponse.json(
        { error: 'Bảng lương không tồn tại' },
        { status: 404 }
      )
    }

    // Check if user can view this payroll
    // HR staff can view all, employees can only view their own
    if (
      !['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'HR_STAFF'].includes(session.user.role) &&
      payroll.employeeId !== session.user.employeeId
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(payroll)
  } catch (error) {
    console.error('Error fetching payroll:', error)
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

    if (!['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    await payrollService.delete(session.user.tenantId, id)

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Error deleting payroll:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
