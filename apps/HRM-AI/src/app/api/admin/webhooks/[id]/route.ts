import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { webhookService } from '@/services/webhook.service'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const webhook = await webhookService.getById(params.id, session.user.tenantId)
    if (!webhook) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const deliveries = await webhookService.getDeliveries(params.id)
    return NextResponse.json({ data: { ...webhook, deliveries } })
  } catch (error) {
    console.error('Get webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const ctx = { tenantId: session.user.tenantId, userId: session.user.id, userEmail: session.user.email }
    const updated = await webhookService.update(params.id, session.user.tenantId, ctx, body)

    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('Update webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const ctx = { tenantId: session.user.tenantId, userId: session.user.id, userEmail: session.user.email }
    const success = await webhookService.delete(params.id, session.user.tenantId, ctx)

    if (!success) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
