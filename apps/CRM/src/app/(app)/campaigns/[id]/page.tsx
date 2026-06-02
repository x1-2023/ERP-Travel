'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Send, Mail, MousePointerClick, AlertCircle, Users, CalendarIcon, Clock, Pencil, X, Info } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCampaign, useSendCampaign, useUpdateCampaign, useCampaignStats } from '@/hooks/use-campaigns'
import { usePermissions } from '@/hooks/use-permissions'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useTranslation } from '@/i18n'

const STATUS_KEYS: Record<string, { labelKey: string; color: string }> = {
  DRAFT: { labelKey: 'campaigns.statusDraft', color: '#6B7280' },
  SCHEDULED: { labelKey: 'campaigns.statusScheduled', color: '#F59E0B' },
  SENDING: { labelKey: 'campaigns.statusSending', color: '#3B82F6' },
  SENT: { labelKey: 'campaigns.statusSent', color: '#10B981' },
  PAUSED: { labelKey: 'campaigns.statusPaused', color: '#EF4444' },
  CANCELLED: { labelKey: 'campaigns.statusCancelled', color: '#6B7280' },
}

// Generate time options in 15-min increments
const TIME_OPTIONS: string[] = []
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 15) {
    TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
  }
}

function formatScheduledAt(date: string | Date): string {
  const d = new Date(date)
  return format(d, "dd/MM/yyyy 'lúc' HH:mm", { locale: vi })
}

