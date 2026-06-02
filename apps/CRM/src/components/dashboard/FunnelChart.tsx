'use client'

import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { formatShortCurrency } from '@/lib/constants'
import { useTranslation } from '@/i18n'
import type { FunnelData } from '@/types'

interface FunnelChartProps {
  data: FunnelData[]
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload as FunnelData
  return (
    <div className="rounded-lg border border-[var(--crm-border)] bg-[#1a1f2e]/95 backdrop-blur-xl px-3 py-2 shadow-xl">
      <p className="text-sm font-medium text-[var(--crm-text-primary)]">{item.stage}</p>
      <p className="text-xs text-[var(--crm-text-secondary)]">
        {item.count} deals &middot; {formatShortCurrency(item.value)}
      </p>
    </div>
  )
}

export function FunnelChart({ data }: FunnelChartProps) {
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div className="chart-container">
      <h3 className="text-sm font-medium text-[var(--crm-text-secondary)] mb-4">{t('dashboard.pipelineByStage')}</h3>
      <div className="h-[280px]">
        {!mounted ? null : <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 12, bottom: 0, left: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--crm-border-subtle)"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fill: 'var(--crm-text-muted)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="stage"
              width={100}
              tick={{ fill: 'var(--crm-text-secondary)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'var(--crm-border-subtle)' }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={28}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>}
      </div>
    </div>
  )
}
