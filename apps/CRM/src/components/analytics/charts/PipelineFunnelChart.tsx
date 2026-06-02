'use client'

import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { formatShortCurrency } from '@/lib/constants'
import { useTranslation } from '@/i18n'
import type { PipelineFunnelItem } from '@/types'

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload as PipelineFunnelItem
  return (
    <div className="rounded-lg border border-[var(--crm-border)] bg-[var(--crm-bg-card)]/95 backdrop-blur-xl px-3 py-2 shadow-xl">
      <p className="text-sm font-medium text-[var(--crm-text-primary)]">{item.stage}</p>
      <p className="text-xs text-[var(--crm-text-secondary)]">
        {item.count} deals &middot; {formatShortCurrency(item.value)}
      </p>
    </div>
  )
}

export function PipelineFunnelChart({ data }: { data: PipelineFunnelItem[] }) {
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (data.length === 0) {
    return (
      <div className="glass-card-static p-3">
        <h3 className="text-sm font-medium text-[var(--crm-text-secondary)] mb-4">
          {t('analytics.pipelineFunnel' as any)}
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
        {t('analytics.pipelineFunnel' as any)}
      </h3>
      <div className="h-[280px]">
        {!mounted ? null : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--crm-border-subtle)" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'var(--crm-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="stage" width={100} tick={{ fill: 'var(--crm-text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--crm-border-subtle)' }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={28}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