export default function CampaignDetailPage() {
  const { t } = useTranslation()
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { canManageCampaigns } = usePermissions()
  const id = params.id as string
  const { data: campaign, isLoading } = useCampaign(id)
  const sendCampaign = useSendCampaign()
  const updateCampaign = useUpdateCampaign()
  const [showConfirm, setShowConfirm] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showSendNowConfirm, setShowSendNowConfirm] = useState(false)
  const [showEditSchedule, setShowEditSchedule] = useState(false)
  const [editDate, setEditDate] = useState<Date | undefined>(undefined)
  const [editTime, setEditTime] = useState('09:00')

  // Fetch real stats for sent campaigns
  const isSent = campaign?.status === 'SENT' || campaign?.status === 'SENDING'
  const { data: stats } = useCampaignStats(id, isSent)

  if (isLoading) {
    return (
      <PageShell title={t('campaigns.title')}>
        <div className="space-y-4">
          <Skeleton className="h-8 w-64 bg-[var(--crm-bg-subtle)]" />
          <Skeleton className="h-40 w-full bg-[var(--crm-bg-subtle)]" />
        </div>
      </PageShell>
    )
  }

  if (!campaign) {
    return (
      <PageShell title={t('campaigns.title')}>
        <div className="text-center py-16 text-[var(--crm-text-secondary)]">{t('campaigns.notFound')}</div>
      </PageShell>
    )
  }

  const statusConfig = STATUS_KEYS[campaign.status] || { labelKey: '', color: '#6B7280' }
  const statusLabel = statusConfig.labelKey ? t(statusConfig.labelKey as any) : campaign.status

  // Use real stats if available, otherwise fallback to denormalized values
  const sent = stats?.sent ?? campaign.totalSent
  const openRate = stats ? stats.openRate.toFixed(1) : (campaign.totalSent > 0 ? ((campaign.totalOpened / campaign.totalSent) * 100).toFixed(1) : '0')
  const clickRate = stats ? stats.clickRate.toFixed(1) : (campaign.totalSent > 0 ? ((campaign.totalClicked / campaign.totalSent) * 100).toFixed(1) : '0')
  const bounceRate = stats ? stats.bounceRate.toFixed(1) : (campaign.totalSent > 0 ? ((campaign.totalBounced / campaign.totalSent) * 100).toFixed(1) : '0')
  const unsubscribed = stats?.unsubscribed ?? campaign.totalUnsubscribed
  const memberCount = campaign.audience?._count?.members || campaign.audience?.members?.length || 0

  const handleSend = () => {
    sendCampaign.mutate(id, {
      onSuccess: () => {
        setShowConfirm(false)
        setShowSendNowConfirm(false)
        toast({ description: t('campaigns.sentSuccess') })
      },
      onError: (error: any) => {
        setShowConfirm(false)
        setShowSendNowConfirm(false)
        toast({
          description: error.message || t('campaigns.sendError'),
          variant: 'destructive',
        })
      },
    })
  }

  const handleCancelSchedule = () => {
    updateCampaign.mutate(
      { id, scheduledAt: null, status: 'DRAFT' },
      {
        onSuccess: () => {
          setShowCancelConfirm(false)
          toast({ description: t('campaigns.scheduleCancelled') })
        },
      }
    )
  }

  const handleOpenEditSchedule = () => {
    if (campaign.scheduledAt) {
      const d = new Date(campaign.scheduledAt)
      setEditDate(d)
      setEditTime(`${String(d.getHours()).padStart(2, '0')}:${String(Math.floor(d.getMinutes() / 15) * 15).padStart(2, '0')}`)
    }
    setShowEditSchedule(true)
  }

  const handleSaveSchedule = () => {
    if (!editDate) return
    const [hours, minutes] = editTime.split(':').map(Number)
    const dt = new Date(editDate)
    dt.setHours(hours, minutes, 0, 0)

    if (dt <= new Date()) {
      toast({ description: t('campaigns.pastDateError'), variant: 'destructive' })
      return
    }

    updateCampaign.mutate(
      { id, scheduledAt: dt.toISOString() },
      {
        onSuccess: () => {
          setShowEditSchedule(false)
          toast({ description: t('campaigns.scheduleUpdated') })
        },
      }
    )
  }

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  const isScheduled = campaign.status === 'SCHEDULED'
  const canSend = canManageCampaigns && campaign.status === 'DRAFT'

  return (
    <PageShell
      title={campaign.name}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] hover:bg-[var(--crm-bg-subtle)]"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            {t('common.back')}
          </Button>
          {isScheduled && canManageCampaigns && (
            <>
              <Button
                variant="outline"
                onClick={handleOpenEditSchedule}
                className="border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] hover:bg-[var(--crm-bg-subtle)]"
              >
                <Pencil className="w-4 h-4 mr-1.5" />
                {t('campaigns.editSchedule')}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCancelConfirm(true)}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400"
              >
                <X className="w-4 h-4 mr-1.5" />
                {t('campaigns.cancelSchedule')}
              </Button>
              <Button
                onClick={() => setShowSendNowConfirm(true)}
                disabled={sendCampaign.isPending}
                className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
              >
                <Send className="w-4 h-4 mr-1.5" />
                {t('campaigns.sendNow')}
              </Button>
            </>
          )}
          {canSend && (
            <Button
              onClick={() => setShowConfirm(true)}
              disabled={sendCampaign.isPending}
              className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
            >
              <Send className="w-4 h-4 mr-1.5" />
              {sendCampaign.isPending ? t('common.sending') : t('campaigns.sendNow')}
            </Button>
          )}
        </div>
      }
    >
      {/* Status */}
      <div className="flex items-center gap-3">
        <Badge
          className="border-0 text-xs px-2 py-0.5"
          style={{ backgroundColor: `${statusConfig.color}20`, color: statusConfig.color }}
        >
          {statusLabel}
        </Badge>
        <span className="text-sm text-[var(--crm-text-muted)]">{t('campaigns.subject', { subject: campaign.subject })}</span>
        {campaign.type !== 'EMAIL' && (
          <Badge className="border-0 text-xs px-2 py-0.5 bg-amber-500/10 text-amber-400">
            {t('campaigns.notSupported', { type: campaign.type })}
          </Badge>
        )}
      </div>

      {/* Scheduled info banner */}
      {isScheduled && campaign.scheduledAt && (
        <div className="glass-card-static p-4 flex items-center gap-3 border-amber-500/20">
          <CalendarIcon className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-sm text-[var(--crm-text-primary)]">
            {t('campaigns.scheduledFor', { datetime: formatScheduledAt(campaign.scheduledAt) })}
          </span>
        </div>
      )}

      {/* Sent on schedule info */}
      {(campaign.status === 'SENT' || campaign.status === 'SENDING') && campaign.scheduledAt && (
        <div className="flex items-center gap-2 text-xs text-[var(--crm-text-muted)]">
          <CalendarIcon className="w-3.5 h-3.5" />
          {t('campaigns.scheduledSentAt', { datetime: formatScheduledAt(campaign.scheduledAt) })}
        </div>
      )}

      {/* Stats KPIs — real data */}
      {sent > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: t('campaigns.sentCount'), value: sent, icon: Send, color: 'text-blue-400' },
            { label: t('campaigns.openedCount'), value: `${openRate}%`, icon: Mail, color: 'text-emerald-400' },
            { label: t('campaigns.clickedCount'), value: `${clickRate}%`, icon: MousePointerClick, color: 'text-purple-400' },
            { label: t('campaigns.bounceCount'), value: `${bounceRate}%`, icon: AlertCircle, color: 'text-red-400' },
            { label: t('campaigns.unsubscribe'), value: unsubscribed, icon: Users, color: 'text-amber-400' },
          ].map((stat) => (
            <div key={stat.label} className="kpi-card">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-[var(--crm-text-secondary)] uppercase tracking-wide">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-[var(--crm-text-primary)]">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* A/B Variant Stats — real data */}
      {stats?.variants && stats.variants.length > 1 && (
        <div className="glass-card-static p-3">
          <h3 className="text-sm font-medium text-[var(--crm-text-primary)] mb-3">{t('campaigns.abTesting')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stats.variants.map((v: any, idx: number) => (
              <div key={v.variantId} className="glass-card-static p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[var(--crm-text-primary)]">
                    {idx === 0 ? 'Variant A' : 'Variant B'}: {v.variantName}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-[var(--crm-text-muted)]">{t('campaigns.sent', { n: v.sent })}</span>
                  <span className="text-emerald-400">{t('campaigns.opened', { n: v.opened, rate: v.openRate.toFixed(1) })}</span>
                  <span className="text-blue-400">Click: {v.clicked} ({v.clickRate.toFixed(1)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fallback A/B display for unsent campaigns */}
      {(!stats?.variants || stats.variants.length <= 1) && campaign.variants && campaign.variants.length > 1 && (
        <div className="glass-card-static p-3">
          <h3 className="text-sm font-medium text-[var(--crm-text-primary)] mb-3">{t('campaigns.abTesting')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {campaign.variants.map((v: any, idx: number) => (
              <div key={v.id} className="glass-card-static p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[var(--crm-text-primary)]">
                    {idx === 0 ? 'Variant A' : 'Variant B'}: {v.name}
                  </span>
                  <span className="text-xs text-[var(--crm-text-muted)]">{v.splitPercent}%</span>
                </div>
                <p className="text-xs text-[var(--crm-text-secondary)]">{t('campaigns.variantSubject', { subject: v.subject })}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audience info */}
      <div className="glass-card-static p-3">
        <h3 className="text-sm font-medium text-[var(--crm-text-primary)] mb-3">{t('campaigns.audienceLabel')}</h3>
        {campaign.audience ? (
          <p className="text-sm text-[var(--crm-text-secondary)]">
            {campaign.audience.name} ({t('campaigns.nContacts', { n: memberCount })})
          </p>
        ) : (
          <p className="text-sm text-[var(--crm-text-muted)]">{t('campaigns.noAudienceSelected')}</p>
        )}
      </div>

      {/* Content preview */}
      <div className="glass-card-static p-3">
        <h3 className="text-sm font-medium text-[var(--crm-text-primary)] mb-3">{t('campaigns.content')}</h3>
        <div className="text-sm text-[var(--crm-text-secondary)] whitespace-pre-wrap">
          {campaign.content || campaign.variants?.[0]?.content || t('campaigns.noContent')}
        </div>
      </div>

      {/* Send Confirmation Dialog (DRAFT → SEND) */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="bg-[var(--crm-bg-card)] border-[var(--crm-border)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--crm-text-primary)]">{t('campaigns.confirmSend')}</DialogTitle>
            <DialogDescription className="text-[var(--crm-text-secondary)]">
              {t('campaigns.confirmSendDesc', { name: campaign.name, count: memberCount })}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={sendCampaign.isPending}
              className="border-[var(--crm-border)] text-[var(--crm-text-secondary)]"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSend}
              disabled={sendCampaign.isPending}
              className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
            >
              <Send className="w-4 h-4 mr-1.5" />
              {sendCampaign.isPending ? t('common.sending') : t('campaigns.sendCampaign')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Now Override Dialog (SCHEDULED → immediate SEND) */}
      <Dialog open={showSendNowConfirm} onOpenChange={setShowSendNowConfirm}>
        <DialogContent className="bg-[var(--crm-bg-card)] border-[var(--crm-border)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--crm-text-primary)]">{t('campaigns.confirmSend')}</DialogTitle>
            <DialogDescription className="text-[var(--crm-text-secondary)]">
              {campaign.scheduledAt
                ? t('campaigns.confirmSendNow', { datetime: formatScheduledAt(campaign.scheduledAt) })
                : t('campaigns.confirmSendDesc', { name: campaign.name, count: memberCount })
              }
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowSendNowConfirm(false)}
              disabled={sendCampaign.isPending}
              className="border-[var(--crm-border)] text-[var(--crm-text-secondary)]"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSend}
              disabled={sendCampaign.isPending}
              className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
            >
              <Send className="w-4 h-4 mr-1.5" />
              {sendCampaign.isPending ? t('common.sending') : t('campaigns.sendNow')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Schedule Dialog */}
      <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <DialogContent className="bg-[var(--crm-bg-card)] border-[var(--crm-border)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--crm-text-primary)]">{t('campaigns.cancelSchedule')}</DialogTitle>
            <DialogDescription className="text-[var(--crm-text-secondary)]">
              {t('campaigns.confirmCancelSchedule', { name: campaign.name })}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowCancelConfirm(false)}
              disabled={updateCampaign.isPending}
              className="border-[var(--crm-border)] text-[var(--crm-text-secondary)]"
            >
              {t('campaigns.keepSchedule')}
            </Button>
            <Button
              onClick={handleCancelSchedule}
              disabled={updateCampaign.isPending}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <X className="w-4 h-4 mr-1.5" />
              {t('campaigns.cancelSchedule')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Schedule Dialog */}
      <Dialog open={showEditSchedule} onOpenChange={setShowEditSchedule}>
        <DialogContent className="bg-[var(--crm-bg-card)] border-[var(--crm-border)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--crm-text-primary)]">{t('campaigns.editScheduleTitle')}</DialogTitle>
            {campaign.scheduledAt && (
              <DialogDescription className="text-[var(--crm-text-secondary)]">
                {t('campaigns.currentSchedule', { datetime: formatScheduledAt(campaign.scheduledAt) })}
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="space-y-4 mt-2">
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
                      {editDate
                        ? format(editDate, 'dd/MM/yyyy', { locale: vi })
                        : '--/--/----'
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[var(--crm-bg-card)] border-[var(--crm-border)]" align="start">
                    <Calendar
                      mode="single"
                      selected={editDate}
                      onSelect={setEditDate}
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
                <Select value={editTime} onValueChange={setEditTime}>
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
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowEditSchedule(false)}
              disabled={updateCampaign.isPending}
              className="border-[var(--crm-border)] text-[var(--crm-text-secondary)]"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSaveSchedule}
              disabled={updateCampaign.isPending || !editDate}
              className="btn-accent-glow"
            >
              {t('campaigns.saveChanges')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
