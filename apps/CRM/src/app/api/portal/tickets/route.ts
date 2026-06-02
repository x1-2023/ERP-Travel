import { NextRequest, NextResponse } from 'next/server'
import { getPortalSession } from '@/lib/portal-auth'
import { prisma } from '@/lib/prisma'
import { portalCreateTicketSchema } from '@/lib/validations/portal'
import { formatZodErrors } from '@/lib/validations/utils'
import { eventBus, CRM_EVENTS } from '@/lib/events'
import { autoAssignTicket } from '@/lib/tickets/auto-assign'

// GET — List tickets
export async function GET() {
  const session = await getPortalSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tickets = await prisma.supportTicket.findMany({
    where: { portalUserId: session.portalUser.id },
    include: {
      _count: { select: { messages: true } },
    },
    orderBy: { updatedAt: 'desc' },
    take: 50,
  })

  return NextResponse.json(tickets)
}

// POST — Create ticket
export async function POST(req: NextRequest) {
  const session = await getPortalSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = portalCreateTicketSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dữ liệu không hợp lệ', details: formatZodErrors(parsed.error) },
      { status: 400 }
    )
  }

  const { subject, content, category, priority } = parsed.data
  const ticketNumber = `TK-${Date.now().toString(36).toUpperCase()}`

  const ticket = await prisma.supportTicket.create({
    data: {
      ticketNumber,
      subject,
      category,
      priority: priority || 'MEDIUM',
      portalUserId: session.portalUser.id,
      companyId: session.portalUser.companyId,
      messages: {
        create: {
          content,
          portalUserId: session.portalUser.id,
        },
      },
    },
    include: {
      messages: true,
    },
  })

  // Fire-and-forget: emit ticket created event
  const contactName = `${session.portalUser.firstName} ${session.portalUser.lastName}`.trim()
  eventBus.emit(CRM_EVENTS.TICKET_CREATED, {
    timestamp: new Date().toISOString(),
    ticketId: ticket.id,
    ticket: { subject, priority: priority || 'MEDIUM', status: 'OPEN' },
    contactName,
  }).catch(() => {})

  // Fire-and-forget: auto-assign ticket based on strategy
  autoAssignTicket(ticket.id).catch(() => {})

  return NextResponse.json(ticket, { status: 201 })
}
