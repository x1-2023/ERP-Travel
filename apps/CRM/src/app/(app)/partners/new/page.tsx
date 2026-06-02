'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { useTranslation } from '@/i18n'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCompanies } from '@/hooks/use-companies'
import { useCreatePartner } from '@/hooks/use-partners'
import { PARTNER_TYPES, CERTIFICATION_LEVELS } from '@/lib/constants'

export default function NewPartnerPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const createPartner = useCreatePartner()
  const { data: companiesData } = useCompanies({ limit: 200 })
  const companies = companiesData?.data || []

  const [form, setForm] = useState({
    companyId: '',
    partnerType: 'RESELLER',
    certificationLevel: 'BRONZE',
    territory: '',
    commissionRate: '10',
    contractStartDate: '',
    contractEndDate: '',
    notes: '',
  })

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    createPartner.mutate(
      {
        companyId: form.companyId,
        partnerType: form.partnerType,
        certificationLevel: form.certificationLevel,
        territory: form.territory || undefined,
        commissionRate: parseFloat(form.commissionRate),
        contractStartDate: form.contractStartDate || undefined,
        contractEndDate: form.contractEndDate || undefined,
        notes: form.notes || undefined,
      },
      {
        onSuccess: () => {
          router.push('/partners')
        },
      }
    )
  }

  return (
    <PageShell
      title={t('partner.create')}
      actions={
        <Link href="/partners">
          <Button
            variant="outline"
            size="sm"
            className="border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)]"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.cancel')}
          </Button>
        </Link>
      }
    >
      <form onSubmit={handleSubmit}>
        <Card className="glass-card-static">
          <CardContent className="grid gap-3 p-6">
            {/* Company */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">
                {t('partner.company')} <span className="text-red-400">*</span>
              </Label>
              <Select
                value={form.companyId}
                onValueChange={(val) => updateField('companyId', val)}
              >
                <SelectTrigger className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)]">
                  <SelectValue placeholder="Chọn công ty..." />
                </SelectTrigger>
                <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
                  {companies.map((c: any) => (
                    <SelectItem key={c.id} value={c.id} className="text-[var(--crm-text-primary)]">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type & Certification */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">
                  Loại đối tác
                </Label>
                <Select
                  value={form.partnerType}
                  onValueChange={(val) => updateField('partnerType', val)}
                >
                  <SelectTrigger className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
                    {PARTNER_TYPES.map((pt) => (
                      <SelectItem key={pt.value} value={pt.value} className="text-[var(--crm-text-primary)]">
                        {t(pt.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">
                  Cấp độ
                </Label>
                <Select
                  value={form.certificationLevel}
                  onValueChange={(val) => updateField('certificationLevel', val)}
                >
                  <SelectTrigger className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
                    {CERTIFICATION_LEVELS.map((cl) => (
                      <SelectItem key={cl.value} value={cl.value} className="text-[var(--crm-text-primary)]">
                        {t(cl.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Territory & Commission Rate */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">
                  {t('partner.territory')}
                </Label>
                <Input
                  value={form.territory}
                  onChange={(e) => updateField('territory', e.target.value)}
                  placeholder="e.g. US, APAC, EMEA"
                  className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] placeholder:text-[var(--crm-text-muted)]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">
                  {t('partner.commissionRate')} (%)
                </Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={form.commissionRate}
                  onChange={(e) => updateField('commissionRate', e.target.value)}
                  className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)]"
                />
              </div>
            </div>

            {/* Contract Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">
                  {t('partner.contractStart')}
                </Label>
                <Input
                  type="date"
                  value={form.contractStartDate}
                  onChange={(e) => updateField('contractStartDate', e.target.value)}
                  className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">
                  {t('partner.contractEnd')}
                </Label>
                <Input
                  type="date"
                  value={form.contractEndDate}
                  onChange={(e) => updateField('contractEndDate', e.target.value)}
                  className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)]"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">
                {t('common.notes')}
              </Label>
              <Textarea
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Ghi chú về đối tác..."
                rows={3}
                className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] placeholder:text-[var(--crm-text-muted)]"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="submit"
                disabled={!form.companyId || createPartner.isPending}
                className="btn-accent-glow"
              >
                {createPartner.isPending ? t('common.saving') : t('partner.create')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </PageShell>
  )
}
