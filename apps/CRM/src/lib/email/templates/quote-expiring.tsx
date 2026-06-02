import { Button, Heading, Text, Section } from '@react-email/components'
import * as React from 'react'
import { BaseLayout } from './base-layout'

export interface QuoteExpiringEmailProps {
  customerName: string
  quoteNumber: string
  validUntil: string
  daysLeft: number
  viewUrl: string
}

export function QuoteExpiringEmail({
  customerName,
  quoteNumber,
  validUntil,
  daysLeft,
  viewUrl,
}: QuoteExpiringEmailProps) {
  return (
    <BaseLayout
      preview={`Báo giá ${quoteNumber} sắp hết hạn — còn ${daysLeft} ngày`}
    >
      <Heading style={heading}>Báo giá sắp hết hạn</Heading>
      <Text style={text}>Kính gửi {customerName},</Text>
      <Text style={text}>
        Báo giá <strong>{quoteNumber}</strong> của bạn sắp hết hiệu lực.
      </Text>

      <Section style={alertBox}>
        <Text style={alertText}>
          Còn <strong>{daysLeft} ngày</strong> trước khi hết hiệu lực (
          {validUntil})
        </Text>
      </Section>

      <Text style={text}>
        Vui lòng xem xét và phản hồi trước thời hạn để chúng tôi có thể hỗ trợ
        bạn tốt nhất.
      </Text>

      <Button style={button} href={viewUrl}>
        Xem báo giá
      </Button>

      <Text style={subtext}>
        Nếu bạn cần gia hạn hoặc có thắc mắc, đừng ngần ngại liên hệ với chúng
        tôi.
      </Text>
    </BaseLayout>
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
  margin: '8px 0 16px',
}

const subtext: React.CSSProperties = {
  color: '#6B7280',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '16px 0 0',
}

export default QuoteExpiringEmail
