'use client'

import { DEAL_CONTACT_ROLES } from '@/lib/constants'
import { useTranslation } from '@/i18n'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DealContactRoleSelectProps {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  compact?: boolean
}

export function DealContactRoleSelect({ value, onValueChange, disabled, compact }: DealContactRoleSelectProps) {
  const { t } = useTranslation()

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={`bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] ${compact ? 'h-7 text-xs' : ''}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
        {DEAL_CONTACT_ROLES.map((role) => (
          <SelectItem
            key={role.value}
            value={role.value}
            className="text-[var(--crm-text-primary)] focus:bg-[var(--crm-bg-subtle)] focus:text-[var(--crm-text-primary)]"
          >
            <span className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: role.color }}
              />
              <span className={compact ? 'text-xs' : ''}>{t(role.labelKey)}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
