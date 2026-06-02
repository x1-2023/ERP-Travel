import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { emailService } from '@/services/email.service'
import { safeParseInt } from '@/lib/api/parse-params'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const page = safeParseInt(searchParams.get('page'), 1)

    const result = await emailService.getQueue(session.user.tenantId, status, page)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Get email queue error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const result = await emailService.processQueue(session.user.tenantId)
    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('Process email queue error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
