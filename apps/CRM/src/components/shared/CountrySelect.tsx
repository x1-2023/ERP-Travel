'use client'

import { useState, useMemo } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { COUNTRIES } from '@/lib/constants'
import { useTranslation } from '@/i18n'

interface CountrySelectProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function CountrySelect({ value, onChange, placeholder, disabled }: CountrySelectProps) {
  const { locale } = useTranslation()
  const lang = locale === 'vi' ? 'vi' : 'en'

  return (
    <Select value={value} onValueChange={(v) => onChange(v === '__none__' ? '' : v)} disabled={disabled}>
      <SelectTrigger className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)]">
        <SelectValue placeholder={placeholder || 'Select country...'} />
      </SelectTrigger>
      <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)] max-h-60">
        <SelectItem value="__none__" className="text-[var(--crm-text-secondary)]">
          —
        </SelectItem>
        {COUNTRIES.map((c) => (
          <SelectItem key={c.code} value={c.code} className="text-[var(--crm-text-primary)]">
            {c.name[lang]} ({c.code})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
