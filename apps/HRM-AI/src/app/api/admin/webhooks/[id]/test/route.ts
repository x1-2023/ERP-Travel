import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { webhookService } from '@/services/webhook.service'

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const result = await webhookService.test(params.id, session.user.tenantId)
    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('Test webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
