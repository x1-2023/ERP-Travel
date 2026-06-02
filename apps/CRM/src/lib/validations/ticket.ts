import { z } from 'zod'

// ── Staff Ticket Queries ─────────────────────────────────────────────

export const ticketQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  q: z.string().max(200).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assigneeId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
})

// ── Staff Ticket Update ──────────────────────────────────────────────

export const updateTicketSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assigneeId: z.string().nullable().optional(),
  category: z.string().max(100).nullable().optional(),
})

// ── Staff Ticket Message ─────────────────────────────────────────────

export const staffTicketMessageSchema = z.object({
  content: z.string().min(1).max(5000),
  isInternal: z.boolean().default(false),
})

// ── Status Machine — valid transitions ───────────────────────────────

export const VALID_TRANSITIONS: Record<string, string[]> = {
  OPEN: ['IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED'],
  IN_PROGRESS: ['WAITING_CUSTOMER', 'RESOLVED', 'CLOSED'],
  WAITING_CUSTOMER: ['IN_PROGRESS', 'RESOLVED', 'CLOSED'],
  RESOLVED: ['OPEN', 'CLOSED'],
  CLOSED: ['OPEN'],
}

export function isValidTransition(from: string, to: string): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false
}

export type TicketQueryInput = z.infer<typeof ticketQuerySchema>
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>
export type StaffTicketMessageInput = z.infer<typeof staffTicketMessageSchema>
