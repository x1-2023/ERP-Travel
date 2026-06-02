import { Button, Heading, Text, Section } from '@react-email/components'
import * as React from 'react'
import { NotificationLayout } from './notification-layout'

export interface NotificationCampaignSentProps {
  userName: string
  campaignName: string
  sentCount: number
  viewUrl: string
  unsubscribeUrl?: string
  settingsUrl?: string
}

export function NotificationCampaignSentEmail({
  userName,
  campaignName,
  sentCount,
  viewUrl,
  unsubscribeUrl,
  settingsUrl,
}: NotificationCampaignSentProps) {
  return (
    <NotificationLayout
      preview={`Chiến dịch "${campaignName}" đã gửi xong`}
      unsubscribeUrl={unsubscribeUrl}
      settingsUrl={settingsUrl}
    >
      <Heading style={heading}>Chiến dịch đã gửi xong</Heading>
      <Text style={text}>Xin chào {userName},</Text>
      <Text style={text}>
        Chiến dịch &ldquo;<strong>{campaignName}</strong>&rdquo; đã gửi thành công.
      </Text>
      <Section style={statBox}>
        <Text style={statText}>
          Đã gửi đến <strong>{sentCount}</strong> người nhận
        </Text>
      </Section>
      <Button style={button} href={viewUrl}>
        Xem thống kê
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

const statBox: React.CSSProperties = {
  backgroundColor: '#ECFDF5',
  borderRadius: '6px',
  border: '1px solid #A7F3D0',
  padding: '12px 16px',
  margin: '16px 0',
}

const statText: React.CSSProperties = {
  color: '#065F46',
  fontSize: '14px',
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

export default NotificationCampaignSentEmail
