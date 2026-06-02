import { Button, Heading, Text } from '@react-email/components'
import * as React from 'react'
import { NotificationLayout } from './notification-layout'

export interface NotificationQuoteRejectedProps {
  userName: string
  quoteNumber: string
  contactName: string
  viewUrl: string
  unsubscribeUrl?: string
  settingsUrl?: string
}

export function NotificationQuoteRejectedEmail({
  userName,
  quoteNumber,
  contactName,
  viewUrl,
  unsubscribeUrl,
  settingsUrl,
}: NotificationQuoteRejectedProps) {
  return (
    <NotificationLayout
      preview={`Báo giá ${quoteNumber} bị từ chối`}
      unsubscribeUrl={unsubscribeUrl}
      settingsUrl={settingsUrl}
    >
      <Heading style={heading}>Báo giá bị từ chối</Heading>
      <Text style={text}>Xin chào {userName},</Text>
      <Text style={text}>
        <strong>{contactName}</strong> đã từ chối báo giá{' '}
        <strong>{quoteNumber}</strong>.
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

export default NotificationQuoteRejectedEmail
