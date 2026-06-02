// ── CRM Event Constants ───────────────────────────────────────────

export const CRM_EVENTS = {
  // Contact
  CONTACT_CREATED: 'contact.created',
  CONTACT_UPDATED: 'contact.updated',
  CONTACT_DELETED: 'contact.deleted',

  // Deal
  DEAL_CREATED: 'deal.created',
  DEAL_UPDATED: 'deal.updated',
  DEAL_STAGE_CHANGED: 'deal.stage_changed',
  DEAL_WON: 'deal.won',
  DEAL_LOST: 'deal.lost',

  // Quote
  QUOTE_CREATED: 'quote.created',
  QUOTE_SENT: 'quote.sent',
  QUOTE_ACCEPTED: 'quote.accepted',
  QUOTE_REJECTED: 'quote.rejected',
  QUOTE_EXPIRING: 'quote.expiring',

  // Order
  ORDER_CREATED: 'order.created',
  ORDER_STATUS_CHANGED: 'order.status_changed',
  ORDER_CANCELLED: 'order.cancelled',
  ORDER_REFUNDED: 'order.refunded',

  // Ticket
  TICKET_CREATED: 'ticket.created',
  TICKET_ASSIGNED: 'ticket.assigned',
  TICKET_REPLIED: 'ticket.replied',
  TICKET_STAFF_REPLIED: 'ticket.staff_replied',
  TICKET_RESOLVED: 'ticket.resolved',

  // Campaign
  CAMPAIGN_SENT: 'campaign.sent',

  // User
  USER_CREATED: 'user.created',

  // Document
  DOCUMENT_UPLOADED: 'document.uploaded',
  DOCUMENT_DELETED: 'document.deleted',

  // Compliance
  COMPLIANCE_FLAG_RAISED: 'compliance.flag_raised',

  // Partner / Commission
  DEAL_REGISTRATION_CREATED: 'deal_registration.created',
  DEAL_REGISTRATION_APPROVED: 'deal_registration.approved',
  COMMISSION_CREATED: 'commission.created',
} as const

export type CrmEventName = (typeof CRM_EVENTS)[keyof typeof CRM_EVENTS]

// ── Typed Payloads ────────────────────────────────────────────────

export interface BaseEventPayload {
  timestamp: string
  userId?: string
}

export interface ContactEventPayload extends BaseEventPayload {
  contactId: string
  contact: { firstName: string; lastName: string; email?: string }
}

export interface DealEventPayload extends BaseEventPayload {
  dealId: string
  deal: { title: string; value: number }
}

export interface DealStageEventPayload extends DealEventPayload {
  fromStage: string
  toStage: string
  isWon: boolean
  isLost: boolean
}

export interface QuoteEventPayload extends BaseEventPayload {
  quoteId: string
  quote: { quoteNumber: string; total?: number; contactName?: string }
  ownerId: string
}

export interface QuoteExpiringPayload extends BaseEventPayload {
  quoteId: string
  quote: { quoteNumber: string }
  ownerId: string
  days: number
}

export interface OrderEventPayload extends BaseEventPayload {
  orderId: string
  order: { orderNumber: string; total?: number; status: string }
  ownerId: string
}

export interface OrderStatusEventPayload extends OrderEventPayload {
  fromStatus: string
  toStatus: string
  statusLabel: string
}

export interface TicketEventPayload extends BaseEventPayload {
  ticketId: string
  ticket: { subject: string; priority: string; status: string }
  contactName: string
  assigneeId?: string | null
}

export interface TicketStaffRepliedPayload extends BaseEventPayload {
  ticketId: string
  ticket: { subject: string }
  staffName: string
}

export interface CampaignEventPayload extends BaseEventPayload {
  campaignId: string
  campaign: { name: string }
  sentCount: number
  createdById: string
}
