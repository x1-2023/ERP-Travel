'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CalendarIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { useCreateDeal } from '@/hooks/use-deals'
import { useCompanies } from '@/hooks/use-companies'
import { usePipeline } from '@/hooks/use-pipeline'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/i18n'
import { CurrencySelect } from '@/components/currency/CurrencySelect'
import { DEAL_TYPES } from '@/lib/constants'

export default function NewDealPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const createDeal = useCreateDeal()
  const { data: companiesData } = useCompanies({ limit: 100 })
  const { data: pipelineData } = usePipeline()

  const [title, setTitle] = useState('')
  const [value, setValue] = useState('')
  const [currency, setCurrency] = useState('VND')
  const [dealType, setDealType] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [stageId, setStageId] = useState('')
  const [expectedCloseAt, setExpectedCloseAt] = useState<Date | undefined>()
  const [notes, setNotes] = useState('')
  const [calendarOpen, setCalendarOpen] = useState(false)

  const companies = companiesData?.data ?? []
  const stages = pipelineData?.stages ?? []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast({ title: t('common.error'), description: t('pipeline.dealRequired'), variant: 'destructive' })
      return
    }

    const pipelineId = (pipelineData as any)?.id ?? pipelineData?.config?.id
    const finalStageId = stageId || stages[0]?.id

    if (!finalStageId) {
      toast({
        title: t('common.error'),
        description: t('pipeline.selectStage'),
        variant: 'destructive',
      })
      return
    }

    createDeal.mutate(
      {
        title: title.trim(),
        value: parseFloat(value) || 0,
        currency,
        dealType: dealType || undefined,
        companyId: companyId || undefined,
        stageId: finalStageId,
        pipelineId: pipelineId || undefined,
        expectedCloseAt: expectedCloseAt?.toISOString(),
        notes: notes.trim() || undefined,
      } as any,
      {
        onSuccess: () => {
          toast({ title: t('pipeline.dealCreated') })
          router.push('/pipeline')
        },
        onError: (err) => {
          toast({
            title: t('common.error'),
            description: err.message,
            variant: 'destructive',
          })
        },
      }
    )
  }

  return (
    <PageShell
      title={t('pipeline.newDeal')}
      actions={
        <Button variant="outline" size="sm" onClick={() => router.push('/pipeline')}>
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Button>
      }
    >
      <Card className="bg-[var(--crm-bg-card)] border-[var(--crm-border)] max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[var(--crm-text-primary)]">
            Thông tin deal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-[var(--crm-text-secondary)]">
                Tên deal <span className="text-red-400">*</span>
              </Label>
              <Input
                id="title"
                placeholder={t('pipeline.dealTitlePlaceholder')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] placeholder:text-[var(--crm-text-muted)]"
              />
            </div>

            {/* Value + Currency */}
            <div className="space-y-2">
              <Label htmlFor="value" className="text-[var(--crm-text-secondary)]">
                {t('common.value')}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="value"
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="0"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="flex-1 bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] placeholder:text-[var(--crm-text-muted)]"
                />
                <CurrencySelect value={currency} onValueChange={setCurrency} className="w-[140px]" />
              </div>
            </div>

            {/* Deal Type */}
            <div className="space-y-2">
              <Label className="text-[var(--crm-text-secondary)]">{t('pipeline.dealType')}</Label>
              <Select value={dealType} onValueChange={setDealType}>
                <SelectTrigger className="bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)]">
                  <SelectValue placeholder={t('pipeline.selectDealType')} />
                </SelectTrigger>
                <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
                  {DEAL_TYPES.map((dt) => (
                    <SelectItem
                      key={dt.value}
                      value={dt.value}
                      className="text-[var(--crm-text-primary)] focus:bg-[var(--crm-bg-subtle)] focus:text-[var(--crm-text-primary)]"
                    >
                      {t(dt.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Company */}
            <div className="space-y-2">
              <Label className="text-[var(--crm-text-secondary)]">{t('contacts.company')}</Label>
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger className="bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)]">
                  <SelectValue placeholder={t('pipeline.selectCompany')} />
                </SelectTrigger>
                <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
                  {companies.map((company) => (
                    <SelectItem
                      key={company.id}
                      value={company.id}
                      className="text-[var(--crm-text-primary)] focus:bg-[var(--crm-bg-subtle)] focus:text-[var(--crm-text-primary)]"
                    >
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stage */}
            <div className="space-y-2">
              <Label className="text-[var(--crm-text-secondary)]">{t('pipeline.stage')}</Label>
              <Select value={stageId} onValueChange={setStageId}>
                <SelectTrigger className="bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)]">
                  <SelectValue placeholder={t('pipeline.selectStage')} />
                </SelectTrigger>
                <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
                  {stages.map((stage) => (
                    <SelectItem
                      key={stage.id}
                      value={stage.id}
                      className="text-[var(--crm-text-primary)] focus:bg-[var(--crm-bg-subtle)] focus:text-[var(--crm-text-primary)]"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: stage.color }}
                        />
                        {stage.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Expected close date */}
            <div className="space-y-2">
              <Label className="text-[var(--crm-text-secondary)]">{t('pipeline.expectedCloseDate')}</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal bg-[var(--crm-bg-page)] border-[var(--crm-border)]',
                      !expectedCloseAt && 'text-[var(--crm-text-muted)]'
                    )}
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {expectedCloseAt
                      ? format(expectedCloseAt, 'dd/MM/yyyy', { locale: vi })
                      : t('common.selectDate')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
                  <Calendar
                    mode="single"
                    selected={expectedCloseAt}
                    onSelect={(date) => {
                      setExpectedCloseAt(date)
                      setCalendarOpen(false)
                    }}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-[var(--crm-text-secondary)]">
                {t('common.notes')}
              </Label>
              <Textarea
                id="notes"
                rows={4}
                placeholder={t('pipeline.notesPlaceholder')}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] placeholder:text-[var(--crm-text-muted)] resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={createDeal.isPending}>
                {createDeal.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Tạo deal
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/pipeline')}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageShell>
  )
}
