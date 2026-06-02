'use client'

import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useTranslation } from '@/i18n'
import type { CampaignPerformanceItem } from '@/types'

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-[var(--crm-border)] bg-[var(--crm-bg-card)]/95 backdrop-blur-xl px-3 py-2 shadow-xl">
      <p className="text-sm font-medium text-[var(--crm-text-primary)] mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="text-xs" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export function CampaignPerformanceChart({ data }: { data: CampaignPerformanceItem[] }) {
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (data.length === 0) {
    return (
      <div className="glass-card-static p-3">
        <h3 className="text-sm font-medium text-[var(--crm-text-secondary)] mb-4">
          {t('analytics.campaignPerformance' as any)}
        </h3>
        <div className="h-[280px] flex items-center justify-center">
          <p className="text-sm text-[var(--crm-text-muted)]">{t('common.noData' as any)}</p>
        </div>
      </div>
    )
  }

  // Truncate names for display
  const chartData = data.map((c) => ({
    ...c,
    name: c.name.length > 20 ? c.name.slice(0, 18) + '...' : c.name,
  }))

  return (
    <div className="glass-card-static p-3">
      <h3 className="text-sm font-medium text-[var(--crm-text-secondary)] mb-4">
        {t('analytics.campaignPerformance' as any)}
      </h3>
      <div className="h-[280px]">
        {!mounted ? null : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--crm-border-subtle)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: 'var(--crm-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fill: 'var(--crm-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => (
                  <span className="text-xs text-[var(--crm-text-secondary)]">{value}</span>
                )}
              />
              <Bar dataKey="sent" name={t('analytics.sent' as any)} fill="#3B82F6" fillOpacity={0.85} radius={[2, 2, 0, 0]} maxBarSize={20} />
              <Bar dataKey="opened" name={t('analytics.opened' as any)} fill="#10B981" fillOpacity={0.85} radius={[2, 2, 0, 0]} maxBarSize={20} />
              <Bar dataKey="clicked" name={t('analytics.clicked' as any)} fill="#F59E0B" fillOpacity={0.85} radius={[2, 2, 0, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
