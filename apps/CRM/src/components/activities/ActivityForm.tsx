'use client'

import { useState } from 'react'
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
import { ACTIVITY_TYPES } from '@/lib/constants'
import { useTranslation } from '@/i18n'
import { useFormValidation } from '@/hooks/use-form-validation'
import { createActivitySchema, type CreateActivityInput } from '@/lib/validations'

// ── Types ───────────────────────────────────────────────────────────
interface SimpleEntity {
  id: string
  name?: string
  firstName?: string
  lastName?: string
  title?: string
}

interface ActivityFormData {
  type: string
  subject: string
  description: string
  contactId: string
  dealId: string
  dueAt: string
  duration: number | ''
}

interface ActivityFormProps {
  onSubmit: (data: Record<string, unknown>) => void
  defaultValues?: Partial<ActivityFormData>
  contacts?: SimpleEntity[]
  deals?: SimpleEntity[]
  isSubmitting?: boolean
}

export function ActivityForm({
  onSubmit,
  defaultValues,
  contacts = [],
  deals = [],
  isSubmitting,
}: ActivityFormProps) {
  const { t } = useTranslation()
  const { errors, validate, clearFieldError, hasError } = useFormValidation(createActivitySchema)

  const [form, setForm] = useState<ActivityFormData>({
    type: defaultValues?.type || '',
    subject: defaultValues?.subject || '',
    description: defaultValues?.description || '',
    contactId: defaultValues?.contactId || '',
    dealId: defaultValues?.dealId || '',
    dueAt: defaultValues?.dueAt || '',
    duration: defaultValues?.duration || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload: Record<string, unknown> = {
      type: form.type,
      subject: form.subject,
      description: form.description || undefined,
      contactId: form.contactId || undefined,
      dealId: form.dealId || undefined,
      dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : undefined,
      duration: form.duration ? Number(form.duration) : undefined,
    }
    const validated = validate<CreateActivityInput>(payload)
    if (!validated) return
    onSubmit(payload)
  }

  const isTask = form.type === 'TASK'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type */}
      <div className="space-y-1.5">
        <Label className="text-[var(--crm-text-secondary)] text-xs">{t('activities.type')} *</Label>
        <Select value={form.type} onValueChange={(v) => { setForm({ ...form, type: v }); clearFieldError('type') }}>
          <SelectTrigger className={`bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] ${hasError('type') ? 'border-red-500' : ''}`}>
            <SelectValue placeholder={t('activities.selectType')} />
          </SelectTrigger>
          <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
            {ACTIVITY_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value} className="text-[var(--crm-text-primary)] focus:bg-[var(--crm-bg-subtle)] focus:text-[var(--crm-text-primary)]">
                {t(type.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError message={errors.type} />
      </div>

      {/* Subject */}
      <div className="space-y-1.5">
        <Label className="text-[var(--crm-text-secondary)] text-xs">{t('activities.subject')} *</Label>
        <Input
          value={form.subject}
          onChange={(e) => { setForm({ ...form, subject: e.target.value }); clearFieldError('subject') }}
          placeholder={t('activities.subjectPlaceholder')}
          className={`bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] placeholder:text-[var(--crm-text-muted)] ${hasError('subject') ? 'border-red-500' : ''}`}
        />
        <FieldError message={errors.subject} />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label className="text-[var(--crm-text-secondary)] text-xs">{t('common.description')}</Label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder={t('activities.descriptionPlaceholder')}
          rows={3}
          className="bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] placeholder:text-[var(--crm-text-muted)] resize-none"
        />
      </div>

      {/* Contact */}
      <div className="space-y-1.5">
        <Label className="text-[var(--crm-text-secondary)] text-xs">{t('activities.contact')}</Label>
        <Select value={form.contactId} onValueChange={(v) => setForm({ ...form, contactId: v })}>
          <SelectTrigger className="bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)]">
            <SelectValue placeholder={t('activities.selectContact')} />
          </SelectTrigger>
          <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
            {contacts.map((c) => (
              <SelectItem key={c.id} value={c.id} className="text-[var(--crm-text-primary)] focus:bg-[var(--crm-bg-subtle)] focus:text-[var(--crm-text-primary)]">
                {c.firstName && c.lastName ? `${c.firstName} ${c.lastName}` : c.name || c.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Deal */}
      <div className="space-y-1.5">
        <Label className="text-[var(--crm-text-secondary)] text-xs">{t('activities.deal')}</Label>
        <Select value={form.dealId} onValueChange={(v) => setForm({ ...form, dealId: v })}>
          <SelectTrigger className="bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)]">
            <SelectValue placeholder={t('activities.selectDeal')} />
          </SelectTrigger>
          <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
            {deals.map((d) => (
              <SelectItem key={d.id} value={d.id} className="text-[var(--crm-text-primary)] focus:bg-[var(--crm-bg-subtle)] focus:text-[var(--crm-text-primary)]">
                {d.title || d.name || d.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Due date (for tasks) */}
      {isTask && (
        <div className="space-y-1.5">
          <Label className="text-[var(--crm-text-secondary)] text-xs">{t('activities.dueDate')}</Label>
          <Input
            type="datetime-local"
            value={form.dueAt}
            onChange={(e) => setForm({ ...form, dueAt: e.target.value })}
            className="bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)]"
          />
        </div>
      )}

      {/* Duration */}
      <div className="space-y-1.5">
        <Label className="text-[var(--crm-text-secondary)] text-xs">{t('activities.duration')}</Label>
        <Input
          type="number"
          min={0}
          value={form.duration}
          onChange={(e) => setForm({ ...form, duration: e.target.value ? Number(e.target.value) : '' })}
          placeholder="0"
          className="bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] placeholder:text-[var(--crm-text-muted)]"
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={!form.type || !form.subject || isSubmitting}
        className="w-full bg-[#10B981] hover:bg-[#10B981]/90 text-white"
      >
        {isSubmitting ? t('common.saving') : t('activities.saveActivity')}
      </Button>
    </form>
  )
}
