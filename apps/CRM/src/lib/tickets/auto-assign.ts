import { prisma } from '@/lib/prisma'
import { eventBus, CRM_EVENTS } from '@/lib/events'

export type AssignStrategy = 'round_robin' | 'least_loaded' | 'manual'

/**
 * Auto-assign a ticket based on the configured strategy.
 * Returns the assigned userId or null if manual / no users available.
 */
export async function autoAssignTicket(ticketId: string): Promise<string | null> {
  // Get strategy from settings
  const setting = await prisma.setting.findUnique({ where: { key: 'ticket_assign_strategy' } })
  const strategy: AssignStrategy = (setting?.value as any)?.strategy || 'round_robin'

  if (strategy === 'manual') return null

  // Get eligible staff (ADMIN, MANAGER, MEMBER)
  const users = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'MANAGER', 'MEMBER'] } },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  if (users.length === 0) return null

  let assigneeId: string

  if (strategy === 'least_loaded') {
    assigneeId = await leastLoaded(users.map((u) => u.id))
  } else {
    // round_robin (default)
    assigneeId = await roundRobin(users.map((u) => u.id))
  }

  // Get ticket info for notification
  const ticket = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { assigneeId },
    select: {
      id: true, subject: true,
      portalUser: { select: { firstName: true, lastName: true } },
    },
  })

  // Emit ticket assigned event
  eventBus.emit(CRM_EVENTS.TICKET_ASSIGNED, {
    timestamp: new Date().toISOString(),
    ticketId,
    ticket: { subject: ticket.subject, priority: '', status: '' },
    contactName: `${ticket.portalUser.firstName} ${ticket.portalUser.lastName}`,
    assigneeId,
  }).catch(() => {})

  return assigneeId
}

async function roundRobin(userIds: string[]): Promise<string> {
  // Find the last assigned ticket to determine next user
  const lastAssigned = await prisma.supportTicket.findFirst({
    where: { assigneeId: { not: null } },
    orderBy: { createdAt: 'desc' },
    select: { assigneeId: true },
  })

  if (!lastAssigned?.assigneeId) return userIds[0]

  const lastIndex = userIds.indexOf(lastAssigned.assigneeId)
  const nextIndex = (lastIndex + 1) % userIds.length
  return userIds[nextIndex]
}

async function leastLoaded(userIds: string[]): Promise<string> {
  // Count open tickets per user
  const counts = await Promise.all(
    userIds.map(async (userId) => ({
      userId,
      count: await prisma.supportTicket.count({
        where: {
          assigneeId: userId,
          status: { in: ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER'] },
        },
      }),
    }))
  )

  counts.sort((a, b) => a.count - b.count)
  return counts[0].userId
}
