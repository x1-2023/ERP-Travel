import { Button, Heading, Text, Section } from '@react-email/components'
import * as React from 'react'
import { NotificationLayout } from './notification-layout'

export interface NotificationOrderStatusProps {
  userName: string
  orderNumber: string
  statusLabel: string
  viewUrl: string
  unsubscribeUrl?: string
  settingsUrl?: string
}

export function NotificationOrderStatusEmail({
  userName,
  orderNumber,
  statusLabel,
  viewUrl,
  unsubscribeUrl,
  settingsUrl,
}: NotificationOrderStatusProps) {
  return (
    <NotificationLayout
      preview={`Đơn hàng ${orderNumber}: ${statusLabel}`}
      unsubscribeUrl={unsubscribeUrl}
      settingsUrl={settingsUrl}
    >
      <Heading style={heading}>Cập nhật đơn hàng</Heading>
      <Text style={text}>Xin chào {userName},</Text>
      <Text style={text}>
        Đơn hàng <strong>{orderNumber}</strong> đã chuyển sang trạng thái{' '}
        <strong>{statusLabel}</strong>.
      </Text>
      <Button style={button} href={viewUrl}>
        Xem đơn hàng
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

export default NotificationOrderStatusEmail
