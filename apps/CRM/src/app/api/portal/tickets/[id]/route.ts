import { NextRequest, NextResponse } from 'next/server'
import { getPortalSession } from '@/lib/portal-auth'
import { prisma } from '@/lib/prisma'
import { portalTicketMessageSchema } from '@/lib/validations/portal'
import { eventBus, CRM_EVENTS } from '@/lib/events'

// GET — Get ticket with messages
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getPortalSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const ticket = await prisma.supportTicket.findFirst({
    where: {
      id: params.id,
      portalUserId: session.portalUser.id,
    },
    include: {
      assignee: { select: { name: true } },
      messages: {
        where: { isInternal: false },
        orderBy: { createdAt: 'asc' },
        include: {
          portalUser: { select: { firstName: true, lastName: true } },
          user: { select: { name: true } },
        },
      },
    },
  })

  if (!ticket) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
  }

  return NextResponse.json(ticket)
}

// POST — Add message to ticket
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getPortalSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = portalTicketMessageSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Nội dung không được để trống' }, { status: 400 })
  }
  const { content } = parsed.data

  // Verify ticket belongs to user
  const ticket = await prisma.supportTicket.findFirst({
    where: { id: params.id, portalUserId: session.portalUser.id },
  })

  if (!ticket) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
  }

  const message = await prisma.ticketMessage.create({
    data: {
      content,
      ticketId: params.id,
      portalUserId: session.portalUser.id,
    },
  })

  // Reopen if resolved/closed/waiting — customer replied = needs attention
  if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' || ticket.status === 'WAITING_CUSTOMER') {
    await prisma.supportTicket.update({
      where: { id: params.id },
      data: { status: 'OPEN' },
    })
  }

  // Fire-and-forget: emit ticket replied event
  const contactName = `${session.portalUser.firstName} ${session.portalUser.lastName}`.trim()
  eventBus.emit(CRM_EVENTS.TICKET_REPLIED, {
    timestamp: new Date().toISOString(),
    ticketId: ticket.id,
    ticket: { subject: ticket.subject, priority: ticket.priority, status: ticket.status },
    contactName,
    assigneeId: ticket.assigneeId,
  }).catch(() => {})

  return NextResponse.json(message, { status: 201 })
}
