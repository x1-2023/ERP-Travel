import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { exportService } from '@/services/export.service'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'HR_MANAGER', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('departmentId') || undefined
    const status = searchParams.get('status') || undefined

    const ctx = { tenantId: session.user.tenantId, userId: session.user.id, userEmail: session.user.email }
    const buffer = await exportService.exportEmployees(session.user.tenantId, ctx, { departmentId, status })

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="danh-sach-nhan-vien.xlsx"',
      },
    })
  } catch (error) {
    console.error('Export employees error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
