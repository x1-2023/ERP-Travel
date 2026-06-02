'use client'

import { useState, useEffect } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { formatShortCurrency, formatCurrency } from '@/lib/constants'
import { useTranslation } from '@/i18n'
import type { DealsOverTimeItem } from '@/types'

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const item = payload[0]?.payload as DealsOverTimeItem
  return (
    <div className="rounded-lg border border-[var(--crm-border)] bg-[var(--crm-bg-card)]/95 backdrop-blur-xl px-3 py-2 shadow-xl">
      <p className="text-sm font-medium text-[var(--crm-text-primary)]">{label}</p>
      <p className="text-xs text-[var(--crm-accent-text)]">Won: {item.won} &middot; {formatShortCurrency(item.revenue)}</p>
      <p className="text-xs text-red-400">Lost: {item.lost}</p>
    </div>
  )
}

export function DealsOverTimeChart({ data }: { data: DealsOverTimeItem[] }) {
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (data.length === 0) {
    return (
      <div className="glass-card-static p-3">
        <h3 className="text-sm font-medium text-[var(--crm-text-secondary)] mb-4">
          {t('analytics.dealsOverTime' as any)}
        </h3>
        <div className="h-[280px] flex items-center justify-center">
          <p className="text-sm text-[var(--crm-text-muted)]">{t('common.noData' as any)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card-static p-3">
      <h3 className="text-sm font-medium text-[var(--crm-text-secondary)] mb-4">
        {t('analytics.dealsOverTime' as any)}
      </h3>
      <div className="h-[280px]">
        {!mounted ? null : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="wonGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="lostGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--crm-border-subtle)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'var(--crm-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--crm-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--crm-border-subtle)' }} />
              <Area type="monotone" dataKey="won" stroke="#10B981" strokeWidth={2} fill="url(#wonGradient)" dot={{ fill: '#10B981', strokeWidth: 0, r: 3 }} />
              <Area type="monotone" dataKey="lost" stroke="#EF4444" strokeWidth={2} fill="url(#lostGradient)" dot={{ fill: '#EF4444', strokeWidth: 0, r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
