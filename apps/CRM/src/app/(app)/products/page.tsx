'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageShell } from '@/components/layout/PageShell'
// Package icon used in sidebar nav only
import { BundleCard } from '@/components/bundles/BundleCard'
import { useProducts } from '@/hooks/use-products'
import { useBundles } from '@/hooks/use-bundles'
import { formatCurrency, PRODUCT_CATEGORIES } from '@/lib/constants'
import { useTranslation } from '@/i18n'

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsPageContent />
    </Suspense>
  )
}

function ProductsPageContent() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get('tab') || 'products'

  const [search, setSearch] = useState('')
  const { data: productsData, isLoading: productsLoading } = useProducts()
  const { data: bundlesData, isLoading: bundlesLoading } = useBundles({ isActive: 'true' })

  const products = productsData?.data || []
  const bundles = bundlesData?.data || []

  const filteredProducts = search
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.sku?.toLowerCase().includes(search.toLowerCase())
      )
    : products

  const getCategoryLabel = (cat: string | null) => {
    if (!cat) return '-'
    const found = PRODUCT_CATEGORIES.find((c) => c.value === cat)
    return found ? t(found.labelKey) : cat
  }

  return (
    <PageShell title={t('nav.products')}>
      <Tabs defaultValue={defaultTab} className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList className="bg-[var(--crm-bg-subtle)] border border-[var(--crm-border)]">
            <TabsTrigger value="products" className="data-[state=active]:bg-[var(--crm-bg-hover)] data-[state=active]:text-[var(--crm-text-primary)] text-[var(--crm-text-muted)]">
              {t('nav.products')}
            </TabsTrigger>
            <TabsTrigger value="bundles" className="data-[state=active]:bg-[var(--crm-bg-hover)] data-[state=active]:text-[var(--crm-text-primary)] text-[var(--crm-text-muted)]">
              {t('bundles.title')}
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--crm-text-muted)]" />
              <Input
                placeholder={t('common.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] pl-8 h-8 w-48 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="glass-card-static overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-[var(--crm-border)] hover:bg-transparent">
                  <TableHead className="text-[var(--crm-text-secondary)] text-[11px] font-semibold uppercase tracking-wide">{t('common.name')}</TableHead>
                  <TableHead className="text-[var(--crm-text-secondary)] text-[11px] font-semibold uppercase tracking-wide">SKU</TableHead>
                  <TableHead className="text-[var(--crm-text-secondary)] text-[11px] font-semibold uppercase tracking-wide">{t('products.category.OTHER')}</TableHead>
                  <TableHead className="text-[var(--crm-text-secondary)] text-[11px] font-semibold uppercase tracking-wide text-right">{t('quotes.unitPrice')}</TableHead>
                  <TableHead className="text-[var(--crm-text-secondary)] text-[11px] font-semibold uppercase tracking-wide text-center">ITAR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsLoading ? (
                  <TableRow className="border-[var(--crm-border)]">
                    <TableCell colSpan={5} className="text-center text-[var(--crm-text-muted)] py-8">
                      {t('common.loading')}
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow className="border-[var(--crm-border)]">
                    <TableCell colSpan={5} className="text-center text-[var(--crm-text-muted)] py-8">
                      {t('common.noResults')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((p) => (
                    <TableRow key={p.id} className="border-[var(--crm-border)] hover:bg-[var(--crm-bg-subtle)]">
                      <TableCell className="text-sm text-[var(--crm-text-primary)] font-medium">{p.name}</TableCell>
                      <TableCell className="text-xs text-[var(--crm-text-muted)]">{p.sku || '-'}</TableCell>
                      <TableCell className="text-xs text-[var(--crm-text-secondary)]">{getCategoryLabel(p.category)}</TableCell>
                      <TableCell className="text-sm text-[var(--crm-text-primary)] text-right">{formatCurrency(Number(p.unitPrice), p.currency)}</TableCell>
                      <TableCell className="text-center">
                        {p.itar && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">ITAR</span>}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Bundles Tab */}
        <TabsContent value="bundles" className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => router.push('/products/bundles/new')}
              className="bg-[#10B981] hover:bg-[#059669] text-white"
              size="sm"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              {t('bundles.create')}
            </Button>
          </div>

          {bundlesLoading ? (
            <div className="text-center text-[var(--crm-text-muted)] py-8">{t('common.loading')}</div>
          ) : bundles.length === 0 ? (
            <div className="text-center text-[var(--crm-text-muted)] py-8">{t('common.noResults')}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bundles.map((bundle) => (
                <BundleCard
                  key={bundle.id}
                  bundle={bundle}
                  onClick={() => router.push(`/products/bundles/${bundle.id}`)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PageShell>
  )
}
