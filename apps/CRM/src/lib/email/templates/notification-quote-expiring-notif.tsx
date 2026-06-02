import { Button, Heading, Text, Section } from '@react-email/components'
import * as React from 'react'
import { NotificationLayout } from './notification-layout'

export interface NotificationQuoteExpiringNotifProps {
  userName: string
  quoteNumber: string
  days: number
  viewUrl: string
  unsubscribeUrl?: string
  settingsUrl?: string
}

export function NotificationQuoteExpiringNotifEmail({
  userName,
  quoteNumber,
  days,
  viewUrl,
  unsubscribeUrl,
  settingsUrl,
}: NotificationQuoteExpiringNotifProps) {
  return (
    <NotificationLayout
      preview={`Báo giá ${quoteNumber} sắp hết hạn — còn ${days} ngày`}
      unsubscribeUrl={unsubscribeUrl}
      settingsUrl={settingsUrl}
    >
      <Heading style={heading}>Báo giá sắp hết hạn</Heading>
      <Text style={text}>Xin chào {userName},</Text>
      <Text style={text}>
        Báo giá <strong>{quoteNumber}</strong> sẽ hết hạn trong{' '}
        <strong>{days} ngày</strong>.
      </Text>
      <Section style={alertBox}>
        <Text style={alertText}>
          Hãy liên hệ khách hàng trước thời hạn để đảm bảo không bỏ lỡ cơ hội.
        </Text>
      </Section>
      <Button style={button} href={viewUrl}>
        Xem báo giá
      </Button>
    </NotificationLayout>
  )
}

const heading: React.CSSProperties = {
  color: '#1F2937',
  fontSize: '22px',
  fontWeight: 700,
  lineHeight: '28px',
  margin: '0 0 16px',
}

const text: React.CSSProperties = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0 0 12px',
}

const alertBox: React.CSSProperties = {
  backgroundColor: '#FEF3C7',
  borderRadius: '6px',
  border: '1px solid #FDE68A',
  padding: '12px 16px',
  margin: '16px 0',
}

const alertText: React.CSSProperties = {
  color: '#92400E',
  fontSize: '13px',
  lineHeight: '20px',
  margin: 0,
}

const button: React.CSSProperties = {
  backgroundColor: '#2563EB',
  borderRadius: '6px',
  color: '#FFFFFF',
  display: 'inline-block',
  fontSize: '14px',
  fontWeight: 600,
  lineHeight: '1',
  padding: '12px 24px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  margin: '8px 0 0',
}

export default NotificationQuoteExpiringNotifEmail
