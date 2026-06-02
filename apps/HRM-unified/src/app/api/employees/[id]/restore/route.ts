import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { employeeService } from '@/services/employee.service'
import { audit } from '@/lib/audit/logger'

export async function POST(
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
    const employee = await employeeService.restore(session.user.tenantId, id)

    await audit.create(
      { tenantId: session.user.tenantId, userId: session.user.id, userEmail: session.user.email || '' },
      'Employee',
      id
    )

    return NextResponse.json({ success: true, data: employee })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Không thể khôi phục nhân viên' }, { status: 500 })
  }
}
