export interface NotificationType {
  key: string
  icon: string
  titleTemplate: string
  messageTemplate: string
}

export const NOTIFICATION_TYPES = {
  QUOTE_ACCEPTED: {
    key: 'quote_accepted',
    icon: '✅',
    titleTemplate: 'Báo giá {quoteNumber} được chấp nhận',
    messageTemplate: '{contactName} đã chấp nhận báo giá {quoteNumber}',
  },
  QUOTE_REJECTED: {
    key: 'quote_rejected',
    icon: '❌',
    titleTemplate: 'Báo giá {quoteNumber} bị từ chối',
    messageTemplate: '{contactName} đã từ chối báo giá {quoteNumber}',
  },
  TICKET_NEW: {
    key: 'ticket_new',
    icon: '🎫',
    titleTemplate: 'Yêu cầu hỗ trợ mới: {subject}',
    messageTemplate: '{contactName} đã tạo yêu cầu hỗ trợ mới',
  },
  TICKET_REPLY: {
    key: 'ticket_reply',
    icon: '💬',
    titleTemplate: 'Phản hồi mới: {subject}',
    messageTemplate: '{contactName} đã trả lời yêu cầu hỗ trợ',
  },
  ORDER_STATUS_CHANGED: {
    key: 'order_status_changed',
    icon: '📦',
    titleTemplate: 'Đơn hàng {orderNumber}: {statusLabel}',
    messageTemplate: 'Đơn hàng {orderNumber} đã chuyển sang {statusLabel}',
  },
  QUOTE_EXPIRING: {
    key: 'quote_expiring',
    icon: '⏰',
    titleTemplate: 'Báo giá {quoteNumber} sắp hết hạn',
    messageTemplate: 'Báo giá {quoteNumber} sẽ hết hạn trong {days} ngày',
  },
  CAMPAIGN_SENT: {
    key: 'campaign_sent',
    icon: '📧',
    titleTemplate: 'Chiến dịch "{campaignName}" đã gửi',
    messageTemplate: 'Đã gửi thành công đến {sentCount} người',
  },
} as const

export type NotificationTypeKey = keyof typeof NOTIFICATION_TYPES

/** Replace {var} placeholders in template string */
export function resolveTemplate(
  template: string,
  vars: Record<string, string>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] || `{${key}}`)
}
