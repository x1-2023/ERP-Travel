'use client'

import { formatCurrency, getCurrencyInfo } from '@/lib/constants'

interface CurrencyDisplayProps {
  value: number
  currency?: string
  className?: string
  showCode?: boolean
}

export function CurrencyDisplay({ value, currency = 'VND', className, showCode }: CurrencyDisplayProps) {
  const info = getCurrencyInfo(currency)
  const formatted = formatCurrency(value, currency)

  return (
    <span className={className} title={`${info.flag} ${info.name}`}>
      {formatted}
      {showCode && currency !== 'VND' && (
        <span className="ml-1 text-xs text-[var(--crm-text-muted)]">{currency}</span>
      )}
    </span>
  )
}
