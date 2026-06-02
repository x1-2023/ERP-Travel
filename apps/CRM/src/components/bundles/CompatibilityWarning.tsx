'use client'

import { AlertTriangle, Info, XCircle } from 'lucide-react'
import { useTranslation } from '@/i18n'

interface CompatibilityRule {
  type: string
  notes: string | null
  product: { id: string; name: string }
  relatedProduct: { id: string; name: string }
}

interface CompatibilityWarningProps {
  rules: CompatibilityRule[]
  productIds: string[]
}

export function CompatibilityWarning({ rules, productIds }: CompatibilityWarningProps) {
  const { t } = useTranslation()

  // Filter rules relevant to current product set
  const relevant = rules.filter(
    (r) => productIds.includes(r.product.id) || productIds.includes(r.relatedProduct.id)
  )

  const incompatible = relevant.filter((r) => r.type === 'INCOMPATIBLE'
    && productIds.includes(r.product.id) && productIds.includes(r.relatedProduct.id)
  )
  const requires = relevant.filter((r) => r.type === 'REQUIRES'
    && productIds.includes(r.product.id) && !productIds.includes(r.relatedProduct.id)
  )
  const compatible = relevant.filter((r) => r.type === 'COMPATIBLE'
    && productIds.includes(r.product.id) && productIds.includes(r.relatedProduct.id)
  )

  if (incompatible.length === 0 && requires.length === 0 && compatible.length === 0) return null

  return (
    <div className="space-y-2">
      {incompatible.map((r) => (
        <div key={r.product.id + r.relatedProduct.id} className="flex items-start gap-2 p-2 rounded-md bg-red-500/10 border border-red-500/20">
          <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-red-400">
              {t('bundles.incompatible')}: {r.product.name} + {r.relatedProduct.name}
            </p>
            {r.notes && <p className="text-[11px] text-red-400/70 mt-0.5">{r.notes}</p>}
          </div>
        </div>
      ))}

      {requires.map((r) => (
        <div key={r.product.id + r.relatedProduct.id} className="flex items-start gap-2 p-2 rounded-md bg-yellow-500/10 border border-yellow-500/20">
          <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-yellow-400">
              {t('bundles.requires')}: {r.product.name} → {r.relatedProduct.name}
            </p>
            {r.notes && <p className="text-[11px] text-yellow-400/70 mt-0.5">{r.notes}</p>}
          </div>
        </div>
      ))}

      {compatible.map((r) => (
        <div key={r.product.id + r.relatedProduct.id} className="flex items-start gap-2 p-2 rounded-md bg-emerald-500/10 border border-emerald-500/20">
          <Info className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-emerald-400">
              {t('bundles.compatibility')}: {r.product.name} + {r.relatedProduct.name}
            </p>
            {r.notes && <p className="text-[11px] text-emerald-400/70 mt-0.5">{r.notes}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}
