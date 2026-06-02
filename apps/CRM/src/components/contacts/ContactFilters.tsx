'use client'

import { X } from 'lucide-react'
import { useTranslation } from '@/i18n'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CONTACT_STATUSES, LEAD_SOURCES } from '@/lib/constants'
import { useCompanies } from '@/hooks/use-companies'

interface Filters {
  status?: string
  companyId?: string
  source?: string
}

interface ContactFiltersProps {
  filters: Filters
  onFilterChange: (filters: Filters) => void
}

export function ContactFilters({ filters, onFilterChange }: ContactFiltersProps) {
  const { t } = useTranslation()
  const { data: companiesData } = useCompanies({ limit: 100 })
  const companies = companiesData?.data ?? []

  const activeFilters: { key: keyof Filters; label: string }[] = []

  if (filters.status) {
    const s = CONTACT_STATUSES.find((s) => s.value === filters.status)
    activeFilters.push({ key: 'status', label: `${t('common.status')}: ${s ? t(s.labelKey) : filters.status}` })
  }
  if (filters.companyId) {
    const c = companies.find((c) => c.id === filters.companyId)
    activeFilters.push({ key: 'companyId', label: `${t('contacts.company')}: ${c?.name ?? filters.companyId}` })
  }
  if (filters.source) {
    const src = LEAD_SOURCES.find((s) => s.value === filters.source)
    activeFilters.push({ key: 'source', label: `${t('contacts.source')}: ${src ? t(src.labelKey) : filters.source}` })
  }

  function removeFilter(key: keyof Filters) {
    onFilterChange({ ...filters, [key]: undefined })
  }

  return (
    <div className="space-y-3">
      {/* Filter dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.status ?? ''}
          onValueChange={(val) =>
            onFilterChange({ ...filters, status: val || undefined })
          }
        >
          <SelectTrigger className="h-8 w-[160px] input-premium bg-[var(--crm-bg-card)] border-[var(--crm-border)] text-sm text-[var(--crm-text-secondary)]">
            <SelectValue placeholder={t('common.status')} />
          </SelectTrigger>
          <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
            <SelectItem value="__all__" className="text-[var(--crm-text-secondary)]">
              {t('contacts.allStatuses')}
            </SelectItem>
            {CONTACT_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value} className="text-[var(--crm-text-primary)]">
                {t(s.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.companyId ?? ''}
          onValueChange={(val) =>
            onFilterChange({ ...filters, companyId: val || undefined })
          }
        >
          <SelectTrigger className="h-8 w-[180px] input-premium bg-[var(--crm-bg-card)] border-[var(--crm-border)] text-sm text-[var(--crm-text-secondary)]">
            <SelectValue placeholder={t('contacts.company')} />
          </SelectTrigger>
          <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
            <SelectItem value="__all__" className="text-[var(--crm-text-secondary)]">
              {t('contacts.allCompanies')}
            </SelectItem>
            {companies.map((c) => (
              <SelectItem key={c.id} value={c.id} className="text-[var(--crm-text-primary)]">
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.source ?? ''}
          onValueChange={(val) =>
            onFilterChange({ ...filters, source: val || undefined })
          }
        >
          <SelectTrigger className="h-8 w-[160px] input-premium bg-[var(--crm-bg-card)] border-[var(--crm-border)] text-sm text-[var(--crm-text-secondary)]">
            <SelectValue placeholder={t('contacts.source')} />
          </SelectTrigger>
          <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
            <SelectItem value="__all__" className="text-[var(--crm-text-secondary)]">
              {t('contacts.allSources')}
            </SelectItem>
            {LEAD_SOURCES.map((s) => (
              <SelectItem key={s.value} value={s.value} className="text-[var(--crm-text-primary)]">
                {t(s.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active filter badges */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {activeFilters.map(({ key, label }) => (
            <Badge
              key={key}
              variant="secondary"
              className="gap-1 bg-[#10B981]/10 text-[#10B981] border-0 text-xs px-2 py-0.5 hover:bg-[#10B981]/20"
            >
              {label}
              <button
                onClick={() => removeFilter(key)}
                className="ml-0.5 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs text-[var(--crm-text-muted)] hover:text-[var(--crm-text-secondary)]"
            onClick={() => onFilterChange({})}
          >
            {t('common.clearAll')}
          </Button>
        </div>
      )}
    </div>
  )
}
