import { describe, it, expect } from 'vitest'
import { formatRemaining } from '../sla-engine'

describe('SLA Engine — Pure Logic', () => {
  describe('formatRemaining()', () => {
    // ── Positive (time remaining) ────────────────────────

    it('formats minutes remaining', () => {
      expect(formatRemaining(30 * 60_000)).toBe('Còn 30 phút')
    })

    it('formats 0 minutes as remaining', () => {
      expect(formatRemaining(0)).toBe('Còn 0 phút')
    })

    it('formats 59 minutes', () => {
      expect(formatRemaining(59 * 60_000)).toBe('Còn 59 phút')
    })

    it('formats exact 1 hour', () => {
      expect(formatRemaining(60 * 60_000)).toBe('Còn 1 giờ')
    })

    it('formats hours with remaining minutes', () => {
      const ms = (2 * 60 + 30) * 60_000 // 2h30m
      expect(formatRemaining(ms)).toBe('Còn 2 giờ 30p')
    })

    it('formats exact hours (no minutes suffix)', () => {
      expect(formatRemaining(4 * 3600_000)).toBe('Còn 4 giờ')
    })

    it('formats 23 hours', () => {
      expect(formatRemaining(23 * 3600_000)).toBe('Còn 23 giờ')
    })

    it('formats exact 1 day', () => {
      expect(formatRemaining(24 * 3600_000)).toBe('Còn 1 ngày')
    })

    it('formats days with remaining hours', () => {
      const ms = (2 * 24 + 5) * 3600_000 // 2 days 5 hours
      expect(formatRemaining(ms)).toBe('Còn 2 ngày 5h')
    })

    it('formats multiple days exactly', () => {
      expect(formatRemaining(3 * 24 * 3600_000)).toBe('Còn 3 ngày')
    })

    // ── Negative (overdue) ───────────────────────────────

    it('formats overdue minutes', () => {
      expect(formatRemaining(-15 * 60_000)).toBe('Trễ 15 phút')
    })

    it('formats overdue hours', () => {
      expect(formatRemaining(-3 * 3600_000)).toBe('Trễ 3 giờ')
    })

    it('formats overdue hours with minutes', () => {
      const ms = -((1 * 60 + 45) * 60_000) // -1h45m
      expect(formatRemaining(ms)).toBe('Trễ 1 giờ 45p')
    })

    it('formats overdue days', () => {
      expect(formatRemaining(-2 * 24 * 3600_000)).toBe('Trễ 2 ngày')
    })

    it('formats overdue days with hours', () => {
      const ms = -((1 * 24 + 6) * 3600_000) // -1 day 6 hours
      expect(formatRemaining(ms)).toBe('Trễ 1 ngày 6h')
    })

    // ── Edge cases ───────────────────────────────────────

    it('handles very small positive value', () => {
      // 30 seconds → rounds to 0 minutes
      expect(formatRemaining(30_000)).toBe('Còn 0 phút')
    })

    it('handles very small negative value', () => {
      // -30 seconds → Math.floor(-0.5) = -1, abs = 1 → "Trễ 1 phút"
      expect(formatRemaining(-30_000)).toBe('Trễ 1 phút')
    })

    it('handles large values (30 days)', () => {
      const ms = 30 * 24 * 3600_000
      expect(formatRemaining(ms)).toBe('Còn 30 ngày')
    })
  })
})
