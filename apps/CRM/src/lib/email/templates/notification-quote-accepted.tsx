import { Button, Heading, Text } from '@react-email/components'
import * as React from 'react'
import { NotificationLayout } from './notification-layout'

export interface NotificationQuoteAcceptedProps {
  userName: string
  quoteNumber: string
  contactName: string
  total: string
  viewUrl: string
  unsubscribeUrl?: string
  settingsUrl?: string
}

export function NotificationQuoteAcceptedEmail({
  userName,
  quoteNumber,
  contactName,
  total,
  viewUrl,
  unsubscribeUrl,
  settingsUrl,
}: NotificationQuoteAcceptedProps) {
  return (
    <NotificationLayout
      preview={`Báo giá ${quoteNumber} được chấp nhận`}
      unsubscribeUrl={unsubscribeUrl}
      settingsUrl={settingsUrl}
    >
      <Heading style={heading}>Báo giá được chấp nhận</Heading>
      <Text style={text}>Xin chào {userName},</Text>
      <Text style={text}>
        <strong>{contactName}</strong> đã chấp nhận báo giá{' '}
        <strong>{quoteNumber}</strong>
        {total ? ` trị giá ${total}` : ''}.
      </Text>
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

const button: React.CSSProperties = {
  backgroundColor: '#10B981',
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

export default NotificationQuoteAcceptedEmail
