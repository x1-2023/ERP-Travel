import { describe, it, expect } from 'vitest'
import {
  ticketQuerySchema,
  updateTicketSchema,
  staffTicketMessageSchema,
  VALID_TRANSITIONS,
  isValidTransition,
} from '../ticket'

describe('Ticket Validations', () => {
  describe('VALID_TRANSITIONS', () => {
    it('defines transitions for all ticket statuses', () => {
      const statuses = ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED']
      for (const s of statuses) {
        expect(VALID_TRANSITIONS).toHaveProperty(s)
      }
    })

    it('CLOSED can only reopen to OPEN', () => {
      expect(VALID_TRANSITIONS.CLOSED).toEqual(['OPEN'])
    })

    it('RESOLVED can go to OPEN or CLOSED', () => {
      expect(VALID_TRANSITIONS.RESOLVED).toContain('OPEN')
      expect(VALID_TRANSITIONS.RESOLVED).toContain('CLOSED')
    })
  })

  describe('isValidTransition()', () => {
    it('allows OPEN → IN_PROGRESS', () => {
      expect(isValidTransition('OPEN', 'IN_PROGRESS')).toBe(true)
    })

    it('allows OPEN → RESOLVED', () => {
      expect(isValidTransition('OPEN', 'RESOLVED')).toBe(true)
    })

    it('allows OPEN → CLOSED', () => {
      expect(isValidTransition('OPEN', 'CLOSED')).toBe(true)
    })

    it('allows IN_PROGRESS → WAITING_CUSTOMER', () => {
      expect(isValidTransition('IN_PROGRESS', 'WAITING_CUSTOMER')).toBe(true)
    })

    it('allows RESOLVED → OPEN (reopen)', () => {
      expect(isValidTransition('RESOLVED', 'OPEN')).toBe(true)
    })

    it('allows CLOSED → OPEN (reopen)', () => {
      expect(isValidTransition('CLOSED', 'OPEN')).toBe(true)
    })

    it('blocks CLOSED → IN_PROGRESS', () => {
      expect(isValidTransition('CLOSED', 'IN_PROGRESS')).toBe(false)
    })

    it('blocks RESOLVED → IN_PROGRESS', () => {
      expect(isValidTransition('RESOLVED', 'IN_PROGRESS')).toBe(false)
    })

    it('blocks self-transition', () => {
      expect(isValidTransition('OPEN', 'OPEN')).toBe(false)
      expect(isValidTransition('CLOSED', 'CLOSED')).toBe(false)
    })

    it('returns false for unknown status', () => {
      expect(isValidTransition('INVALID', 'OPEN')).toBe(false)
    })
  })

  describe('ticketQuerySchema', () => {
    it('accepts valid query params', () => {
      const result = ticketQuerySchema.safeParse({
        page: 1,
        limit: 20,
        q: 'search',
        status: 'OPEN',
        priority: 'HIGH',
      })
      expect(result.success).toBe(true)
    })

    it('applies defaults for page and limit', () => {
      const result = ticketQuerySchema.safeParse({})
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
        expect(result.data.limit).toBe(20)
      }
    })

    it('coerces string numbers', () => {
      const result = ticketQuerySchema.safeParse({ page: '3', limit: '50' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(3)
        expect(result.data.limit).toBe(50)
      }
    })

    it('rejects page < 1', () => {
      const result = ticketQuerySchema.safeParse({ page: 0 })
      expect(result.success).toBe(false)
    })

    it('rejects limit > 100', () => {
      const result = ticketQuerySchema.safeParse({ limit: 200 })
      expect(result.success).toBe(false)
    })

    it('rejects invalid status enum', () => {
      const result = ticketQuerySchema.safeParse({ status: 'INVALID' })
      expect(result.success).toBe(false)
    })

    it('accepts all valid status values', () => {
      for (const status of ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED']) {
        const result = ticketQuerySchema.safeParse({ status })
        expect(result.success).toBe(true)
      }
    })

    it('accepts all valid priority values', () => {
      for (const priority of ['LOW', 'MEDIUM', 'HIGH', 'URGENT']) {
        const result = ticketQuerySchema.safeParse({ priority })
        expect(result.success).toBe(true)
      }
    })

    it('limits q to 200 chars', () => {
      const result = ticketQuerySchema.safeParse({ q: 'x'.repeat(201) })
      expect(result.success).toBe(false)
    })
  })

  describe('updateTicketSchema', () => {
    it('accepts valid update with status', () => {
      const result = updateTicketSchema.safeParse({ status: 'IN_PROGRESS' })
      expect(result.success).toBe(true)
    })

    it('accepts valid update with priority', () => {
      const result = updateTicketSchema.safeParse({ priority: 'URGENT' })
      expect(result.success).toBe(true)
    })

    it('accepts null assigneeId', () => {
      const result = updateTicketSchema.safeParse({ assigneeId: null })
      expect(result.success).toBe(true)
    })

    it('accepts empty object (all optional)', () => {
      const result = updateTicketSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('rejects invalid status', () => {
      const result = updateTicketSchema.safeParse({ status: 'BOGUS' })
      expect(result.success).toBe(false)
    })

    it('accepts category with max 100 chars', () => {
      const result = updateTicketSchema.safeParse({ category: 'Bug Report' })
      expect(result.success).toBe(true)
    })

    it('rejects category over 100 chars', () => {
      const result = updateTicketSchema.safeParse({ category: 'x'.repeat(101) })
      expect(result.success).toBe(false)
    })
  })

  describe('staffTicketMessageSchema', () => {
    it('accepts valid message', () => {
      const result = staffTicketMessageSchema.safeParse({ content: 'Hello' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isInternal).toBe(false) // default
      }
    })

    it('accepts internal note flag', () => {
      const result = staffTicketMessageSchema.safeParse({ content: 'Internal note', isInternal: true })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isInternal).toBe(true)
      }
    })

    it('rejects empty content', () => {
      const result = staffTicketMessageSchema.safeParse({ content: '' })
      expect(result.success).toBe(false)
    })

    it('rejects content over 5000 chars', () => {
      const result = staffTicketMessageSchema.safeParse({ content: 'x'.repeat(5001) })
      expect(result.success).toBe(false)
    })

    it('accepts content at max 5000 chars', () => {
      const result = staffTicketMessageSchema.safeParse({ content: 'x'.repeat(5000) })
      expect(result.success).toBe(true)
    })
  })
})
