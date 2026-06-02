'use client'

import { TrendingUp, TrendingDown, DollarSign, Zap, Users, Target, FileText, ShoppingCart, BarChart3, Activity, LifeBuoy, AlertTriangle } from 'lucide-react'
import { formatShortCurrency, formatNumber } from '@/lib/constants'
import { useTranslation } from '@/i18n'
import type { AnalyticsKPIs } from '@/types'

interface AnalyticsKPICardsProps {
  kpis: AnalyticsKPIs
}

export function AnalyticsKPICards({ kpis }: AnalyticsKPICardsProps) {
  const { t } = useTranslation()

  const cards = [
    {
      label: t('analytics.totalRevenue' as any),
      value: formatShortCurrency(kpis.totalRevenue),
      change: kpis.totalRevenueChange,
      icon: DollarSign,
      iconColor: 'text-[var(--crm-accent-text)]',
      iconBg: 'bg-[var(--crm-accent-bg)]',
    },
    {
      label: t('analytics.activeDeals' as any),
      value: formatNumber(kpis.activeDeals),
      change: kpis.activeDealsChange,
      icon: Zap,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-400/10',
    },
    {
      label: t('analytics.newContacts' as any),
      value: formatNumber(kpis.newContacts),
      change: kpis.newContactsChange,
      icon: Users,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-400/10',
    },
    {
      label: t('analytics.conversionRate' as any),
      value: `${kpis.conversionRate}%`,
      change: kpis.conversionRateChange,
      icon: Target,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-400/10',
    },
    {
      label: t('analytics.openTickets' as any),
      value: formatNumber(kpis.openTickets ?? 0),
      change: kpis.openTicketsChange ?? 0,
      icon: LifeBuoy,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-400/10',
    },
    {
      label: t('analytics.slaBreached' as any),
      value: formatNumber(kpis.slaBreached ?? 0),
      change: kpis.slaBreachedChange ?? 0,
      icon: AlertTriangle,
      iconColor: 'text-red-400',
      iconBg: 'bg-red-400/10',
      invertColor: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {cards.map((card) => {
        const Icon = card.icon
        const isPositive = card.change >= 0
        // For inverted metrics (like SLA breached), positive change is bad
        const isGood = 'invertColor' in card && card.invertColor ? !isPositive : isPositive
        return (
          <div key={card.label} className="kpi-card">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">
                  {card.label}
                </p>
                <p className="text-3xl font-bold text-[var(--crm-text-primary)] tracking-tight">
                  {card.value}
                </p>
                <div className="flex items-center gap-1">
                  {isPositive ? (
                    <TrendingUp className={`w-3.5 h-3.5 ${isGood ? 'text-[var(--crm-accent-text)]' : 'text-red-400'}`} />
                  ) : (
                    <TrendingDown className={`w-3.5 h-3.5 ${isGood ? 'text-[var(--crm-accent-text)]' : 'text-red-400'}`} />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      isGood ? 'text-[var(--crm-accent-text)]' : 'text-red-400'
                    }`}
                  >
                    {isPositive ? '+' : ''}{card.change.toFixed(1)}%
                  </span>
                  <span className="text-xs text-[var(--crm-text-muted)]">
                    {t('analytics.vsPrevPeriod' as any)}
                  </span>
                </div>
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
