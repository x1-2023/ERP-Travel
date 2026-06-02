'use client'

import { Package, Wrench, Shield } from 'lucide-react'
import { formatCurrency } from '@/lib/constants'
import { useTranslation } from '@/i18n'
import type { Bundle } from '@/hooks/use-bundles'

interface BundleCardProps {
  bundle: Bundle
  onClick?: () => void
}

const TYPE_ICONS = {
  PACKAGE: Package,
  KIT: Wrench,
  SERVICE_PLAN: Shield,
}

const TYPE_COLORS = {
  PACKAGE: 'bg-blue-500/20 text-blue-400',
  KIT: 'bg-purple-500/20 text-purple-400',
  SERVICE_PLAN: 'bg-emerald-500/20 text-emerald-400',
}

export function BundleCard({ bundle, onClick }: BundleCardProps) {
  const { t } = useTranslation()
  const Icon = TYPE_ICONS[bundle.bundleType as keyof typeof TYPE_ICONS] || Package
  const colorCls = TYPE_COLORS[bundle.bundleType as keyof typeof TYPE_COLORS] || TYPE_COLORS.PACKAGE

  return (
    <div
      onClick={onClick}
      className="glass-card-static p-4 cursor-pointer hover:ring-1 hover:ring-[#10B981]/50 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-md ${colorCls}`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colorCls}`}>
            {t(`bundles.type.${bundle.bundleType}`)}
          </span>
        </div>
        {!bundle.isActive && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400">
            {t('common.inactive')}
          </span>
        )}
      </div>

      <h3 className="text-sm font-semibold text-[var(--crm-text-primary)] mb-1 line-clamp-1">
        {bundle.name}
      </h3>

      <p className="text-xs text-[var(--crm-text-muted)] mb-3">
        {bundle.items.length} {t('bundles.items').toLowerCase()} &middot; {bundle.sku}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-[#10B981]">
          {formatCurrency(bundle.basePrice, bundle.currency)}
        </span>
        <span className="text-[10px] text-[var(--crm-text-muted)]">
          {bundle.items.filter((i) => i.isRequired).length} {t('bundles.required').toLowerCase()}
        </span>
      </div>
    </div>
  )
}
