'use client'

import { useState, useCallback, useMemo } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { useTranslation } from '@/i18n'
import type { DateRange } from '@/hooks/use-analytics'

interface DateRangeSelectorProps {
  value: DateRange
  onChange: (range: DateRange) => void
}

type PresetKey = '7d' | '30d' | '90d' | 'year' | 'custom'

function getPresetRange(key: PresetKey): DateRange | null {
  const now = new Date()
  const to = now.toISOString()
  switch (key) {
    case '7d':
      return { from: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString(), to }
    case '30d':
      return { from: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30).toISOString(), to }
    case '90d':
      return { from: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90).toISOString(), to }
    case 'year':
      return { from: new Date(now.getFullYear(), 0, 1).toISOString(), to }
    case 'custom':
      return null
  }
}

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [customFrom, setCustomFrom] = useState(value.from.slice(0, 10))
  const [customTo, setCustomTo] = useState(value.to.slice(0, 10))

  const activePreset = useMemo((): PresetKey => {
    const now = new Date()
    const from = new Date(value.from)
    const diffDays = Math.round((now.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays <= 8) return '7d'
    if (diffDays <= 31) return '30d'
    if (diffDays <= 91) return '90d'
    if (from.getMonth() === 0 && from.getDate() <= 2) return 'year'
    return 'custom'
  }, [value.from])

  const handlePreset = useCallback(
    (key: PresetKey) => {
      const range = getPresetRange(key)
      if (range) {
        onChange(range)
        setOpen(false)
      } else {
        setOpen(true)
      }
    },
    [onChange]
  )

  const handleCustomApply = useCallback(() => {
    onChange({
      from: new Date(customFrom).toISOString(),
      to: new Date(customTo + 'T23:59:59').toISOString(),
    })
    setOpen(false)
  }, [customFrom, customTo, onChange])

  const presets: Array<{ key: PresetKey; label: string }> = [
    { key: '7d', label: t('analytics.last7Days' as any) },
    { key: '30d', label: t('analytics.last30Days' as any) },
    { key: '90d', label: t('analytics.last90Days' as any) },
    { key: 'year', label: t('analytics.thisYear' as any) },
  ]

  return (
    <div className="relative">
      <div className="flex items-center gap-1">
        {presets.map((p) => (
          <button
            key={p.key}
            onClick={() => handlePreset(p.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activePreset === p.key
                ? 'bg-[var(--crm-accent-bg)] text-[var(--crm-accent-text)] ring-1 ring-[var(--crm-accent-ring)]'
                : 'text-[var(--crm-text-secondary)] hover:bg-[var(--crm-bg-subtle)]'
            }`}
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            activePreset === 'custom'
              ? 'bg-[var(--crm-accent-bg)] text-[var(--crm-accent-text)] ring-1 ring-[var(--crm-accent-ring)]'
              : 'text-[var(--crm-text-secondary)] hover:bg-[var(--crm-bg-subtle)]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          {t('analytics.custom' as any)}
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 glass-card-static p-4 rounded-xl shadow-xl min-w-[280px]">
          <div className="space-y-3">
            <div>
              <label className="text-xs text-[var(--crm-text-secondary)] mb-1 block">
                {t('analytics.from' as any)}
              </label>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="input-premium w-full text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--crm-text-secondary)] mb-1 block">
                {t('analytics.to' as any)}
              </label>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="input-premium w-full text-sm"
              />
            </div>
            <button
              onClick={handleCustomApply}
              className="w-full py-1.5 text-sm font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              {t('analytics.apply' as any)}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
