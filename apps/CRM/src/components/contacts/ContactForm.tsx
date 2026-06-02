'use client'

import { useState } from 'react'
import { useTranslation } from '@/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FieldError } from '@/components/ui/field-error'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { CONTACT_STATUSES, LEAD_SOURCES } from '@/lib/constants'
import { CountrySelect } from '@/components/shared/CountrySelect'
import { useCompanies } from '@/hooks/use-companies'
import { useFormValidation } from '@/hooks/use-form-validation'
import { createContactSchema, type CreateContactInput } from '@/lib/validations'
import type { Contact } from '@/types'

interface ContactFormProps {
  defaultValues?: Partial<Contact>
  onSubmit: (data: Partial<Contact>) => void
  isLoading?: boolean
}

export function ContactForm({
  defaultValues,
  onSubmit,
  isLoading,
}: ContactFormProps) {
  const { t } = useTranslation()
  const { data: companiesData } = useCompanies({ limit: 100 })
  const companies = companiesData?.data ?? []
  const { errors, validate, clearFieldError, hasError } = useFormValidation(createContactSchema)

  const [form, setForm] = useState({
    firstName: defaultValues?.firstName ?? '',
    lastName: defaultValues?.lastName ?? '',
    email: defaultValues?.email ?? '',
    phone: defaultValues?.phone ?? '',
    mobile: defaultValues?.mobile ?? '',
    jobTitle: defaultValues?.jobTitle ?? '',
    department: defaultValues?.department ?? '',
    companyId: defaultValues?.companyId ?? '',
    source: defaultValues?.source ?? '',
    status: defaultValues?.status ?? 'ACTIVE',
    notes: defaultValues?.notes ?? '',
    country: (defaultValues as any)?.country ?? '',
  })

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    clearFieldError(field)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const data: Partial<Contact> = {
      ...form,
      companyId: form.companyId || null,
      source: (form.source || null) as Contact['source'],
      status: form.status as Contact['status'],
    }
    const validated = validate<CreateContactInput>(data)
    if (!validated) return
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="glass-card-static">
        <CardContent className="grid gap-3 p-6">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">
                {t('contacts.lastName')} <span className="text-red-400">*</span>
              </Label>
              <Input
                value={form.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                placeholder={t('contacts.lastNamePlaceholder')}
                className={`input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] placeholder:text-[var(--crm-text-muted)] ${hasError('firstName') ? 'border-red-500' : ''}`}
              />
              <FieldError message={errors.firstName} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">
                {t('contacts.firstName')} <span className="text-red-400">*</span>
              </Label>
              <Input
                value={form.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                placeholder={t('contacts.firstNamePlaceholder')}
                className={`input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] placeholder:text-[var(--crm-text-muted)] ${hasError('lastName') ? 'border-red-500' : ''}`}
              />
              <FieldError message={errors.lastName} />
            </div>
          </div>

          {/* Contact info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="email@example.com"
                className={`input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] placeholder:text-[var(--crm-text-muted)] ${hasError('email') ? 'border-red-500' : ''}`}
              />
              <FieldError message={errors.email} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">{t('common.phone')}</Label>
              <Input
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder={t('contacts.phonePlaceholder')}
                className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] placeholder:text-[var(--crm-text-muted)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">{t('contacts.mobile')}</Label>
              <Input
                value={form.mobile}
                onChange={(e) => updateField('mobile', e.target.value)}
                placeholder={t('contacts.phonePlaceholder')}
                className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] placeholder:text-[var(--crm-text-muted)]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">{t('contacts.jobTitle')}</Label>
              <Input
                value={form.jobTitle}
                onChange={(e) => updateField('jobTitle', e.target.value)}
                placeholder={t('contacts.jobTitlePlaceholder')}
                className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] placeholder:text-[var(--crm-text-muted)]"
              />
            </div>
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">{t('contact.country')}</Label>
            <CountrySelect
              value={form.country}
              onChange={(val) => updateField('country', val)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">{t('contacts.department')}</Label>
              <Input
                value={form.department}
                onChange={(e) => updateField('department', e.target.value)}
                placeholder={t('contacts.departmentPlaceholder')}
                className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] placeholder:text-[var(--crm-text-muted)]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">{t('contacts.company')}</Label>
              <Select
                value={form.companyId}
                onValueChange={(val) => updateField('companyId', val === '__none__' ? '' : val)}
              >
                <SelectTrigger className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)]">
                  <SelectValue placeholder={t('contacts.selectCompany')} />
                </SelectTrigger>
                <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
                  <SelectItem value="__none__" className="text-[var(--crm-text-secondary)]">
                    {t('common.none')}
                  </SelectItem>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-[var(--crm-text-primary)]">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">{t('contacts.source')}</Label>
              <Select
                value={form.source}
                onValueChange={(val) => updateField('source', val === '__none__' ? '' : val)}
              >
                <SelectTrigger className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)]">
                  <SelectValue placeholder={t('contacts.selectSource')} />
                </SelectTrigger>
                <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
                  <SelectItem value="__none__" className="text-[var(--crm-text-secondary)]">
                    {t('common.unknown')}
                  </SelectItem>
                  {LEAD_SOURCES.map((s) => (
                    <SelectItem key={s.value} value={s.value} className="text-[var(--crm-text-primary)]">
                      {t(s.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">{t('common.status')}</Label>
              <Select
                value={form.status}
                onValueChange={(val) => updateField('status', val)}
              >
                <SelectTrigger className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)]">
                  <SelectValue placeholder={t('contacts.selectStatus')} />
                </SelectTrigger>
                <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
                  {CONTACT_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value} className="text-[var(--crm-text-primary)]">
                      {t(s.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">{t('common.notes')}</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder={t('contacts.notesPlaceholder')}
              rows={3}
              className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] placeholder:text-[var(--crm-text-muted)]"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="btn-accent-glow"
            >
              {isLoading ? t('common.saving') : t('contacts.saveContact')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
