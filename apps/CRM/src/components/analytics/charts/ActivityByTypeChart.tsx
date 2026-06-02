'use client'

import { useState, useEffect } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useTranslation } from '@/i18n'
import { ACTIVITY_TYPES } from '@/lib/constants'
import type { ActivityByTypeItem } from '@/types'

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="rounded-lg border border-[var(--crm-border)] bg-[var(--crm-bg-card)]/95 backdrop-blur-xl px-3 py-2 shadow-xl">
      <p className="text-sm font-medium text-[var(--crm-text-primary)]">{item.name}</p>
      <p className="text-xs text-[var(--crm-text-secondary)]">{item.value}</p>
    </div>
  )
}

export function ActivityByTypeChart({ data }: { data: ActivityByTypeItem[] }) {
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const chartData = data.map((d) => {
    const typeDef = ACTIVITY_TYPES.find((at) => at.value === d.type)
    return {
      ...d,
      name: typeDef ? t(typeDef.labelKey as any) : d.type,
    }
  })

  if (chartData.length === 0) {
    return (
      <div className="glass-card-static p-3">
        <h3 className="text-sm font-medium text-[var(--crm-text-secondary)] mb-4">
          {t('analytics.activityByType' as any)}
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
        {t('analytics.activityByType' as any)}
      </h3>
      <div className="h-[280px]">
        {!mounted ? null : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="count"
                nameKey="name"
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => (
                  <span className="text-xs text-[var(--crm-text-secondary)]">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
