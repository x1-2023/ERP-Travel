'use client'

import { useState, useEffect } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatShortCurrency, formatCurrency } from '@/lib/constants'
import { useTranslation } from '@/i18n'
import type { RevenueData } from '@/types'

interface RevenueChartProps {
  data: RevenueData[]
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload as RevenueData
  return (
    <div className="rounded-lg border border-[var(--crm-border)] bg-[#1a1f2e]/95 backdrop-blur-xl px-3 py-2 shadow-xl">
      <p className="text-sm font-medium text-[var(--crm-text-primary)]">{label}</p>
      <p className="text-xs text-[var(--crm-accent-text)]">
        {formatCurrency(item.revenue)}
      </p>
      <p className="text-xs text-[var(--crm-text-muted)]">{item.deals} deals</p>
    </div>
  )
}

export function RevenueChart({ data }: RevenueChartProps) {
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div className="chart-container">
      <h3 className="text-sm font-medium text-[var(--crm-text-secondary)] mb-4">{t('dashboard.revenue6Months')}</h3>
      <div className="h-[280px]">
        {!mounted ? null : <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 4, right: 12, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--crm-border-subtle)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fill: 'var(--crm-text-muted)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--crm-text-muted)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatShortCurrency(v)}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: 'var(--crm-border-subtle)' }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              dot={{ fill: '#10B981', strokeWidth: 0, r: 3 }}
              activeDot={{ fill: '#10B981', strokeWidth: 2, stroke: 'var(--crm-bg-page)', r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>}
      </div>
    </div>
  )
}
