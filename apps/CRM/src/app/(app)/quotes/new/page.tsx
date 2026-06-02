'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { QuoteBuilder, type QuoteLineItem } from '@/components/quotes/QuoteBuilder'
import { useContacts } from '@/hooks/use-contacts'
import { useCompanies } from '@/hooks/use-companies'
import { useDeals } from '@/hooks/use-deals'
import { useProducts } from '@/hooks/use-products'
import { useCreateQuote } from '@/hooks/use-quotes'
import { useTranslation } from '@/i18n'

export default function NewQuotePage() {
  const router = useRouter()
  const { t } = useTranslation()
  const createQuote = useCreateQuote()

  const { data: contactsData } = useContacts({ limit: 100 })
  const { data: companiesData } = useCompanies({ limit: 100 })
  const { data: dealsData } = useDeals({ limit: 100 })
  const { data: productsData } = useProducts()

  const contacts = contactsData?.data || []
  const companies = companiesData?.data || []
  const deals = dealsData?.data || []
  const products = (productsData?.data || []).map((p) => ({
    id: p.id,
    name: p.name,
    unitPrice: Number(p.unitPrice),
    description: p.description,
  }))

  const [contactId, setContactId] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [dealId, setDealId] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [terms, setTerms] = useState('')
  const [items, setItems] = useState<QuoteLineItem[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return

    const subtotal = items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0)
    const discountAmount = items.reduce(
      (sum, it) => sum + it.quantity * it.unitPrice * (it.discount / 100),
      0
    )
    const afterDiscount = subtotal - discountAmount
    const taxAmount = afterDiscount * 0.1
    const total = afterDiscount + taxAmount

    createQuote.mutate(
      {
        contactId: contactId || undefined,
        companyId: companyId || undefined,
        dealId: dealId || undefined,
        validUntil: validUntil ? new Date(validUntil).toISOString() : undefined,
        terms: terms || undefined,
        subtotal,
        discountAmount,
        discountPercent: subtotal > 0 ? (discountAmount / subtotal) * 100 : 0,
        taxPercent: 10,
        taxAmount,
        total,
        items: items.map((it, idx) => ({
          productId: it.productId || undefined,
          description: it.description || undefined,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          discount: it.discount,
          total: it.total,
          sortOrder: idx,
        })),
      } as unknown as Parameters<typeof createQuote.mutate>[0],
      {
        onSuccess: () => router.push('/quotes'),
      }
    )
  }

  return (
    <PageShell
      title={t('quotes.createQuote')}
      description="Tạo báo giá mới cho khách hàng"
      actions={
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] hover:bg-[var(--crm-bg-subtle)]"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Quay lại
        </Button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Customer info */}
        <Card className="bg-[var(--crm-bg-card)] border-[var(--crm-border)] p-3">
          <h3 className="text-sm font-medium text-[var(--crm-text-primary)] mb-4">Thông tin khách hàng</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Contact */}
            <div className="space-y-1.5">
              <Label className="text-[var(--crm-text-secondary)] text-xs">{t('activities.contact')}</Label>
              <Select value={contactId} onValueChange={setContactId}>
                <SelectTrigger className="bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)]">
                  <SelectValue placeholder={t('quotes.selectContact')} />
                </SelectTrigger>
                <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
                  {contacts.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-[var(--crm-text-primary)] focus:bg-[var(--crm-bg-subtle)] focus:text-[var(--crm-text-primary)]">
                      {c.firstName} {c.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Company */}
            <div className="space-y-1.5">
              <Label className="text-[var(--crm-text-secondary)] text-xs">{t('contacts.company')}</Label>
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger className="bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)]">
                  <SelectValue placeholder={t('quotes.selectCompany')} />
                </SelectTrigger>
                <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-[var(--crm-text-primary)] focus:bg-[var(--crm-bg-subtle)] focus:text-[var(--crm-text-primary)]">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Deal */}
            <div className="space-y-1.5">
              <Label className="text-[var(--crm-text-secondary)] text-xs">Thương vụ</Label>
              <Select value={dealId} onValueChange={setDealId}>
                <SelectTrigger className="bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)]">
                  <SelectValue placeholder={t('quotes.selectDeal')} />
                </SelectTrigger>
                <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
                  {deals.map((d) => (
                    <SelectItem key={d.id} value={d.id} className="text-[var(--crm-text-primary)] focus:bg-[var(--crm-bg-subtle)] focus:text-[var(--crm-text-primary)]">
                      {d.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Line items */}
        <Card className="bg-[var(--crm-bg-card)] border-[var(--crm-border)] p-3">
          <h3 className="text-sm font-medium text-[var(--crm-text-primary)] mb-4">Sản phẩm / Dịch vụ</h3>
          <QuoteBuilder items={items} onItemsChange={setItems} products={products} />
        </Card>

        {/* Terms & Valid Until */}
        <Card className="bg-[var(--crm-bg-card)] border-[var(--crm-border)] p-3">
          <h3 className="text-sm font-medium text-[var(--crm-text-primary)] mb-4">Điều khoản & thời hạn</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[var(--crm-text-secondary)] text-xs">Hiệu lực đến</Label>
              <Input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[var(--crm-text-secondary)] text-xs">Điều khoản</Label>
              <Textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder={t('quotes.termsPlaceholder')}
                rows={3}
                className="bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] placeholder:text-[var(--crm-text-muted)] resize-none"
              />
            </div>
          </div>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] hover:bg-[var(--crm-bg-subtle)]"
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            disabled={items.length === 0 || createQuote.isPending}
            className="bg-[#10B981] hover:bg-[#10B981]/90 text-white"
          >
            {createQuote.isPending ? t('common.creating') : t('quotes.createQuote')}
          </Button>
        </div>
      </form>
    </PageShell>
  )
}
