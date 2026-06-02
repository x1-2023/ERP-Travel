import { z } from 'zod'

// ── Portal Auth ─────────────────────────────────────────────────────

export const portalLoginSchema = z.object({
  email: z.string().min(1).email(),
})
export type PortalLoginInput = z.infer<typeof portalLoginSchema>

// ── Portal Profile ──────────────────────────────────────────────────

export const portalProfileSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().max(20).optional().nullable(),
})
export type PortalProfileInput = z.infer<typeof portalProfileSchema>

// ── Portal Ticket ───────────────────────────────────────────────────

export const portalCreateTicketSchema = z.object({
  subject: z.string().min(1).max(255),
  content: z.string().min(1).max(5000),
  category: z.string().max(100).optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
})
export type PortalCreateTicketInput = z.infer<typeof portalCreateTicketSchema>

export const portalTicketMessageSchema = z.object({
  content: z.string().min(1).max(5000),
})
export type PortalTicketMessageInput = z.infer<typeof portalTicketMessageSchema>

// ── Portal Quote action ─────────────────────────────────────────────

export const portalQuoteActionSchema = z.object({
  quoteId: z.string().min(1),
  action: z.enum(['ACCEPTED', 'REJECTED']),
})
export type PortalQuoteActionInput = z.infer<typeof portalQuoteActionSchema>
