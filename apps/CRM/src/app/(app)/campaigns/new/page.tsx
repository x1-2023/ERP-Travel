'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ArrowLeft, ArrowRight, Check, Send, CalendarIcon, Clock, Info, Eye, Pencil, TestTube2 } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useAudiences, useCreateCampaign } from '@/hooks/use-campaigns'
import { useEmailTemplates, useSendTestEmail } from '@/hooks/use-email-templates'
import { useTranslation } from '@/i18n'
import { CAMPAIGN_VARIABLES } from '@/components/editor'
import { useToast } from '@/hooks/use-toast'

const RichTextEditor = dynamic(
  () => import('@/components/editor').then((m) => ({ default: m.RichTextEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] animate-pulse rounded-lg bg-[var(--crm-bg-subtle)]" />
    ),
  }
)

const STEP_KEYS = [
  { labelKey: 'campaigns.stepBasics', key: 'basics' },
  { labelKey: 'campaigns.stepAudience', key: 'audience' },
  { labelKey: 'campaigns.stepContent', key: 'content' },
  { labelKey: 'campaigns.stepSend', key: 'send' },
] as const

// Generate time options in 15-min increments
const TIME_OPTIONS: string[] = []
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 15) {
    TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
  }
}

export default function NewCampaignPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(0)
  const { data: audiences } = useAudiences()
  const { data: templates } = useEmailTemplates()
  const createCampaign = useCreateCampaign()
  const sendTest = useSendTestEmail()

  const [form, setForm] = useState({
    name: '',
    subject: '',
    type: 'EMAIL',
    audienceId: '',
    content: '',
    enableAB: false,
    variantBSubject: '',
    variantBContent: '',
    splitPercent: 50,
  })

  const [sendMode, setSendMode] = useState<'immediate' | 'scheduled'>('immediate')
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined)
  const [scheduleTime, setScheduleTime] = useState('09:00')
  const [contentTab, setContentTab] = useState<'compose' | 'preview'>('compose')

  const update = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }))

  const getScheduledAt = (): string | null => {
    if (sendMode !== 'scheduled' || !scheduleDate) return null
    const [hours, minutes] = scheduleTime.split(':').map(Number)
    const dt = new Date(scheduleDate)
    dt.setHours(hours, minutes, 0, 0)
    return dt.toISOString()
  }

  const isScheduleValid = (): boolean => {
    if (sendMode === 'immediate') return true
    if (!scheduleDate) return false
    const scheduledAt = getScheduledAt()
    if (!scheduledAt) return false
    return new Date(scheduledAt) > new Date()
  }

  const handleCreate = () => {
    const scheduledAt = getScheduledAt()
    createCampaign.mutate(
      {
        name: form.name,
        subject: form.subject,
        content: form.content,
        type: form.type,
        audienceId: form.audienceId || undefined,
        scheduledAt: scheduledAt || undefined,
      },
      {
        onSuccess: (data: any) => {
          router.push(`/campaigns/${data.id}`)
        },
      }
    )
  }

  const handleSelectTemplate = (templateId: string) => {
    const tpl = templates?.find((t: any) => t.id === templateId)
    if (!tpl) return

    if (form.content && form.content !== '<p></p>') {
      if (!confirm(t('templates.overwriteConfirm'))) return
    }

    setForm((prev) => ({
      ...prev,
      subject: tpl.subject,
      content: tpl.body,
    }))
  }

  const handleTestSend = () => {
    if (!form.subject || !form.content) return
    sendTest.mutate(
      { subject: form.subject, body: form.content },
      {
        onSuccess: (data) => {
          toast({
            title: t('templates.testSent'),
            description: t('templates.testSentTo', { email: data.to }),
          })
        },
        onError: () => {
          toast({
            title: t('templates.testError'),
            variant: 'destructive',
          })
        },
      }
    )
  }

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  return (
    <PageShell
      title={t('campaigns.create')}
      actions={
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] hover:bg-[var(--crm-bg-subtle)]"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          {t('common.back')}
        </Button>
      }
    >
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-4">
        {STEP_KEYS.map((s, idx) => (
          <div key={s.key} className="flex items-center gap-2">
            <button
              onClick={() => setStep(idx)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                idx === step
                  ? 'bg-[#10B981]/10 text-[#10B981]'
                  : idx < step
                  ? 'bg-[#10B981]/5 text-[#10B981]/60'
                  : 'bg-[var(--crm-bg-subtle)] text-[var(--crm-text-muted)]'
              }`}
            >
              {idx < step ? <Check className="w-3 h-3" /> : <span>{idx + 1}</span>}
              {t(s.labelKey)}
            </button>
            {idx < STEP_KEYS.length - 1 && <div className="w-8 h-px bg-[var(--crm-border)]" />}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="glass-card-static p-6">
        {step === 0 && (
          <div className="space-y-5 max-w-lg">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">{t('campaigns.campaignName')}</Label>
              <Input
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder={t('campaigns.campaignNamePlaceholder')}
                className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">{t('campaigns.emailSubject')}</Label>
              <Input
                value={form.subject}
                onChange={(e) => update('subject', e.target.value)}
                placeholder={t('campaigns.emailSubjectPlaceholder')}
                className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">{t('campaigns.typeLabel')}</Label>
              <Select value={form.type} onValueChange={(v) => update('type', v)}>
                <SelectTrigger className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
                  <SelectItem value="EMAIL" className="text-[var(--crm-text-primary)] focus:bg-[var(--crm-bg-subtle)] focus:text-[var(--crm-text-primary)]">Email</SelectItem>
                  <SelectItem value="SMS" className="text-[var(--crm-text-primary)] focus:bg-[var(--crm-bg-subtle)] focus:text-[var(--crm-text-primary)]">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5 max-w-lg">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">{t('campaigns.audienceLabel')}</Label>
              <Select value={form.audienceId} onValueChange={(v) => update('audienceId', v)}>
                <SelectTrigger className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)]">
                  <SelectValue placeholder={t('campaigns.selectAudience')} />
                </SelectTrigger>
                <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
                  {audiences?.map((a: any) => (
                    <SelectItem key={a.id} value={a.id} className="text-[var(--crm-text-primary)] focus:bg-[var(--crm-bg-subtle)] focus:text-[var(--crm-text-primary)]">
                      {a.name} ({t('campaigns.nContacts', { n: a._count?.members || 0 })})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!audiences || audiences.length === 0 ? (
              <p className="text-sm text-[var(--crm-text-muted)]">
                {t('campaigns.noAudience')}
              </p>
            ) : null}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            {/* Template selector */}
            {templates && templates.length > 0 && (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-[var(--crm-text-secondary)]">{t('templates.fromTemplate')}</span>
                <Select onValueChange={handleSelectTemplate}>
                  <SelectTrigger className="w-64 input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)]">
                    <SelectValue placeholder={t('templates.selectTemplate')} />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
                    {templates.map((tpl: any) => (
                      <SelectItem key={tpl.id} value={tpl.id} className="text-[var(--crm-text-primary)] focus:bg-[var(--crm-bg-subtle)] focus:text-[var(--crm-text-primary)]">
                        {tpl.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-[var(--crm-text-muted)]">{t('templates.startFromScratch')}</span>
              </div>
            )}

            {/* Compose / Preview toggle */}
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">
                {t('campaigns.emailContent')}
              </Label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setContentTab('compose')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    contentTab === 'compose'
                      ? 'bg-[#10B981]/10 text-[#10B981]'
                      : 'text-[var(--crm-text-muted)] hover:text-[var(--crm-text-primary)]'
                  }`}
                >
                  <Pencil className="w-3 h-3" />
                  {t('templates.compose')}
                </button>
                <button
                  type="button"
                  onClick={() => setContentTab('preview')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    contentTab === 'preview'
                      ? 'bg-[#10B981]/10 text-[#10B981]'
                      : 'text-[var(--crm-text-muted)] hover:text-[var(--crm-text-primary)]'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  {t('templates.preview')}
                </button>
              </div>
            </div>

            {contentTab === 'compose' ? (
              <RichTextEditor
                value={form.content}
                onChange={(html) => update('content', html)}
                variables={CAMPAIGN_VARIABLES}
                placeholder={t('campaigns.emailContentPlaceholder')}
                minHeight={300}
              />
            ) : (
              <div className="mx-auto max-w-[600px] rounded-lg border border-[var(--crm-border)] bg-white p-6 dark:bg-gray-900">
                <RichTextEditor
                  value={form.content}
                  onChange={() => {}}
                  readOnly
                  variables={CAMPAIGN_VARIABLES}
                  minHeight={200}
                />
              </div>
            )}

            {/* Test send button */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestSend}
                disabled={sendTest.isPending || !form.subject || !form.content}
                className="border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)]"
              >
                <TestTube2 className="w-3.5 h-3.5 mr-1.5" />
                {sendTest.isPending ? '...' : t('templates.testSend')}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 max-w-lg">
            <div className="glass-card-static p-4 space-y-3">
              <h3 className="text-sm font-medium text-[var(--crm-text-primary)]">{t('campaigns.overview')}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--crm-text-muted)]">{t('campaigns.nameLabel')}</span>
                  <span className="text-[var(--crm-text-primary)]">{form.name || '--'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--crm-text-muted)]">{t('campaigns.subjectLabel')}</span>
                  <span className="text-[var(--crm-text-primary)]">{form.subject || '--'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--crm-text-muted)]">{t('campaigns.audienceLabel')}</span>
                  <span className="text-[var(--crm-text-primary)]">
                    {audiences?.find((a: any) => a.id === form.audienceId)?.name || t('campaigns.notSelected')}
                  </span>
                </div>
              </div>
            </div>

            {/* Scheduling section */}
            <div className="glass-card-static p-4 space-y-4">
              <h3 className="text-sm font-medium text-[var(--crm-text-primary)]">{t('campaigns.sendTiming')}</h3>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="sendMode"
                    checked={sendMode === 'immediate'}
                    onChange={() => setSendMode('immediate')}
                    className="w-4 h-4 accent-[#10B981]"
                  />
                  <span className="text-sm text-[var(--crm-text-primary)] group-hover:text-[#10B981] transition-colors">
                    {t('campaigns.sendImmediately')}
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="sendMode"
                    checked={sendMode === 'scheduled'}
                    onChange={() => setSendMode('scheduled')}
                    className="w-4 h-4 accent-[#10B981]"
                  />
                  <span className="text-sm text-[var(--crm-text-primary)] group-hover:text-[#10B981] transition-colors">
                    {t('campaigns.scheduleForLater')}
                  </span>
                </label>
              </div>

              {sendMode === 'scheduled' && (
                <div className="space-y-3 pl-7">
                  <div className="flex items-center gap-3">
                    {/* Date picker */}
                    <div className="flex-1">
                      <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide mb-1.5 block">
                        {t('campaigns.scheduleDateLabel')}
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal border-[var(--crm-border)] bg-[var(--crm-bg-page)] text-[var(--crm-text-primary)] hover:bg-[var(--crm-bg-subtle)]"
                          >
                            <CalendarIcon className="w-4 h-4 mr-2 text-[var(--crm-text-muted)]" />
                            {scheduleDate
                              ? format(scheduleDate, 'dd/MM/yyyy', { locale: vi })
                              : <span className="text-[var(--crm-text-muted)]">--/--/----</span>
                            }
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-[var(--crm-bg-card)] border-[var(--crm-border)]" align="start">
                          <Calendar
                            mode="single"
                            selected={scheduleDate}
                            onSelect={setScheduleDate}
                            disabled={(date) => date < tomorrow}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Time picker */}
                    <div className="w-32">
                      <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide mb-1.5 block">
                        {t('campaigns.scheduleTimeLabel')}
                      </Label>
                      <Select value={scheduleTime} onValueChange={setScheduleTime}>
                        <SelectTrigger className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)]">
                          <Clock className="w-4 h-4 mr-2 text-[var(--crm-text-muted)]" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)] max-h-60">
                          {TIME_OPTIONS.map((time) => (
                            <SelectItem key={time} value={time} className="text-[var(--crm-text-primary)] focus:bg-[var(--crm-bg-subtle)] focus:text-[var(--crm-text-primary)]">
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Schedule validation error */}
                  {scheduleDate && !isScheduleValid() && (
                    <p className="text-xs text-red-400">{t('campaigns.pastDateError')}</p>
                  )}

                  {/* Hint */}
                  <div className="flex items-start gap-2 text-xs text-[var(--crm-text-muted)]">
                    <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{t('campaigns.scheduleHint')}</span>
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleCreate}
              disabled={createCampaign.isPending || !form.name || !form.subject || (sendMode === 'scheduled' && !isScheduleValid())}
              className="btn-accent-glow w-full"
            >
              <Send className="w-4 h-4 mr-1.5" />
              {createCampaign.isPending ? t('common.creating') : t('campaigns.create')}
            </Button>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-4">
        <Button
          variant="outline"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] hover:bg-[var(--crm-bg-subtle)]"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          {t('common.back')}
        </Button>
        {step < STEP_KEYS.length - 1 && (
          <Button
            onClick={() => setStep((s) => Math.min(STEP_KEYS.length - 1, s + 1))}
            className="btn-accent-glow"
          >
            {t('campaigns.continue')}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        )}
      </div>
    </PageShell>
  )
}
