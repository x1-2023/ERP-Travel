import { NextRequest, NextResponse } from 'next/server'
import { getPortalSession } from '@/lib/portal-auth'
import { prisma } from '@/lib/prisma'
import { portalQuoteActionSchema } from '@/lib/validations/portal'
import { eventBus, CRM_EVENTS } from '@/lib/events'

export async function GET() {
  const session = await getPortalSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const quotes = await prisma.quote.findMany({
    where: { companyId: session.portalUser.companyId },
    include: {
      items: { include: { product: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json(quotes)
}

// PATCH — Accept/Reject quote
export async function PATCH(req: NextRequest) {
  const session = await getPortalSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = portalQuoteActionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Yêu cầu không hợp lệ' }, { status: 400 })
  }
  const { quoteId, action } = parsed.data

  // Verify quote belongs to their company
  const quote = await prisma.quote.findFirst({
    where: { id: quoteId, companyId: session.portalUser.companyId },
  })

  if (!quote) {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
  }

  const updated = await prisma.quote.update({
    where: { id: quoteId },
    data: { status: action },
  })

  // Fire-and-forget: emit quote accepted/rejected event
  const contactName = `${session.portalUser.firstName} ${session.portalUser.lastName}`.trim()
  const eventName = action === 'ACCEPTED' ? CRM_EVENTS.QUOTE_ACCEPTED : CRM_EVENTS.QUOTE_REJECTED
  eventBus.emit(eventName, {
    timestamp: new Date().toISOString(),
    quoteId,
    quote: { quoteNumber: quote.quoteNumber, contactName },
    ownerId: quote.createdById,
  }).catch(() => {})

  return NextResponse.json(updated)
}
