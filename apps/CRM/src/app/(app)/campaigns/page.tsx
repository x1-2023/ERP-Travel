'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Send, Mail, BarChart3, Users, CalendarIcon, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useCampaigns } from '@/hooks/use-campaigns'
import { usePermissions } from '@/hooks/use-permissions'
import { useTranslation } from '@/i18n'

const STATUS_KEYS: Record<string, { labelKey: string; color: string }> = {
  DRAFT: { labelKey: 'campaigns.statusDraft', color: '#6B7280' },
  SCHEDULED: { labelKey: 'campaigns.statusScheduled', color: '#F59E0B' },
  SENDING: { labelKey: 'campaigns.statusSending', color: '#F59E0B' },
  SENT: { labelKey: 'campaigns.statusSent', color: '#10B981' },
  PAUSED: { labelKey: 'campaigns.statusPaused', color: '#EF4444' },
  CANCELLED: { labelKey: 'campaigns.statusCancelled', color: '#6B7280' },
}

export default function CampaignsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { data: campaigns, isLoading } = useCampaigns()
  const { canManageCampaigns } = usePermissions()

  return (
    <PageShell
      title={t('campaigns.title')}
      description={t('campaigns.description')}
      actions={
        canManageCampaigns ? (
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] hover:bg-[var(--crm-bg-subtle)]">
              <Link href="/campaigns/templates">
                <FileText className="w-4 h-4 mr-1.5" />
                {t('templates.title')}
              </Link>
            </Button>
            <Button asChild className="btn-accent-glow">
              <Link href="/campaigns/new">
                <Plus className="w-4 h-4 mr-1.5" />
                {t('campaigns.create')}
              </Link>
            </Button>
          </div>
        ) : undefined
      }
    >
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass-card-static p-4">
              <Skeleton className="h-16 w-full bg-[var(--crm-bg-subtle)]" />
            </div>
          ))}
        </div>
      ) : !campaigns || campaigns.length === 0 ? (
        <div className="glass-card-static py-16 flex flex-col items-center justify-center text-center">
          <Mail className="w-12 h-12 text-[#333] mb-3" />
          <p className="text-[var(--crm-text-secondary)] text-sm">{t('campaigns.empty')}</p>
          <p className="text-[var(--crm-text-muted)] text-xs mt-1">{t('campaigns.emptyHint')}</p>
          {canManageCampaigns && (
            <Button asChild className="btn-accent-glow mt-4">
              <Link href="/campaigns/new">
                <Plus className="w-4 h-4 mr-1.5" />
                {t('campaigns.create')}
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign: any) => {
            const statusConfig = STATUS_KEYS[campaign.status] || { labelKey: '', color: '#6B7280' }
            const statusLabel = statusConfig.labelKey ? t(statusConfig.labelKey as any) : campaign.status
            const openRate = campaign.totalSent > 0
              ? ((campaign.totalOpened / campaign.totalSent) * 100).toFixed(1)
              : '0'
            const clickRate = campaign.totalSent > 0
              ? ((campaign.totalClicked / campaign.totalSent) * 100).toFixed(1)
              : '0'

            return (
              <div
                key={campaign.id}
                className="glass-card-static p-3 cursor-pointer hover:border-[var(--crm-border)] transition-colors"
                onClick={() => router.push(`/campaigns/${campaign.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-[var(--crm-text-primary)] truncate">{campaign.name}</h3>
                      <Badge
                        className="badge-premium border-0 text-[10px] px-1.5 py-0"
                        style={{ backgroundColor: `${statusConfig.color}20`, color: statusConfig.color }}
                      >
                        {statusLabel}
                      </Badge>
                    </div>
                    <p className="text-xs text-[var(--crm-text-muted)] mt-1 truncate">
                      {campaign.subject}
                      {campaign.status === 'SCHEDULED' && campaign.scheduledAt && (
                        <span className="inline-flex items-center gap-1 ml-2 text-amber-400">
                          <CalendarIcon className="w-3 h-3" />
                          {format(new Date(campaign.scheduledAt), "HH:mm dd/MM", { locale: vi })}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 ml-4">
                    <div className="text-center">
                      <p className="text-xs text-[var(--crm-text-muted)]">{t('campaigns.audienceLabel')}</p>
                      <p className="text-sm font-medium text-[var(--crm-text-primary)] flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {campaign.audience?._count?.members || 0}
                      </p>
                    </div>
                    {campaign.totalSent > 0 && (
                      <>
                        <div className="text-center">
                          <p className="text-xs text-[var(--crm-text-muted)]">{t('campaigns.sentCount')}</p>
                          <p className="text-sm font-medium text-[var(--crm-text-primary)] flex items-center gap-1">
                            <Send className="w-3 h-3" />
                            {campaign.totalSent}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-[var(--crm-text-muted)]">{t('campaigns.openedCount')}</p>
                          <p className="text-sm font-medium text-emerald-400">{openRate}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-[var(--crm-text-muted)]">{t('campaigns.clickedCount')}</p>
                          <p className="text-sm font-medium text-blue-400">{clickRate}%</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}
