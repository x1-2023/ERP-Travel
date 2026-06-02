'use client'

import { SUPPORTED_CURRENCIES } from '@/lib/constants'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CurrencySelectProps {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export function CurrencySelect({ value, onValueChange, disabled, className }: CurrencySelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={`bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] ${className ?? ''}`}>
        <SelectValue placeholder="Currency" />
      </SelectTrigger>
      <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
        {SUPPORTED_CURRENCIES.map((c) => (
          <SelectItem
            key={c.code}
            value={c.code}
            className="text-[var(--crm-text-primary)] focus:bg-[var(--crm-bg-subtle)] focus:text-[var(--crm-text-primary)]"
          >
            <span className="flex items-center gap-2">
              <span>{c.flag}</span>
              <span>{c.code}</span>
              <span className="text-[var(--crm-text-muted)]">({c.symbol})</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
