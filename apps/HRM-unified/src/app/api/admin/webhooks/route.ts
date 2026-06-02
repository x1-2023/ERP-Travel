import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { webhookService } from '@/services/webhook.service'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const webhooks = await webhookService.getAll(session.user.tenantId)
    return NextResponse.json({ data: webhooks })
  } catch (error) {
    console.error('Get webhooks error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const ctx = { tenantId: session.user.tenantId, userId: session.user.id, userEmail: session.user.email }
    const result = await webhookService.create(session.user.tenantId, ctx, {
      name: body.name,
      url: body.url,
      events: body.events || [],
    })

    return NextResponse.json({ data: result }, { status: 201 })
  } catch (error) {
    console.error('Create webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
