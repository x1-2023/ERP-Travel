import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { auditService } from '@/services/audit.service'
import { safeParseInt } from '@/lib/api/parse-params'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = safeParseInt(searchParams.get('page'), 1)
    const pageSize = safeParseInt(searchParams.get('pageSize'), 50)
    const action = searchParams.get('action') || undefined
    const entityType = searchParams.get('entityType') || undefined
    const userId = searchParams.get('userId') || undefined
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined

    const result = await auditService.getLogs(session.user.tenantId, {
      action, entityType, userId, startDate, endDate, page, pageSize,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Get audit logs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
