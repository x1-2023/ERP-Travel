import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { exportService } from '@/services/export.service'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = new Date(searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    const endDate = new Date(searchParams.get('endDate') || new Date().toISOString())

    const ctx = { tenantId: session.user.tenantId, userId: session.user.id, userEmail: session.user.email }
    const buffer = await exportService.exportAuditLogs(session.user.tenantId, ctx, startDate, endDate)

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="audit-logs.xlsx"',
      },
    })
  } catch (error) {
    console.error('Export audit logs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
