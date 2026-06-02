'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  Edit,
  Handshake,
  FileText,
  MessageSquare,
  Phone,
  Mail,
  Users,
  CheckSquare,
  Coffee,
  Monitor,
  ArrowRight,
  Percent,
  Plus,
  ChevronDown,
  Check,
  Heart,
} from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDeal, useUpdateDeal } from '@/hooks/use-deals'
import { useActivities } from '@/hooks/use-activities'
import { usePipeline } from '@/hooks/use-pipeline'
import { formatCurrency, ACTIVITY_TYPES, DEFAULT_STAGES, DEAL_CONTACT_ROLES, DEAL_TYPES, getCurrencyInfo, LOSS_REASONS, COMPETITORS } from '@/lib/constants'
import { getHealthColor, HEALTH_COLORS } from '@/lib/analytics/health-score'
import { toast } from '@/hooks/use-toast'
import { useTranslation } from '@/i18n'
import { DocumentPanel } from '@/components/documents/DocumentPanel'
import { CompliancePanel } from '@/components/compliance/CompliancePanel'
import { DealChecklistPanel } from '@/components/compliance/DealChecklist'
import { ComplianceBadge } from '@/components/compliance/ComplianceBadge'

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Users,
  TASK: CheckSquare,
  NOTE: FileText,
  LUNCH: Coffee,
  DEMO: Monitor,
  FOLLOW_UP: ArrowRight,
}

