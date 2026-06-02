import { describe, it, expect } from 'vitest'
import crypto from 'crypto'
import { generateSignature } from '../delivery'

describe('Webhook Delivery', () => {
  describe('generateSignature()', () => {
    it('generates a valid HMAC-SHA256 hex string', () => {
      const sig = generateSignature('test payload', 'secret123')
      expect(sig).toMatch(/^[0-9a-f]{64}$/)
    })

    it('is deterministic — same input produces same output', () => {
      const sig1 = generateSignature('hello', 'key')
      const sig2 = generateSignature('hello', 'key')
      expect(sig1).toBe(sig2)
    })

    it('changes when payload changes', () => {
      const sig1 = generateSignature('payload_a', 'secret')
      const sig2 = generateSignature('payload_b', 'secret')
      expect(sig1).not.toBe(sig2)
    })

    it('changes when secret changes', () => {
      const sig1 = generateSignature('same payload', 'secret_a')
      const sig2 = generateSignature('same payload', 'secret_b')
      expect(sig1).not.toBe(sig2)
    })

    it('matches Node.js crypto HMAC directly', () => {
      const payload = JSON.stringify({ event: 'test', data: { id: 1 } })
      const secret = 'webhook-secret-key'

      const expected = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex')

      expect(generateSignature(payload, secret)).toBe(expected)
    })

    it('handles empty payload', () => {
      const sig = generateSignature('', 'secret')
      expect(sig).toMatch(/^[0-9a-f]{64}$/)
    })

    it('handles unicode payload', () => {
      const sig = generateSignature('Báo giá #123 được chấp nhận', 'secret')
      expect(sig).toMatch(/^[0-9a-f]{64}$/)
    })

    it('handles JSON payload like real webhook calls', () => {
      const body = JSON.stringify({
        event: 'quote.accepted',
        data: { quoteId: 'abc', contactName: 'Nguyễn Văn A' },
        deliveryId: 'delivery-123',
      })
      const sig = generateSignature(body, 'whsec_test123')
      expect(sig).toMatch(/^[0-9a-f]{64}$/)
      // Verify it's consistent
      expect(generateSignature(body, 'whsec_test123')).toBe(sig)
    })
  })
})
