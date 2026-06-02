'use client'

import { useParams } from 'next/navigation'
import { Edit2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PageShell } from '@/components/layout/PageShell'
import { BundleBuilder } from '@/components/bundles/BundleBuilder'
import { CompatibilityWarning } from '@/components/bundles/CompatibilityWarning'
import { useBundle } from '@/hooks/use-bundles'
import { formatCurrency, BUNDLE_TYPES, CUSTOMER_TIERS } from '@/lib/constants'
import { useTranslation } from '@/i18n'

export default function BundleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const { data: bundle, isLoading } = useBundle(id)
  const [editMode, setEditMode] = useState(false)

  if (isLoading) {
    return (
      <PageShell title={t('bundles.title')} >
        <div className="text-center text-[var(--crm-text-muted)] py-8">{t('common.loading')}</div>
      </PageShell>
    )
  }

  if (!bundle) {
    return (
      <PageShell title={t('bundles.title')} >
        <div className="text-center text-[var(--crm-text-muted)] py-8">Bundle not found</div>
      </PageShell>
    )
  }

  if (editMode) {
    return (
      <PageShell title={`${t('common.edit')}: ${bundle.name}`} >
        <BundleBuilder bundle={bundle} />
      </PageShell>
    )
  }

  const bundleTypeDef = BUNDLE_TYPES.find((bt) => bt.value === bundle.bundleType)
  const productIds = bundle.items.map((i) => i.productId)

  return (
    <PageShell title={bundle.name} >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {bundleTypeDef && (
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ backgroundColor: `${bundleTypeDef.color}20`, color: bundleTypeDef.color }}
              >
                {t(bundleTypeDef.labelKey)}
              </span>
            )}
            <span className="text-xs text-[var(--crm-text-muted)]">{bundle.sku}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditMode(true)}
            className="border-[var(--crm-border)] text-[var(--crm-text-secondary)]"
          >
            <Edit2 className="w-3.5 h-3.5 mr-1.5" />
            {t('common.edit')}
          </Button>
        </div>

        {bundle.description && (
          <p className="text-sm text-[var(--crm-text-secondary)]">{bundle.description}</p>
        )}

        {/* Items */}
        <div className="glass-card-static p-4 space-y-3">
          <h3 className="text-sm font-semibold text-[var(--crm-text-primary)]">{t('bundles.items')}</h3>
          {bundle.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-2 rounded-md bg-[var(--crm-bg-subtle)]">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--crm-text-primary)]">{item.product.name}</span>
                <span className="text-[10px] text-[var(--crm-text-muted)]">{item.product.sku}</span>
                {item.isRequired ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                    {t('bundles.required')}
                  </span>
                ) : (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-500/20 text-gray-400">
                    {t('bundles.optional')}
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-xs text-[var(--crm-text-muted)]">x{item.quantity}</span>
                <span className="text-sm text-[var(--crm-text-primary)] ml-3">
                  {formatCurrency(Number(item.product.unitPrice) * item.quantity, bundle.currency)}
                </span>
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-2 border-t border-[var(--crm-border)]">
            <div className="text-right">
              <p className="text-xs text-[var(--crm-text-muted)]">{t('bundles.basePrice')}</p>
              <p className="text-lg font-bold text-[#10B981]">{formatCurrency(bundle.basePrice, bundle.currency)}</p>
            </div>
          </div>
        </div>

        {/* Compatibility */}
        {bundle.compatibilityWarnings && bundle.compatibilityWarnings.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-[var(--crm-text-primary)]">{t('bundles.compatibility')}</h3>
            <CompatibilityWarning rules={bundle.compatibilityWarnings} productIds={productIds} />
          </div>
        )}

        {/* Pricing Tiers */}
        {bundle.pricingTiers && bundle.pricingTiers.length > 0 && (
          <div className="glass-card-static p-4 space-y-3">
            <h3 className="text-sm font-semibold text-[var(--crm-text-primary)]">{t('bundles.tierPricing')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {bundle.pricingTiers.map((pt) => {
                const tierDef = CUSTOMER_TIERS.find((ct) => ct.value === pt.tier)
                const adjustedPrice = bundle.basePrice * pt.priceMultiplier
                return (
                  <div key={pt.id} className="p-3 rounded-md bg-[var(--crm-bg-subtle)] text-center">
                    <p className="text-xs font-medium" style={{ color: tierDef?.color }}>
                      {t(`bundles.tier.${pt.tier}`)}
                    </p>
                    <p className="text-sm font-bold text-[var(--crm-text-primary)] mt-1">
                      {formatCurrency(adjustedPrice, bundle.currency)}
                    </p>
                    <p className="text-[10px] text-[var(--crm-text-muted)]">
                      x{pt.priceMultiplier}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </PageShell>
  )
}
