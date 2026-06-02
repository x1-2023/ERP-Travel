'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ArrowLeft, Save, Eye, Pencil, TestTube2 } from 'lucide-react'
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
import {
  useEmailTemplate,
  useUpdateEmailTemplate,
  useSendTestEmail,
} from '@/hooks/use-email-templates'
import { useTranslation } from '@/i18n'
import { useToast } from '@/hooks/use-toast'
import { CAMPAIGN_VARIABLES } from '@/components/editor'

const RichTextEditor = dynamic(
  () => import('@/components/editor').then((m) => ({ default: m.RichTextEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] animate-pulse rounded-lg bg-[var(--crm-bg-subtle)]" />
    ),
  }
)

export default function EditTemplatePage() {
  const { t } = useTranslation()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const id = params.id as string

  const { data: template, isLoading } = useEmailTemplate(id)
  const updateTemplate = useUpdateEmailTemplate()
  const sendTest = useSendTestEmail()

  const [form, setForm] = useState({
    name: '',
    subject: '',
    body: '',
    category: 'campaign',
  })
  const [tab, setTab] = useState<'compose' | 'preview'>('compose')
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (template && !initialized) {
      setForm({
        name: template.name || '',
        subject: template.subject || '',
        body: template.body || '',
        category: template.category || 'campaign',
      })
      setInitialized(true)
    }
  }, [template, initialized])

  const handleSave = () => {
    updateTemplate.mutate(
      { id, ...form },
      {
        onSuccess: () => {
          toast({ title: t('templates.saved') })
        },
      }
    )
  }

  const handleTestSend = () => {
    if (!form.subject || !form.body) return
    sendTest.mutate(
      { subject: form.subject, body: form.body },
      {
        onSuccess: (data) => {
          toast({
            title: t('templates.testSent'),
            description: t('templates.testSentTo', { email: data.to }),
          })
        },
        onError: () => {
          toast({ title: t('templates.testError'), variant: 'destructive' })
        },
      }
    )
  }

  if (isLoading) {
    return (
      <PageShell title={t('templates.edit')}>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-[var(--crm-bg-subtle)]" />
          ))}
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell
      title={t('templates.edit')}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/campaigns/templates')}
            className="border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] hover:bg-[var(--crm-bg-subtle)]"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            {t('common.back')}
          </Button>
          <Button
            variant="outline"
            onClick={handleTestSend}
            disabled={sendTest.isPending || !form.subject || !form.body}
            className="border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)]"
          >
            <TestTube2 className="w-4 h-4 mr-1.5" />
            {t('templates.testSend')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateTemplate.isPending || !form.name || !form.subject}
            className="btn-accent-glow"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {updateTemplate.isPending ? '...' : t('common.save')}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Name + Category */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">
              {t('templates.name')} *
            </Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder={t('templates.namePlaceholder')}
              className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">
              {t('templates.category')}
            </Label>
            <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
              <SelectTrigger className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
                <SelectItem value="campaign" className="text-[var(--crm-text-primary)] focus:bg-[var(--crm-bg-subtle)] focus:text-[var(--crm-text-primary)]">
                  {t('templates.categoryCampaign')}
                </SelectItem>
                <SelectItem value="transactional" className="text-[var(--crm-text-primary)] focus:bg-[var(--crm-bg-subtle)] focus:text-[var(--crm-text-primary)]">
                  {t('templates.categoryTransactional')}
                </SelectItem>
                <SelectItem value="notification" className="text-[var(--crm-text-primary)] focus:bg-[var(--crm-bg-subtle)] focus:text-[var(--crm-text-primary)]">
                  {t('templates.categoryNotification')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Subject */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">
            {t('templates.subject')} *
          </Label>
          <Input
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            placeholder={t('templates.subjectPlaceholder')}
            className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)]"
          />
        </div>

        {/* Body — Compose/Preview toggle */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">
              {t('templates.body')}
            </Label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setTab('compose')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  tab === 'compose'
                    ? 'bg-[#10B981]/10 text-[#10B981]'
                    : 'text-[var(--crm-text-muted)] hover:text-[var(--crm-text-primary)]'
                }`}
              >
                <Pencil className="w-3 h-3" />
                {t('templates.compose')}
              </button>
              <button
                type="button"
                onClick={() => setTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  tab === 'preview'
                    ? 'bg-[#10B981]/10 text-[#10B981]'
                    : 'text-[var(--crm-text-muted)] hover:text-[var(--crm-text-primary)]'
                }`}
              >
                <Eye className="w-3 h-3" />
                {t('templates.preview')}
              </button>
            </div>
          </div>

          {tab === 'compose' ? (
            <RichTextEditor
              value={form.body}
              onChange={(html) => setForm((f) => ({ ...f, body: html }))}
              variables={CAMPAIGN_VARIABLES}
              placeholder={t('templates.bodyPlaceholder')}
              minHeight={350}
            />
          ) : (
            <div className="mx-auto max-w-[600px] rounded-lg border border-[var(--crm-border)] bg-white p-6 dark:bg-gray-900">
              <RichTextEditor
                value={form.body}
                onChange={() => {}}
                readOnly
                variables={CAMPAIGN_VARIABLES}
                minHeight={200}
              />
            </div>
          )}
        </div>
      </div>
    </PageShell>
  )
}
