import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { canAccess } from '@/lib/auth/rbac'
import { Unauthorized, NotFound, BadRequest, Forbidden, handleApiError } from '@/lib/api/errors'
import { apiSuccess } from '@/lib/api/response'
import { validateRequest, updateTicketSchema, isValidTransition } from '@/lib/validations'
import { eventBus, CRM_EVENTS } from '@/lib/events'
import { calculateSlaStatus } from '@/lib/tickets/sla-engine'

// GET /api/tickets/[id] — Ticket detail with messages
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    const { id } = params

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        portalUser: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        company: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            portalUser: { select: { id: true, firstName: true, lastName: true } },
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
      },
    })

    if (!ticket) return handleApiError(NotFound('Ticket'), '/api/tickets/[id]')

    // RBAC: MEMBER can only see assigned tickets
    if (!canAccess(user, 'view_all') && ticket.assigneeId !== user.id) {
      return handleApiError(Forbidden(), '/api/tickets/[id]')
    }

    // Calculate SLA status for active tickets
    let sla = null
    if (['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED'].includes(ticket.status)) {
      sla = await calculateSlaStatus(ticket)
    }

    return apiSuccess({ ...ticket, sla })
  } catch (error) {
    if (error instanceof AuthError) return handleApiError(Unauthorized(error.message), '/api/tickets/[id]')
    return handleApiError(error, '/api/tickets/[id]')
  }
}

// PATCH /api/tickets/[id] — Update status, priority, assignee
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    const { id } = params

    // MEMBER+ can update tickets
    if (!canAccess(user, 'create')) {
      return handleApiError(Forbidden(), '/api/tickets/[id]')
    }

    const existing = await prisma.supportTicket.findUnique({
      where: { id },
      select: { id: true, status: true, assigneeId: true },
    })
    if (!existing) return handleApiError(NotFound('Ticket'), '/api/tickets/[id]')

    const body = await req.json()
    const data = validateRequest(updateTicketSchema, body)

    // Validate status transition
    if (data.status && data.status !== existing.status) {
      if (!isValidTransition(existing.status, data.status)) {
        return handleApiError(
          BadRequest(`Không thể chuyển từ ${existing.status} sang ${data.status}`),
          '/api/tickets/[id]'
        )
      }
    }

    // Build update data with auto timestamps
    const updateData: Record<string, unknown> = { ...data }
    if (data.status === 'RESOLVED' && existing.status !== 'RESOLVED') {
      updateData.resolvedAt = new Date()
    }

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: updateData,
      include: {
        portalUser: { select: { id: true, firstName: true, lastName: true, email: true } },
        company: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, avatarUrl: true } },
      },
    })

    // Emit ticket assigned event
    if (data.assigneeId && data.assigneeId !== existing.assigneeId) {
      eventBus.emit(CRM_EVENTS.TICKET_ASSIGNED, {
        timestamp: new Date().toISOString(),
        userId: user.id,
        ticketId: ticket.id,
        ticket: { subject: ticket.subject, priority: ticket.priority, status: ticket.status },
        contactName: `${ticket.portalUser.firstName} ${ticket.portalUser.lastName}`,
        assigneeId: data.assigneeId,
      }).catch(() => {})
    }

    // Emit ticket resolved event
    if (data.status === 'RESOLVED' && existing.status !== 'RESOLVED') {
      eventBus.emit(CRM_EVENTS.TICKET_RESOLVED, {
        timestamp: new Date().toISOString(),
        userId: user.id,
        ticketId: ticket.id,
        ticket: { subject: ticket.subject, priority: ticket.priority, status: ticket.status },
        contactName: `${ticket.portalUser.firstName} ${ticket.portalUser.lastName}`,
        assigneeId: ticket.assigneeId,
      }).catch(() => {})
    }

    return apiSuccess(ticket)
  } catch (error) {
    if (error instanceof AuthError) return handleApiError(Unauthorized(error.message), '/api/tickets/[id]')
    return handleApiError(error, '/api/tickets/[id]')
  }
}
