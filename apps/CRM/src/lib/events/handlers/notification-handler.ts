import { eventBus } from '../event-bus'
import { CRM_EVENTS } from '../types'
import type {
  QuoteEventPayload,
  QuoteExpiringPayload,
  TicketEventPayload,
  TicketStaffRepliedPayload,
  OrderStatusEventPayload,
  CampaignEventPayload,
} from '../types'
import { notifyUser, notifyRole } from '@/lib/notifications'
import { prisma } from '@/lib/prisma'

/**
 * Check if in-app notification is enabled for a user+event.
 * Default (no preference record): inApp = true
 */
async function isInAppEnabled(userId: string, eventType: string): Promise<boolean> {
  const pref = await prisma.notificationPreference.findUnique({
    where: { userId_eventType: { userId, eventType } },
  })
  // Default: inApp ON
  return pref ? pref.inApp : true
}

/**
 * notifyUser with preference check.
 */
async function notifyUserIfEnabled(
  userId: string,
  eventType: string,
  notifType: Parameters<typeof notifyUser>[1],
  vars: Record<string, string>,
  link?: string
): Promise<void> {
  if (!(await isInAppEnabled(userId, eventType))) return
  await notifyUser(userId, notifType, vars, link)
}

/**
 * notifyRole with preference check per user.
 */
async function notifyRoleIfEnabled(
  role: 'ADMIN' | 'MANAGER',
  eventType: string,
  notifType: Parameters<typeof notifyUser>[1],
  vars: Record<string, string>,
  link?: string
): Promise<void> {
  const users = await prisma.user.findMany({
    where: { role },
    select: { id: true },
  })
  await Promise.all(
    users.map((u) => notifyUserIfEnabled(u.id, eventType, notifType, vars, link))
  )
}

/**
 * Register notification handlers that replicate existing behavior.
 * Each handler maps a CRM event → in-app notification(s).
 * Now respects user preferences: if inApp is false, skip.
 */
export function registerNotificationHandlers(): void {
  // ── Quote accepted → notify owner ──────────────────────────────
  eventBus.on(CRM_EVENTS.QUOTE_ACCEPTED, async (payload) => {
    const p = payload as QuoteEventPayload
    await notifyUserIfEnabled(
      p.ownerId,
      CRM_EVENTS.QUOTE_ACCEPTED,
      'QUOTE_ACCEPTED',
      { quoteNumber: p.quote.quoteNumber, contactName: p.quote.contactName || '' },
      `/quotes/${p.quoteId}`
    )
  })

  // ── Quote rejected → notify owner ─────────────────────────────
  eventBus.on(CRM_EVENTS.QUOTE_REJECTED, async (payload) => {
    const p = payload as QuoteEventPayload
    await notifyUserIfEnabled(
      p.ownerId,
      CRM_EVENTS.QUOTE_REJECTED,
      'QUOTE_REJECTED',
      { quoteNumber: p.quote.quoteNumber, contactName: p.quote.contactName || '' },
      `/quotes/${p.quoteId}`
    )
  })

  // ── Quote expiring → notify owner ─────────────────────────────
  eventBus.on(CRM_EVENTS.QUOTE_EXPIRING, async (payload) => {
    const p = payload as QuoteExpiringPayload
    await notifyUserIfEnabled(
      p.ownerId,
      CRM_EVENTS.QUOTE_EXPIRING,
      'QUOTE_EXPIRING',
      { quoteNumber: p.quote.quoteNumber, days: String(p.days) },
      `/quotes/${p.quoteId}`
    )
  })

  // ── Ticket created → notify MANAGERs ──────────────────────────
  eventBus.on(CRM_EVENTS.TICKET_CREATED, async (payload) => {
    const p = payload as TicketEventPayload
    await notifyRoleIfEnabled(
      'MANAGER',
      CRM_EVENTS.TICKET_CREATED,
      'TICKET_NEW',
      { subject: p.ticket.subject, contactName: p.contactName },
      `/tickets/${p.ticketId}`
    )
  })

  // ── Ticket assigned → notify assignee ─────────────────────────
  eventBus.on(CRM_EVENTS.TICKET_ASSIGNED, async (payload) => {
    const p = payload as TicketEventPayload
    if (!p.assigneeId) return
    await notifyUserIfEnabled(
      p.assigneeId,
      CRM_EVENTS.TICKET_ASSIGNED,
      'TICKET_NEW',
      { subject: p.ticket.subject, contactName: p.contactName },
      `/tickets/${p.ticketId}`
    )
  })

  // ── Ticket replied (customer via portal) → notify assignee or MANAGERs
  eventBus.on(CRM_EVENTS.TICKET_REPLIED, async (payload) => {
    const p = payload as TicketEventPayload
    if (p.assigneeId) {
      await notifyUserIfEnabled(
        p.assigneeId,
        CRM_EVENTS.TICKET_REPLIED,
        'TICKET_REPLY',
        { subject: p.ticket.subject, contactName: p.contactName },
        `/tickets/${p.ticketId}`
      )
    } else {
      await notifyRoleIfEnabled(
        'MANAGER',
        CRM_EVENTS.TICKET_REPLIED,
        'TICKET_REPLY',
        { subject: p.ticket.subject, contactName: p.contactName },
        `/tickets/${p.ticketId}`
      )
    }
  })

  // ── Ticket staff replied → notify MANAGERs for visibility ─────
  eventBus.on(CRM_EVENTS.TICKET_STAFF_REPLIED, async (payload) => {
    const p = payload as TicketStaffRepliedPayload
    await notifyRoleIfEnabled(
      'MANAGER',
      CRM_EVENTS.TICKET_STAFF_REPLIED,
      'TICKET_REPLY',
      { subject: p.ticket.subject, contactName: p.staffName },
      `/tickets/${p.ticketId}`
    )
  })

  // ── Order status changed → notify owner ───────────────────────
  eventBus.on(CRM_EVENTS.ORDER_STATUS_CHANGED, async (payload) => {
    const p = payload as OrderStatusEventPayload
    await notifyUserIfEnabled(
      p.ownerId,
      CRM_EVENTS.ORDER_STATUS_CHANGED,
      'ORDER_STATUS_CHANGED',
      { orderNumber: p.order.orderNumber, statusLabel: p.statusLabel },
      `/orders/${p.orderId}`
    )
  })

  // ── Campaign sent → notify creator ────────────────────────────
  eventBus.on(CRM_EVENTS.CAMPAIGN_SENT, async (payload) => {
    const p = payload as CampaignEventPayload
    await notifyUserIfEnabled(
      p.createdById,
      CRM_EVENTS.CAMPAIGN_SENT,
      'CAMPAIGN_SENT',
      { campaignName: p.campaign.name, sentCount: String(p.sentCount) },
      `/campaigns/${p.campaignId}`
    )
  })
}
