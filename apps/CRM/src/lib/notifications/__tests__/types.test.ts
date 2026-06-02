import { describe, it, expect } from 'vitest'
import { NOTIFICATION_TYPES, resolveTemplate } from '../types'
import type { NotificationTypeKey } from '../types'

describe('Notification Types', () => {
  describe('NOTIFICATION_TYPES', () => {
    const allKeys: NotificationTypeKey[] = [
      'QUOTE_ACCEPTED', 'QUOTE_REJECTED', 'TICKET_NEW', 'TICKET_REPLY',
      'ORDER_STATUS_CHANGED', 'QUOTE_EXPIRING', 'CAMPAIGN_SENT',
    ]

    it('has all expected notification type keys', () => {
      for (const key of allKeys) {
        expect(NOTIFICATION_TYPES).toHaveProperty(key)
      }
    })

    it('each type has key, icon, titleTemplate, messageTemplate', () => {
      for (const key of allKeys) {
        const type = NOTIFICATION_TYPES[key]
        expect(type.key).toBeDefined()
        expect(typeof type.key).toBe('string')
        expect(type.icon).toBeDefined()
        expect(type.titleTemplate).toBeDefined()
        expect(type.messageTemplate).toBeDefined()
      }
    })

    it('each type key is unique', () => {
      const keys = allKeys.map((k) => NOTIFICATION_TYPES[k].key)
      const unique = new Set(keys)
      expect(unique.size).toBe(keys.length)
    })
  })

  describe('resolveTemplate()', () => {
    it('replaces single placeholder', () => {
      expect(resolveTemplate('Hello {name}', { name: 'World' })).toBe('Hello World')
    })

    it('replaces multiple placeholders', () => {
      const result = resolveTemplate('{a} and {b}', { a: 'X', b: 'Y' })
      expect(result).toBe('X and Y')
    })

    it('keeps unresolved placeholders intact', () => {
      expect(resolveTemplate('Hello {name}', {})).toBe('Hello {name}')
    })

    it('handles mixed resolved and unresolved', () => {
      expect(resolveTemplate('{a} {b} {c}', { a: '1', c: '3' })).toBe('1 {b} 3')
    })

    it('handles template with no placeholders', () => {
      expect(resolveTemplate('No placeholders here', { x: 'y' })).toBe('No placeholders here')
    })

    it('handles empty vars', () => {
      expect(resolveTemplate('Hello {name}', {})).toBe('Hello {name}')
    })

    it('handles empty template', () => {
      expect(resolveTemplate('', { name: 'test' })).toBe('')
    })

    it('replaces duplicate placeholders', () => {
      expect(resolveTemplate('{x} + {x}', { x: '1' })).toBe('1 + 1')
    })

    it('works with real QUOTE_ACCEPTED template', () => {
      const type = NOTIFICATION_TYPES.QUOTE_ACCEPTED
      const title = resolveTemplate(type.titleTemplate, { quoteNumber: 'QUO-001' })
      expect(title).toBe('Báo giá QUO-001 được chấp nhận')

      const msg = resolveTemplate(type.messageTemplate, {
        contactName: 'Nguyễn Văn A',
        quoteNumber: 'QUO-001',
      })
      expect(msg).toBe('Nguyễn Văn A đã chấp nhận báo giá QUO-001')
    })

    it('works with TICKET_NEW template', () => {
      const type = NOTIFICATION_TYPES.TICKET_NEW
      const title = resolveTemplate(type.titleTemplate, { subject: 'Hỏi về đơn hàng' })
      expect(title).toBe('Yêu cầu hỗ trợ mới: Hỏi về đơn hàng')
    })

    it('works with ORDER_STATUS_CHANGED template', () => {
      const type = NOTIFICATION_TYPES.ORDER_STATUS_CHANGED
      const msg = resolveTemplate(type.messageTemplate, {
        orderNumber: 'ORD-100',
        statusLabel: 'Đã xác nhận',
      })
      expect(msg).toBe('Đơn hàng ORD-100 đã chuyển sang Đã xác nhận')
    })

    it('works with QUOTE_EXPIRING template', () => {
      const type = NOTIFICATION_TYPES.QUOTE_EXPIRING
      const msg = resolveTemplate(type.messageTemplate, {
        quoteNumber: 'QUO-050',
        days: '3',
      })
      expect(msg).toBe('Báo giá QUO-050 sẽ hết hạn trong 3 ngày')
    })

    it('works with CAMPAIGN_SENT template', () => {
      const type = NOTIFICATION_TYPES.CAMPAIGN_SENT
      const title = resolveTemplate(type.titleTemplate, { campaignName: 'Black Friday' })
      expect(title).toBe('Chiến dịch "Black Friday" đã gửi')

      const msg = resolveTemplate(type.messageTemplate, { sentCount: '500' })
      expect(msg).toBe('Đã gửi thành công đến 500 người')
    })
  })
})
