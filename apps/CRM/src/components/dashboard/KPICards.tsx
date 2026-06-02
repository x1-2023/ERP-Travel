'use client'

import { TrendingUp, TrendingDown, DollarSign, Trophy, Target, Zap } from 'lucide-react'
import { formatCurrency, formatShortCurrency, formatNumber } from '@/lib/constants'
import { useTranslation } from '@/i18n'
import type { DashboardStats } from '@/types'

interface KPICardsProps {
  stats: DashboardStats
}

export function KPICards({ stats }: KPICardsProps) {
  const { t } = useTranslation()
  const cards = [
    {
      label: t('dashboard.activeDeals'),
      value: formatNumber(stats.activeDeals),
      change: stats.activeDealsChange,
      icon: Zap,
      iconColor: 'text-[var(--crm-accent-text)]',
      iconBg: 'bg-[var(--crm-accent-bg)]',
    },
    {
      label: t('dashboard.pipelineValue'),
      value: formatShortCurrency(stats.pipelineValue),
      change: stats.pipelineValueChange,
      icon: DollarSign,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-400/10',
    },
    {
      label: t('dashboard.thisMonth'),
      value: formatNumber(stats.wonThisMonth),
      subtitle: formatCurrency(stats.wonRevenue),
      icon: Trophy,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-400/10',
    },
    {
      label: t('dashboard.conversionRate'),
      value: `${stats.conversionRate.toFixed(1)}%`,
      change: stats.conversionRateChange,
      icon: Target,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-400/10',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => {
        const Icon = card.icon
        const isPositive = card.change !== undefined && card.change >= 0
        const hasChange = card.change !== undefined

        return (
          <div key={card.label} className="kpi-card">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">{card.label}</p>
                <p className="text-3xl font-bold text-white tracking-tight">
                  {card.value}
                </p>
                {card.subtitle && (
                  <p className="text-xs text-[var(--crm-text-muted)]">{card.subtitle}</p>
                )}
                {hasChange && (
                  <div className="flex items-center gap-1">
                    {isPositive ? (
                      <TrendingUp className="w-3.5 h-3.5 text-[var(--crm-accent-text)]" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        isPositive ? 'text-[var(--crm-accent-text)]' : 'text-red-400'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {card.change!.toFixed(1)}%
                    </span>
                    <span className="text-xs text-[var(--crm-text-muted)]">{t('dashboard.vsLastMonth')}</span>
                  </div>
                )}
              </div>
              <div className={`p-2.5 rounded-lg ${card.iconBg} ring-1 ring-[var(--crm-border)]`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
