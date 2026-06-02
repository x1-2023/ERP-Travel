'use client'

import { useState, useCallback, useMemo } from 'react'
import { Plus, Trash2, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/constants'
import { useTranslation } from '@/i18n'
import { useBundles } from '@/hooks/use-bundles'
import type { Bundle } from '@/hooks/use-bundles'

// ── Types ───────────────────────────────────────────────────────────
export interface QuoteLineItem {
  id: string
  productId: string
  productName: string
  description: string
  quantity: number
  unitPrice: number
  discount: number
  total: number
  bundleName?: string // section header for bundle items
}

interface ProductOption {
  id: string
  name: string
  unitPrice: number | string
  description?: string | null
}

interface QuoteBuilderProps {
  items: QuoteLineItem[]
  onItemsChange: (items: QuoteLineItem[]) => void
  products?: ProductOption[]
  currency?: string
  dealType?: string // for pricing tier multiplier
}

let nextId = 1
function generateId() {
  return `item_${Date.now()}_${nextId++}`
}

function calcLineTotal(qty: number, price: number, discountPct: number) {
  const base = qty * price
  return base - base * (discountPct / 100)
}

function parseVNNumber(value: string): number {
  const normalized = value.replace(/,/g, '.')
  const num = parseFloat(normalized)
  return isNaN(num) ? 0 : num
}

export function QuoteBuilder({ items, onItemsChange, products = [], currency = 'VND', dealType }: QuoteBuilderProps) {
  const { t } = useTranslation()
  const [bundleDialogOpen, setBundleDialogOpen] = useState(false)
  const { data: bundlesData } = useBundles({ isActive: 'true' })
  const bundles = bundlesData?.data || []

  const addItem = useCallback(() => {
    const newItem: QuoteLineItem = {
      id: generateId(),
      productId: '',
      productName: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      total: 0,
    }
    onItemsChange([...items, newItem])
  }, [items, onItemsChange])

  const removeItem = useCallback(
    (id: string) => {
      onItemsChange(items.filter((it) => it.id !== id))
    },
    [items, onItemsChange]
  )

  const updateItem = useCallback(
    (id: string, field: keyof QuoteLineItem, value: string | number) => {
      onItemsChange(
        items.map((it) => {
          if (it.id !== id) return it
          const updated = { ...it, [field]: value }
          updated.total = calcLineTotal(updated.quantity, updated.unitPrice, updated.discount)
          return updated
        })
      )
    },
    [items, onItemsChange]
  )

  const selectProduct = useCallback(
    (itemId: string, productId: string) => {
      const product = products.find((p) => p.id === productId)
      if (!product) return
      const price = typeof product.unitPrice === 'string' ? parseFloat(product.unitPrice) : product.unitPrice
      onItemsChange(
        items.map((it) => {
          if (it.id !== itemId) return it
          const updated = {
            ...it,
            productId: product.id,
            productName: product.name,
            description: product.description || '',
            unitPrice: price,
          }
          updated.total = calcLineTotal(updated.quantity, updated.unitPrice, updated.discount)
          return updated
        })
      )
    },
    [items, onItemsChange, products]
  )

  const addBundle = useCallback(
    (bundle: Bundle) => {
      // Find pricing tier multiplier for this deal type
      let multiplier = 1.0
      if (dealType) {
        const tierMap: Record<string, string> = {
          GOVERNMENT: 'GOVERNMENT',
          COMMERCIAL: 'COMMERCIAL',
          ACADEMIC: 'ACADEMIC',
          PARTNER: 'PARTNER',
        }
        const tierKey = tierMap[dealType]
        if (tierKey) {
          const tier = bundle.pricingTiers?.find((pt) => pt.tier === tierKey)
          if (tier) multiplier = tier.priceMultiplier
        }
      }

      const bundleItems: QuoteLineItem[] = bundle.items
        .filter((item) => item.isRequired)
        .map((item, idx) => {
          const price = Number(item.product.unitPrice) * multiplier
          const qty = item.quantity
          return {
            id: generateId(),
            productId: item.productId,
            productName: item.product.name,
            description: '',
            quantity: qty,
            unitPrice: price,
            discount: 0,
            total: qty * price,
            bundleName: idx === 0 ? bundle.name : undefined,
          }
        })

      onItemsChange([...items, ...bundleItems])
      setBundleDialogOpen(false)
    },
    [items, onItemsChange, dealType]
  )

  const { subtotal, totalDiscount, tax, grandTotal } = useMemo(() => {
    const sub = items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0)
    const disc = items.reduce(
      (sum, it) => sum + it.quantity * it.unitPrice * (it.discount / 100),
      0
    )
    const afterDiscount = sub - disc
    const taxVal = afterDiscount * 0.1
    return { subtotal: sub, totalDiscount: disc, tax: taxVal, grandTotal: afterDiscount + taxVal }
  }, [items])

  return (
    <div className="space-y-4">
      <div className="glass-card-static overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-[var(--crm-border)] hover:bg-transparent">
              <TableHead className="text-[var(--crm-text-secondary)] text-[11px] font-semibold uppercase tracking-wide w-10">#</TableHead>
              <TableHead className="text-[var(--crm-text-secondary)] text-[11px] font-semibold uppercase tracking-wide">{t('quotes.product')}</TableHead>
              <TableHead className="text-[var(--crm-text-secondary)] text-[11px] font-semibold uppercase tracking-wide">{t('common.description')}</TableHead>
              <TableHead className="text-[var(--crm-text-secondary)] text-[11px] font-semibold uppercase tracking-wide w-20 text-right">{t('quotes.qty')}</TableHead>
              <TableHead className="text-[var(--crm-text-secondary)] text-[11px] font-semibold uppercase tracking-wide w-32 text-right">{t('quotes.unitPrice')}</TableHead>
              <TableHead className="text-[var(--crm-text-secondary)] text-[11px] font-semibold uppercase tracking-wide w-20 text-right">{t('quotes.discountPct')}</TableHead>
              <TableHead className="text-[var(--crm-text-secondary)] text-[11px] font-semibold uppercase tracking-wide w-32 text-right">{t('quotes.lineTotal')}</TableHead>
              <TableHead className="text-[var(--crm-text-secondary)] text-[11px] font-semibold uppercase tracking-wide w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, idx) => (
              <>
                {item.bundleName && (
                  <TableRow key={`bundle-header-${item.id}`} className="border-[var(--crm-border)] bg-[var(--crm-bg-subtle)]">
                    <TableCell colSpan={8} className="py-1.5">
                      <div className="flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-[#10B981]" />
                        <span className="text-xs font-semibold text-[#10B981]">{item.bundleName}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                <TableRow key={item.id} className="border-[var(--crm-border)] hover:bg-[var(--crm-bg-subtle)]">
                  <TableCell className="text-[var(--crm-text-muted)] text-xs">{idx + 1}</TableCell>
                  <TableCell>
                    {products.length > 0 ? (
                      <Select
                        value={item.productId}
                        onValueChange={(v) => selectProduct(item.id, v)}
                      >
                        <SelectTrigger className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] h-8 text-xs">
                          <SelectValue placeholder={t('quotes.selectProduct')} />
                        </SelectTrigger>
                        <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id} className="text-[var(--crm-text-primary)] text-xs focus:bg-[var(--crm-bg-subtle)] focus:text-[var(--crm-text-primary)]">
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={item.productName}
                        onChange={(e) => updateItem(item.id, 'productName', e.target.value)}
                        placeholder={t('quotes.productNamePlaceholder')}
                        className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] h-8 text-xs placeholder:text-[var(--crm-text-muted)]"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder={t('quotes.descriptionPlaceholder')}
                      className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] h-8 text-xs placeholder:text-[var(--crm-text-muted)]"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value) || 1)}
                      className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] h-8 text-xs text-right"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      inputMode="decimal"
                      defaultValue={item.unitPrice || ''}
                      onBlur={(e) => updateItem(item.id, 'unitPrice', parseVNNumber(e.target.value))}
                      className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] h-8 text-xs text-right"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      inputMode="decimal"
                      defaultValue={item.discount || ''}
                      onBlur={(e) => updateItem(item.id, 'discount', parseVNNumber(e.target.value))}
                      className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] h-8 text-xs text-right"
                    />
                  </TableCell>
                  <TableCell className="text-right text-sm text-[var(--crm-text-primary)] font-medium">
                    {formatCurrency(item.total, currency)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="h-7 w-7 text-[var(--crm-text-muted)] hover:text-red-400 hover:bg-red-400/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              </>
            ))}

            {items.length === 0 && (
              <TableRow className="border-[var(--crm-border)]">
                <TableCell colSpan={8} className="text-center text-[var(--crm-text-muted)] text-sm py-8">
                  {t('quotes.noProducts')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addItem}
          className="border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] hover:bg-[var(--crm-bg-subtle)]"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          {t('quotes.addProduct')}
        </Button>

        {bundles.length > 0 && (
          <Dialog open={bundleDialogOpen} onOpenChange={setBundleDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-[#10B981]/30 text-[#10B981] hover:bg-[#10B981]/10"
              >
                <Package className="w-3.5 h-3.5 mr-1.5" />
                {t('bundles.addToQuote')}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[var(--crm-bg-card)] border-[var(--crm-border)] max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-[var(--crm-text-primary)]">{t('bundles.addToQuote')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {bundles.map((bundle) => {
                  // Calculate tier-adjusted price
                  let multiplier = 1.0
                  if (dealType) {
                    const tier = bundle.pricingTiers?.find((pt) => pt.tier === dealType)
                    if (tier) multiplier = tier.priceMultiplier
                  }
                  const adjustedPrice = bundle.basePrice * multiplier

                  return (
                    <button
                      key={bundle.id}
                      onClick={() => addBundle(bundle)}
                      className="w-full p-3 rounded-md bg-[var(--crm-bg-subtle)] hover:bg-[var(--crm-bg-hover)] text-left transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-[var(--crm-text-primary)]">{bundle.name}</p>
                          <p className="text-xs text-[var(--crm-text-muted)] mt-0.5">
                            {bundle.items.length} {t('bundles.items').toLowerCase()} &middot; {bundle.sku}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-[#10B981]">
                            {formatCurrency(adjustedPrice, bundle.currency)}
                          </p>
                          {multiplier !== 1.0 && (
                            <p className="text-[10px] text-[var(--crm-text-muted)]">
                              x{multiplier} ({dealType})
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="glass-card-static w-72 space-y-2 text-sm p-4">
          <div className="flex justify-between text-[var(--crm-text-secondary)]">
            <span>{t('quotes.subtotal')}</span>
            <span className="text-[var(--crm-text-primary)]">{formatCurrency(subtotal, currency)}</span>
          </div>
          <div className="flex justify-between text-[var(--crm-text-secondary)]">
            <span>{t('quotes.discountAmount')}</span>
            <span className="text-red-400">-{formatCurrency(totalDiscount, currency)}</span>
          </div>
          <div className="flex justify-between text-[var(--crm-text-secondary)]">
            <span>{t('quotes.tax')}</span>
            <span className="text-[var(--crm-text-primary)]">{formatCurrency(tax, currency)}</span>
          </div>
          <div className="border-t border-[var(--crm-border)] pt-2 flex justify-between font-bold text-base">
            <span className="text-[var(--crm-text-primary)]">{t('quotes.total')}</span>
            <span className="text-[#10B981]">{formatCurrency(grandTotal, currency)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
