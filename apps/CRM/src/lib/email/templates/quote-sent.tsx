import { Button, Heading, Text, Section } from '@react-email/components'
import * as React from 'react'
import { BaseLayout } from './base-layout'

export interface QuoteSentEmailProps {
  customerName: string
  quoteNumber: string
  totalAmount: string
  validUntil: string
  viewUrl: string
  companyName: string
}

export function QuoteSentEmail({
  customerName,
  quoteNumber,
  totalAmount,
  validUntil,
  viewUrl,
  companyName,
}: QuoteSentEmailProps) {
  return (
    <BaseLayout preview={`Báo giá ${quoteNumber} từ ${companyName}`}>
      <Heading style={heading}>Báo giá từ {companyName}</Heading>
      <Text style={text}>Kính gửi {customerName},</Text>
      <Text style={text}>
        Chúng tôi gửi đến bạn báo giá <strong>{quoteNumber}</strong> từ{' '}
        <strong>{companyName}</strong>.
      </Text>

      <Section style={summaryBox}>
        <table style={summaryTable} cellPadding={0} cellSpacing={0}>
          <tbody>
            <tr>
              <td style={summaryLabel}>Mã báo giá</td>
              <td style={summaryValue}>{quoteNumber}</td>
            </tr>
            <tr>
              <td style={summaryLabel}>Tổng giá trị</td>
              <td style={{ ...summaryValue, color: '#2563EB', fontWeight: 700 }}>
                {totalAmount}
              </td>
            </tr>
            <tr>
              <td style={summaryLabel}>Hiệu lực đến</td>
              <td style={summaryValue}>{validUntil}</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Button style={button} href={viewUrl}>
        Xem báo giá
      </Button>

      <Text style={note}>
        Báo giá có hiệu lực đến ngày <strong>{validUntil}</strong>. Vui lòng
        liên hệ nếu bạn có bất kỳ thắc mắc nào.
      </Text>

      <Text style={subtext}>Trân trọng,</Text>
      <Text style={subtext}>{companyName}</Text>
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

const summaryBox: React.CSSProperties = {
  backgroundColor: '#F9FAFB',
  borderRadius: '6px',
  border: '1px solid #E5E7EB',
  padding: '16px',
  margin: '16px 0',
}

const summaryTable: React.CSSProperties = {
  width: '100%',
}

const summaryLabel: React.CSSProperties = {
  color: '#6B7280',
  fontSize: '13px',
  padding: '4px 0',
}

const summaryValue: React.CSSProperties = {
  color: '#1F2937',
  fontSize: '14px',
  fontWeight: 600,
  padding: '4px 0',
  textAlign: 'right' as const,
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

const note: React.CSSProperties = {
  color: '#6B7280',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '12px 0 0',
  fontStyle: 'italic',
}

const subtext: React.CSSProperties = {
  color: '#6B7280',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '4px 0 0',
}

export default QuoteSentEmail
