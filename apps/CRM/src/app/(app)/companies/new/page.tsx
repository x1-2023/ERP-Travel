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
import { useCreateCompany, useCompanies } from '@/hooks/use-companies'
import { CountrySelect } from '@/components/shared/CountrySelect'
import { COMPANY_SIZES } from '@/lib/constants'
import type { Company } from '@/types'

const INDUSTRIES = [
  'Công nghệ',
  'Tài chính',
  'Sản xuất',
  'Bán lẻ',
  'Y tế',
  'Giáo dục',
  'Bất động sản',
  'Logistics',
  'F&B',
  'Khác',
]

export default function NewCompanyPage() {
  const router = useRouter()
  const createCompany = useCreateCompany()
  const { t } = useTranslation()

  const { data: companiesData } = useCompanies({ limit: 200 })
  const parentCompanies = companiesData?.data || []

  const [form, setForm] = useState({
    name: '',
    domain: '',
    industry: '',
    size: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    province: '',
    taxCode: '',
    notes: '',
    country: '',
    parentId: '',
  })

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const data: Partial<Company> & { parentId?: string | null } = {
      ...form,
      size: (form.size || null) as Company['size'],
      industry: form.industry || null,
      parentId: form.parentId || null,
    }
    createCompany.mutate(data, {
      onSuccess: () => {
        router.push('/companies')
      },
    })
  }

  return (
    <PageShell
      title={t('companies.addNew')}
      actions={
        <Link href="/companies">
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
            {/* Name & Domain */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">
                  {t('companies.companyName')} <span className="text-red-400">*</span>
                </Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Công ty ABC"
                  className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] placeholder:text-[var(--crm-text-muted)]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">Domain</Label>
                <Input
                  value={form.domain}
                  onChange={(e) => updateField('domain', e.target.value)}
                  placeholder="abc.com"
                  className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] placeholder:text-[var(--crm-text-muted)]"
                />
              </div>
            </div>

            {/* Industry & Size */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">{t('companies.industry')}</Label>
                <Select
                  value={form.industry}
                  onValueChange={(val) =>
                    updateField('industry', val === '__none__' ? '' : val)
                  }
                >
                  <SelectTrigger className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)]">
                    <SelectValue placeholder={t('companies.selectIndustry')} />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
                    <SelectItem value="__none__" className="text-[var(--crm-text-secondary)]">
                      {t('common.unknown')}
                    </SelectItem>
                    {INDUSTRIES.map((ind) => (
                      <SelectItem
                        key={ind}
                        value={ind}
                        className="text-[var(--crm-text-primary)]"
                      >
                        {ind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">{t('companies.size')}</Label>
                <Select
                  value={form.size}
                  onValueChange={(val) =>
                    updateField('size', val === '__none__' ? '' : val)
                  }
                >
                  <SelectTrigger className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)]">
                    <SelectValue placeholder={t('companies.selectSize')} />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
                    <SelectItem value="__none__" className="text-[var(--crm-text-secondary)]">
                      {t('common.unknown')}
                    </SelectItem>
                    {COMPANY_SIZES.map((s) => (
                      <SelectItem
                        key={s.value}
                        value={s.value}
                        className="text-[var(--crm-text-primary)]"
                      >
                        {t(s.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Parent Company */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">
                {t('companies.parentCompany')}
              </Label>
              <Select
                value={form.parentId}
                onValueChange={(val) =>
                  updateField('parentId', val === '__none__' ? '' : val)
                }
              >
                <SelectTrigger className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)]">
                  <SelectValue placeholder={t('companies.selectParent')} />
                </SelectTrigger>
                <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
                  <SelectItem value="__none__" className="text-[var(--crm-text-secondary)]">
                    {t('common.none')}
                  </SelectItem>
                  {parentCompanies.map((c: any) => (
                    <SelectItem
                      key={c.id}
                      value={c.id}
                      className="text-[var(--crm-text-primary)]"
                    >
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">Điện thoại</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="028 1234 5678"
                  className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] placeholder:text-[var(--crm-text-muted)]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">{t('common.email')}</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="contact@abc.com"
                  className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] placeholder:text-[var(--crm-text-muted)]"
                />
              </div>
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">Website</Label>
              <Input
                value={form.website}
                onChange={(e) => updateField('website', e.target.value)}
                placeholder="https://abc.com"
                className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] placeholder:text-[var(--crm-text-muted)]"
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">Địa chỉ</Label>
              <Input
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="123 Nguyễn Huệ, Quận 1"
                className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] placeholder:text-[var(--crm-text-muted)]"
              />
            </div>

            {/* City & Province */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">Thành phố</Label>
                <Input
                  value={form.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="Ho Chi Minh"
                  className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] placeholder:text-[var(--crm-text-muted)]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">Tỉnh</Label>
                <Input
                  value={form.province}
                  onChange={(e) => updateField('province', e.target.value)}
                  placeholder="TP.HCM"
                  className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] placeholder:text-[var(--crm-text-muted)]"
                />
              </div>
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">{t('company.country')}</Label>
              <CountrySelect
                value={form.country}
                onChange={(val) => updateField('country', val)}
              />
            </div>

            {/* Tax Code */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">{t('companies.taxCode')}</Label>
              <Input
                value={form.taxCode}
                onChange={(e) => updateField('taxCode', e.target.value)}
                placeholder="0123456789"
                className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] placeholder:text-[var(--crm-text-muted)]"
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">{t('common.notes')}</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder={t('companies.notesPlaceholder')}
                rows={3}
                className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] placeholder:text-[var(--crm-text-muted)]"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="submit"
                disabled={createCompany.isPending}
                className="btn-accent-glow"
              >
                {createCompany.isPending ? t('common.saving') : t('companies.saveCompany')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </PageShell>
  )
}
