import { Button, Heading, Text, Section } from '@react-email/components'
import * as React from 'react'
import { NotificationLayout } from './notification-layout'

export interface NotificationTicketNewProps {
  userName: string
  subject: string
  contactName: string
  priority: string
  viewUrl: string
  unsubscribeUrl?: string
  settingsUrl?: string
}

export function NotificationTicketNewEmail({
  userName,
  subject,
  contactName,
  priority,
  viewUrl,
  unsubscribeUrl,
  settingsUrl,
}: NotificationTicketNewProps) {
  return (
    <NotificationLayout
      preview={`Yêu cầu hỗ trợ mới: ${subject}`}
      unsubscribeUrl={unsubscribeUrl}
      settingsUrl={settingsUrl}
    >
      <Heading style={heading}>Yêu cầu hỗ trợ mới</Heading>
      <Text style={text}>Xin chào {userName},</Text>
      <Text style={text}>
        <strong>{contactName}</strong> đã tạo yêu cầu hỗ trợ mới.
      </Text>
      <Section style={infoBox}>
        <Text style={infoText}>
          <strong>Tiêu đề:</strong> {subject}
        </Text>
        {priority && (
          <Text style={infoText}>
            <strong>Độ ưu tiên:</strong> {priority}
          </Text>
        )}
      </Section>
      <Button style={button} href={viewUrl}>
        Xem ticket
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

const infoBox: React.CSSProperties = {
  backgroundColor: '#F3F4F6',
  borderRadius: '6px',
  padding: '12px 16px',
  margin: '16px 0',
}

const infoText: React.CSSProperties = {
  color: '#374151',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0 0 4px',
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

export default NotificationTicketNewEmail
