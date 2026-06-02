import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { canAccess } from '@/lib/auth/rbac'
import { Unauthorized, NotFound, Forbidden, handleApiError } from '@/lib/api/errors'
import { apiCreated } from '@/lib/api/response'
import { validateRequest, staffTicketMessageSchema } from '@/lib/validations'
import { eventBus, CRM_EVENTS } from '@/lib/events'

// POST /api/tickets/[id]/messages — Staff reply or internal note
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    const { id } = params

    if (!canAccess(user, 'create')) {
      return handleApiError(Forbidden(), '/api/tickets/[id]/messages')
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        subject: true,
        assigneeId: true,
        portalUser: { select: { firstName: true, lastName: true } },
      },
    })
    if (!ticket) return handleApiError(NotFound('Ticket'), '/api/tickets/[id]/messages')

    const body = await req.json()
    const data = validateRequest(staffTicketMessageSchema, body)

    // Create message from staff
    const message = await prisma.ticketMessage.create({
      data: {
        content: data.content,
        isInternal: data.isInternal,
        ticketId: id,
        userId: user.id,
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    })

    // Auto-update ticket status + track first response time
    if (!data.isInternal) {
      const ticketUpdate: Record<string, unknown> = {}

      // Track first response time
      const fullTicket = await prisma.supportTicket.findUnique({
        where: { id },
        select: { firstResponseAt: true },
      })
      if (!fullTicket?.firstResponseAt) {
        ticketUpdate.firstResponseAt = new Date()
      }

      // Auto-update status to WAITING_CUSTOMER if currently OPEN
      if (ticket.status === 'OPEN') {
        ticketUpdate.status = 'WAITING_CUSTOMER'
        ticketUpdate.assigneeId = ticket.assigneeId || user.id
      }

      if (Object.keys(ticketUpdate).length > 0) {
        await prisma.supportTicket.update({
          where: { id },
          data: ticketUpdate,
        })
      }
    }

    // Emit staff replied event for visibility
    if (!data.isInternal) {
      eventBus.emit(CRM_EVENTS.TICKET_STAFF_REPLIED, {
        timestamp: new Date().toISOString(),
        userId: user.id,
        ticketId: id,
        ticket: { subject: ticket.subject },
        staffName: user.name || 'Staff',
      }).catch(() => {})
    }

    return apiCreated(message)
  } catch (error) {
    if (error instanceof AuthError) return handleApiError(Unauthorized(error.message), '/api/tickets/[id]/messages')
    return handleApiError(error, '/api/tickets/[id]/messages')
  }
}