export default function DealDetailPage() {
  const { t } = useTranslation()
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: deal, isLoading } = useDeal(id)
  const { data: activitiesData } = useActivities({ dealId: id, limit: 20 })
  const { data: pipelineData } = usePipeline()
  const updateDeal = useUpdateDeal()

  // Loss dialog state
  const [lossDialogOpen, setLossDialogOpen] = useState(false)
  const [pendingLostStageId, setPendingLostStageId] = useState<string | null>(null)
  const [lossForm, setLossForm] = useState({ reason: '', competitor: '', notes: '' })

  const pipelineStages = pipelineData?.stages ?? []

  const handleChangeStage = (stageId: string) => {
    // Check if the target stage is a "lost" stage
    const targetStage = pipelineStages.find((s) => s.id === stageId)
    if (targetStage?.isLost) {
      setPendingLostStageId(stageId)
      setLossForm({ reason: '', competitor: '', notes: '' })
      setLossDialogOpen(true)
      return
    }

    updateDeal.mutate(
      { id, stageId } as any,
      {
        onSuccess: () => {
          toast({ title: t('pipeline.stageUpdated') })
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

  const handleLossSubmit = () => {
    if (!pendingLostStageId || !lossForm.reason) return
    updateDeal.mutate(
      {
        id,
        stageId: pendingLostStageId,
        lostReason: lossForm.reason,
        competitorName: lossForm.competitor || undefined,
        notes: lossForm.notes ? `${deal?.notes ? deal.notes + '\n' : ''}[Lost] ${lossForm.notes}` : undefined,
      } as any,
      {
        onSuccess: () => {
          setLossDialogOpen(false)
          setPendingLostStageId(null)
          toast({ title: t('pipeline.stageUpdated') })
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

  if (isLoading) {
    return (
      <PageShell title="">
        <DealDetailSkeleton />
      </PageShell>
    )
  }

  if (!deal) {
    return (
      <PageShell title={t('pipeline.dealNotFound')}>
        <Card className="bg-[var(--crm-bg-card)] border-[var(--crm-border)]">
          <CardContent className="p-8 text-center space-y-3">
            <p className="text-sm text-[var(--crm-text-secondary)]">Deal không tồn tại hoặc đã bị xóa.</p>
            <Button variant="outline" size="sm" onClick={() => router.push('/pipeline')}>
              {t('pipeline.backToPipeline')}
            </Button>
          </CardContent>
        </Card>
      </PageShell>
    )
  }

  const createdDate = new Date(deal.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const expectedClose = deal.expectedCloseAt
    ? new Date(deal.expectedCloseAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'Chưa xác định'

  const activities = activitiesData?.data ?? []

  return (
    <PageShell
      title={deal.title}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push('/pipeline')}>
            <ArrowLeft className="w-4 h-4" />
            {t('common.back')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/pipeline/${id}/edit`)}
          >
            <Edit className="w-4 h-4" />
            Chỉnh sửa
          </Button>
        </div>
      }
    >
      {/* Header info */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-lg font-semibold text-emerald-400">
          {formatCurrency(Number(deal.value), deal.currency || 'VND')}
        </span>
        <Badge
          className="text-xs"
          style={{
            backgroundColor: `${deal.stage?.color}20`,
            color: deal.stage?.color,
            borderColor: `${deal.stage?.color}40`,
          }}
        >
          {deal.stage?.name}
        </Badge>
        {deal.company && (
          <Link
            href={`/companies/${deal.company.id}`}
            className="flex items-center gap-1.5 text-sm text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] transition-colors"
          >
            <Building2 className="w-3.5 h-3.5" />
            {deal.company.name}
          </Link>
        )}
        {(deal as any).partner && (
          <Link
            href={`/partners/${(deal as any).partner.id}`}
            className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#8B5CF6] hover:bg-[#8B5CF6]/25 transition-colors"
          >
            <Handshake className="w-3 h-3" />
            {(deal as any).partner.company?.name || 'Partner'}
          </Link>
        )}
        {deal.healthScore != null && (
          <span
            className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${getHealthColor(deal.healthScore)}20`,
              color: getHealthColor(deal.healthScore),
            }}
          >
            <Heart className="w-3 h-3" />
            {deal.healthScore}
          </span>
        )}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-4">
        {/* Left column: 2/3 */}
        <div className="lg:col-span-2 space-y-3">
          {/* Deal info card */}
          <Card className="bg-[var(--crm-bg-card)] border-[var(--crm-border)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-[var(--crm-text-secondary)]">
                Thông tin deal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <InfoItem
                  icon={<span className="text-emerald-400 font-bold text-sm">{getCurrencyInfo(deal.currency || 'VND').symbol}</span>}
                  label={t('common.value')}
                  value={formatCurrency(Number(deal.value), deal.currency || 'VND')}
                />
                <InfoItem
                  icon={<Percent className="w-3.5 h-3.5 text-[var(--crm-text-secondary)]" />}
                  label={t('pipeline.probability')}
                  value={`${deal.stage?.probability ?? 0}%`}
                />
                <InfoItem
                  icon={<Calendar className="w-3.5 h-3.5 text-[var(--crm-text-secondary)]" />}
                  label={t('pipeline.expectedCloseDate')}
                  value={expectedClose}
                />
                <InfoItem
                  icon={<Clock className="w-3.5 h-3.5 text-[var(--crm-text-secondary)]" />}
                  label={t('pipeline.createdDate')}
                  value={createdDate}
                />
              </div>
              {deal.notes && (
                <>
                  <Separator className="bg-[var(--crm-border)]" />
                  <div>
                    <p className="text-xs text-[var(--crm-text-muted)] mb-1">{t('common.notes')}</p>
                    <p className="text-sm text-[var(--crm-text-primary)] whitespace-pre-wrap">
                      {deal.notes}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Contacts */}
          {deal.contacts && deal.contacts.length > 0 && (
            <Card className="bg-[var(--crm-bg-card)] border-[var(--crm-border)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-[var(--crm-text-secondary)]">
                  {t('pipeline.contactsCount', { n: deal.contacts.length })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {deal.contacts.map((dc: any) => {
                    const roleInfo = DEAL_CONTACT_ROLES.find((r) => r.value === dc.role)
                    return (
                      <Link
                        key={dc.contact.id}
                        href={`/contacts/${dc.contact.id}`}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-white/[0.02] transition-colors"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={dc.contact.avatarUrl || undefined} />
                          <AvatarFallback className="text-xs bg-[var(--crm-border)] text-[var(--crm-text-secondary)]">
                            {dc.contact.firstName?.[0]}
                            {dc.contact.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-[var(--crm-text-primary)]">
                              {dc.contact.firstName} {dc.contact.lastName}
                            </p>
                            {dc.isPrimary && (
                              <span className="text-amber-400 text-xs">★</span>
                            )}
                          </div>
                          <p className="text-xs text-[var(--crm-text-muted)]">{dc.contact.email}</p>
                        </div>
                        {roleInfo && (
                          <Badge
                            variant="outline"
                            className="text-[10px] flex-shrink-0"
                            style={{ borderColor: roleInfo.color, color: roleInfo.color }}
                          >
                            {t(roleInfo.labelKey)}
                          </Badge>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity timeline */}
          <Card className="bg-[var(--crm-bg-card)] border-[var(--crm-border)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-[var(--crm-text-secondary)]">
                {t('nav.activities')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="text-sm text-[var(--crm-text-muted)] py-4 text-center">
                  {t('activities.empty')}
                </p>
              ) : (
                <div className="relative pl-6">
                  {/* Timeline line */}
                  <div className="absolute left-[11px] top-2 bottom-2 w-px bg-[var(--crm-border)]" />

                  {activities.map((activity) => {
                    const Icon = ACTIVITY_ICONS[activity.type] || FileText
                    const actType = ACTIVITY_TYPES.find((at) => at.value === activity.type)
                    const typeLabel = actType ? t(actType.labelKey) : activity.type
                    const date = new Date(activity.createdAt).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })

                    return (
                      <div key={activity.id} className="relative pb-4 last:pb-0">
                        {/* Dot */}
                        <div className="absolute -left-6 top-1 w-[22px] h-[22px] rounded-full bg-[var(--crm-bg-card)] border border-[var(--crm-border)] flex items-center justify-center">
                          <Icon className="w-3 h-3 text-[var(--crm-text-secondary)]" />
                        </div>
                        <div className="ml-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[var(--crm-text-primary)]">
                              {activity.subject || typeLabel}
                            </span>
                            <Badge variant="outline" className="text-[10px] text-[var(--crm-text-muted)] border-[var(--crm-border)]">
                              {typeLabel}
                            </Badge>
                          </div>
                          {activity.description && (
                            <p className="text-xs text-[var(--crm-text-secondary)] mt-1">
                              {activity.description}
                            </p>
                          )}
                          <p className="text-xs text-[var(--crm-text-muted)] mt-1">{date}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: 1/3 */}
        <div className="space-y-3">
          {/* Stage progress */}
          <Card className="bg-[var(--crm-bg-card)] border-[var(--crm-border)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-[var(--crm-text-secondary)]">
                Tiến trình
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {DEFAULT_STAGES.filter((s) => !s.isLost).map((stage) => {
                  const isCurrent = deal.stage?.name === stage.name
                  const currentOrder = DEFAULT_STAGES.findIndex(
                    (s) => s.name === deal.stage?.name
                  )
                  const stageOrder = DEFAULT_STAGES.findIndex(
                    (s) => s.name === stage.name
                  )
                  const isPast = stageOrder < currentOrder

                  return (
                    <div
                      key={stage.name}
                      className="flex items-center gap-3 py-2 px-2 rounded-md"
                      style={
                        isCurrent
                          ? { backgroundColor: `${stage.color}10` }
                          : undefined
                      }
                    >
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                        style={{
                          borderColor: isPast || isCurrent ? stage.color : 'rgba(255,255,255,0.1)',
                          backgroundColor: isPast ? stage.color : 'transparent',
                        }}
                      >
                        {isPast && <Check className="w-3 h-3 text-white" />}
                        {isCurrent && (
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: stage.color }}
                          />
                        )}
                      </div>
                      <span
                        className={`text-sm ${
                          isCurrent
                            ? 'font-medium text-[var(--crm-text-primary)]'
                            : isPast
                            ? 'text-[var(--crm-text-secondary)]'
                            : 'text-[var(--crm-text-muted)]'
                        }`}
                      >
                        {stage.name}
                      </span>
                      <span className="ml-auto text-xs text-[var(--crm-text-muted)]">
                        {stage.probability}%
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card className="bg-[var(--crm-bg-card)] border-[var(--crm-border)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-[var(--crm-text-secondary)]">
                {t('pipeline.quickActions')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-[var(--crm-text-primary)]"
                onClick={() => router.push(`/activities/new?dealId=${id}`)}
              >
                <MessageSquare className="w-4 h-4" />
                {t('pipeline.logActivity')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-[var(--crm-text-primary)]"
                onClick={() => router.push(`/quotes/new?dealId=${id}`)}
              >
                <FileText className="w-4 h-4" />
                Tạo báo giá
              </Button>

              {/* Change stage dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-between text-[var(--crm-text-primary)]"
                  >
                    <span className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4" />
                      {t('pipeline.changeStage')}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-[var(--crm-text-muted)]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-[var(--crm-bg-hover)] border-[var(--crm-border)]"
                >
                  {pipelineStages.map((stage) => (
                    <DropdownMenuItem
                      key={stage.id}
                      className="flex items-center gap-2 text-[var(--crm-text-primary)] focus:bg-[var(--crm-bg-subtle)] focus:text-[var(--crm-text-primary)]"
                      onClick={() => handleChangeStage(stage.id)}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: stage.color }}
                      />
                      {stage.name}
                      {deal.stage?.id === stage.id && (
                        <Check className="w-3.5 h-3.5 ml-auto text-emerald-400" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>

          {/* Compliance */}
          {deal.company && (
            <CompliancePanel
              entityType="DEAL"
              entityId={id}
              entityName={deal.company.name}
              country={deal.company.country || 'VN'}
              complianceStatus={deal.complianceStatus}
            />
          )}

          {/* Deal Checklist */}
          <DealChecklistPanel dealId={id} />

          {/* Documents */}
          <DocumentPanel entityType="deal" entityId={id} />

          {/* Owner */}
          {deal.owner && (
            <Card className="bg-[var(--crm-bg-card)] border-[var(--crm-border)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-[var(--crm-text-secondary)]">
                  Người phụ trách
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={deal.owner.avatarUrl || undefined} />
                    <AvatarFallback className="bg-[var(--crm-border)] text-[var(--crm-text-secondary)] text-sm">
                      {deal.owner.name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-[var(--crm-text-primary)]">{deal.owner.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Loss reason dialog */}
      <Dialog open={lossDialogOpen} onOpenChange={setLossDialogOpen}>
        <DialogContent className="bg-[var(--crm-bg-card)] border-[var(--crm-border)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--crm-text-primary)]">
              {t('pipeline.lossDialog.title')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-[var(--crm-text-secondary)]">
                {t('pipeline.lossDialog.reason')} *
              </Label>
              <Select value={lossForm.reason} onValueChange={(v) => setLossForm((f) => ({ ...f, reason: v }))}>
                <SelectTrigger className="bg-[var(--crm-bg-input)] border-[var(--crm-border)] text-[var(--crm-text-primary)]">
                  <SelectValue placeholder={t('pipeline.lossDialog.selectReason')} />
                </SelectTrigger>
                <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
                  {LOSS_REASONS.map((lr) => (
                    <SelectItem key={lr.value} value={lr.value} className="text-[var(--crm-text-primary)]">
                      {t(lr.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--crm-text-secondary)]">
                {t('pipeline.lossDialog.competitor')}
              </Label>
              <Select value={lossForm.competitor} onValueChange={(v) => setLossForm((f) => ({ ...f, competitor: v }))}>
                <SelectTrigger className="bg-[var(--crm-bg-input)] border-[var(--crm-border)] text-[var(--crm-text-primary)]">
                  <SelectValue placeholder={t('pipeline.lossDialog.selectCompetitor')} />
                </SelectTrigger>
                <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
                  {COMPETITORS.map((c) => (
                    <SelectItem key={c} value={c} className="text-[var(--crm-text-primary)]">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--crm-text-secondary)]">
                {t('pipeline.lossDialog.notes')}
              </Label>
              <Textarea
                value={lossForm.notes}
                onChange={(e) => setLossForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder={t('pipeline.lossDialog.notesPlaceholder')}
                className="bg-[var(--crm-bg-input)] border-[var(--crm-border)] text-[var(--crm-text-primary)]"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLossDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleLossSubmit}
              disabled={!lossForm.reason || updateDeal.isPending}
            >
              {t('pipeline.lossDialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-xs text-[var(--crm-text-muted)]">{label}</span>
      </div>
      <p className="text-sm font-medium text-[var(--crm-text-primary)]">{value}</p>
    </div>
  )
}

function DealDetailSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 space-y-3">
          <Card className="bg-[var(--crm-bg-card)] border-[var(--crm-border)]">
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[var(--crm-bg-card)] border-[var(--crm-border)]">
            <CardContent className="p-5">
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-3">
          <Card className="bg-[var(--crm-bg-card)] border-[var(--crm-border)]">
            <CardContent className="p-5">
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
