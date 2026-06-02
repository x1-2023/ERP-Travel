'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  Percent,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Handshake,
} from 'lucide-react'

import { useTranslation } from '@/i18n'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { usePartner, useActionRegistration, useUpdateCommission } from '@/hooks/use-partners'
import {
  PARTNER_TYPES,
  CERTIFICATION_LEVELS,
  REGISTRATION_STATUSES,
  COMMISSION_STATUSES,
  formatCurrency,
  formatShortCurrency,
} from '@/lib/constants'
import { toast } from '@/hooks/use-toast'

type TabKey = 'registrations' | 'commissions' | 'deals' | 'info'

export default function PartnerDetailPage() {
  const { t } = useTranslation()
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [tab, setTab] = useState<TabKey>('registrations')

  const { data: partner, isLoading } = usePartner(id)
  const actionReg = useActionRegistration()
  const updateCommission = useUpdateCommission()

  if (isLoading) {
    return (
      <PageShell title={t('partner.detail')}>
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-60 rounded-xl" />
        </div>
      </PageShell>
    )
  }

  if (!partner) {
    return (
      <PageShell title={t('partner.detail')}>
        <div className="text-center py-20 text-[var(--crm-text-muted)]">Partner not found</div>
      </PageShell>
    )
  }

  const typeConst = PARTNER_TYPES.find((pt) => pt.value === partner.partnerType)
  const certConst = CERTIFICATION_LEVELS.find((cl) => cl.value === partner.certificationLevel)

  const handleApprove = (regId: string) => {
    actionReg.mutate(
      { partnerId: id, regId, data: { status: 'APPROVED' } },
      {
        onSuccess: () => toast({ description: 'Registration approved' }),
        onError: (err) => toast({ description: err.message, variant: 'destructive' }),
      }
    )
  }

  const handleReject = (regId: string) => {
    actionReg.mutate(
      { partnerId: id, regId, data: { status: 'REJECTED', rejectionNote: 'Declined by manager' } },
      {
        onSuccess: () => toast({ description: 'Registration rejected' }),
        onError: (err) => toast({ description: err.message, variant: 'destructive' }),
      }
    )
  }

  const handlePayCommission = (commId: string) => {
    updateCommission.mutate(
      { id: commId, data: { status: 'PAID' } },
      {
        onSuccess: () => toast({ description: 'Commission marked as paid' }),
        onError: (err) => toast({ description: err.message, variant: 'destructive' }),
      }
    )
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'registrations', label: t('partner.tab.registrations') },
    { key: 'commissions', label: t('partner.tab.commissions') },
    { key: 'deals', label: t('partner.tab.deals') },
    { key: 'info', label: t('partner.tab.info') },
  ]

  return (
    <PageShell
      title={partner.company?.name || t('partner.detail')}
      actions={
        <Link href="/partners">
          <Button
            variant="outline"
            size="sm"
            className="border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)]"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Button>
        </Link>
      }
    >
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card className="glass-card-static">
          <CardContent className="p-4 text-center">
            <DollarSign className="h-5 w-5 mx-auto mb-1 text-[#10B981]" />
            <div className="text-lg font-bold text-[var(--crm-text-primary)]">
              {formatShortCurrency(partner.stats.totalCommissionPaid)}
            </div>
            <div className="text-xs text-[var(--crm-text-muted)]">{t('partner.commission.paidTotal')}</div>
          </CardContent>
        </Card>
        <Card className="glass-card-static">
          <CardContent className="p-4 text-center">
            <Clock className="h-5 w-5 mx-auto mb-1 text-[#F59E0B]" />
            <div className="text-lg font-bold text-[var(--crm-text-primary)]">
              {formatShortCurrency(partner.stats.totalCommissionPending)}
            </div>
            <div className="text-xs text-[var(--crm-text-muted)]">{t('partner.commission.pendingTotal')}</div>
          </CardContent>
        </Card>
        <Card className="glass-card-static">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-5 w-5 mx-auto mb-1 text-[#3B82F6]" />
            <div className="text-lg font-bold text-[var(--crm-text-primary)]">
              {partner.stats.wonDeals}
            </div>
            <div className="text-xs text-[var(--crm-text-muted)]">{t('partner.stats.wonDeals')}</div>
          </CardContent>
        </Card>
        <Card className="glass-card-static">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-[#8B5CF6]" />
            <div className="text-lg font-bold text-[var(--crm-text-primary)]">
              {formatShortCurrency(partner.stats.pipelineValue)}
            </div>
            <div className="text-xs text-[var(--crm-text-muted)]">{t('partner.stats.pipelineValue')}</div>
          </CardContent>
        </Card>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {typeConst && (
          <Badge variant="outline" className="text-xs border-none" style={{ backgroundColor: `${typeConst.color}20`, color: typeConst.color }}>
            {t(typeConst.labelKey)}
          </Badge>
        )}
        {certConst && (
          <Badge variant="outline" className="text-xs border-none" style={{ backgroundColor: `${certConst.color}20`, color: certConst.color }}>
            {t(certConst.labelKey)}
          </Badge>
        )}
        {partner.territory && (
          <Badge variant="outline" className="text-xs border-none bg-[var(--crm-bg-subtle)] text-[var(--crm-text-secondary)]">
            <MapPin className="h-3 w-3 mr-1" />
            {partner.territory}
          </Badge>
        )}
        <Badge
          variant="outline"
          className="text-xs border-none"
          style={{
            backgroundColor: partner.isActive ? 'rgba(16,185,129,0.15)' : 'rgba(107,114,128,0.15)',
            color: partner.isActive ? '#10B981' : '#6B7280',
          }}
        >
          {partner.isActive ? t('partner.active') : t('partner.inactive')}
        </Badge>
        <Badge variant="outline" className="text-xs border-none bg-[var(--crm-bg-subtle)] text-[var(--crm-accent-text)]">
          <Percent className="h-3 w-3 mr-1" />
          {partner.commissionRate}%
        </Badge>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-[var(--crm-border)]">
        {tabs.map((t_item) => (
          <button
            key={t_item.key}
            onClick={() => setTab(t_item.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t_item.key
                ? 'border-[#10B981] text-[#10B981]'
                : 'border-transparent text-[var(--crm-text-muted)] hover:text-[var(--crm-text-secondary)]'
            }`}
          >
            {t_item.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'registrations' && (
        <Card className="glass-card-static">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-[var(--crm-border)]">
                  <TableHead className="text-[var(--crm-text-muted)]">Deal</TableHead>
                  <TableHead className="text-[var(--crm-text-muted)]">Status</TableHead>
                  <TableHead className="text-[var(--crm-text-muted)]">{t('partner.reg.expiresAt')}</TableHead>
                  <TableHead className="text-[var(--crm-text-muted)]">Approved By</TableHead>
                  <TableHead className="text-[var(--crm-text-muted)]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!partner.registrations || partner.registrations.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-[var(--crm-text-muted)] py-8">
                      No registrations
                    </TableCell>
                  </TableRow>
                )}
                {partner.registrations?.map((reg) => {
                  const statusConst = REGISTRATION_STATUSES.find((s) => s.value === reg.status)
                  return (
                    <TableRow key={reg.id} className="border-[var(--crm-border)]">
                      <TableCell>
                        <Link
                          href={`/pipeline/${reg.dealId}`}
                          className="text-[var(--crm-accent-text)] hover:underline text-sm"
                        >
                          {reg.deal?.title || reg.dealId}
                        </Link>
                        {reg.deal?.value && (
                          <div className="text-xs text-[var(--crm-text-muted)]">
                            {formatCurrency(Number(reg.deal.value), reg.deal.currency || 'VND')}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {statusConst && (
                          <Badge
                            variant="outline"
                            className="text-xs border-none"
                            style={{ backgroundColor: `${statusConst.color}20`, color: statusConst.color }}
                          >
                            {t(statusConst.labelKey)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-[var(--crm-text-secondary)]">
                        {new Date(reg.expiresAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm text-[var(--crm-text-secondary)]">
                        {reg.approvedBy?.name || '—'}
                      </TableCell>
                      <TableCell>
                        {reg.status === 'PENDING' && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs border-[#10B981] text-[#10B981] hover:bg-[#10B981]/10"
                              onClick={() => handleApprove(reg.id)}
                              disabled={actionReg.isPending}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {t('partner.reg.approve')}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444]/10"
                              onClick={() => handleReject(reg.id)}
                              disabled={actionReg.isPending}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              {t('partner.reg.reject')}
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {tab === 'commissions' && (
        <Card className="glass-card-static">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-[var(--crm-border)]">
                  <TableHead className="text-[var(--crm-text-muted)]">Deal</TableHead>
                  <TableHead className="text-[var(--crm-text-muted)]">Amount</TableHead>
                  <TableHead className="text-[var(--crm-text-muted)]">Rate</TableHead>
                  <TableHead className="text-[var(--crm-text-muted)]">Status</TableHead>
                  <TableHead className="text-[var(--crm-text-muted)]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!partner.commissions || partner.commissions.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-[var(--crm-text-muted)] py-8">
                      No commissions
                    </TableCell>
                  </TableRow>
                )}
                {partner.commissions?.map((comm) => {
                  const statusConst = COMMISSION_STATUSES.find((s) => s.value === comm.status)
                  return (
                    <TableRow key={comm.id} className="border-[var(--crm-border)]">
                      <TableCell>
                        <Link
                          href={`/pipeline/${comm.dealId}`}
                          className="text-[var(--crm-accent-text)] hover:underline text-sm"
                        >
                          {comm.deal?.title || comm.dealId}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-[var(--crm-text-primary)]">
                        {formatCurrency(comm.amount, comm.currency || 'VND')}
                      </TableCell>
                      <TableCell className="text-sm text-[var(--crm-text-secondary)]">
                        {comm.rate}%
                      </TableCell>
                      <TableCell>
                        {statusConst && (
                          <Badge
                            variant="outline"
                            className="text-xs border-none"
                            style={{ backgroundColor: `${statusConst.color}20`, color: statusConst.color }}
                          >
                            {t(statusConst.labelKey)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {comm.status === 'PENDING' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs border-[#10B981] text-[#10B981] hover:bg-[#10B981]/10"
                            onClick={() => handlePayCommission(comm.id)}
                            disabled={updateCommission.isPending}
                          >
                            <DollarSign className="h-3 w-3 mr-1" />
                            Mark Paid
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {tab === 'deals' && (
        <Card className="glass-card-static">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-[var(--crm-border)]">
                  <TableHead className="text-[var(--crm-text-muted)]">Deal</TableHead>
                  <TableHead className="text-[var(--crm-text-muted)]">Company</TableHead>
                  <TableHead className="text-[var(--crm-text-muted)]">Stage</TableHead>
                  <TableHead className="text-[var(--crm-text-muted)]">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!partner.deals || partner.deals.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-[var(--crm-text-muted)] py-8">
                      No deals
                    </TableCell>
                  </TableRow>
                )}
                {partner.deals?.map((deal) => (
                  <TableRow key={deal.id} className="border-[var(--crm-border)]">
                    <TableCell>
                      <Link
                        href={`/pipeline/${deal.id}`}
                        className="text-[var(--crm-accent-text)] hover:underline text-sm font-medium"
                      >
                        {deal.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-[var(--crm-text-secondary)]">
                      {deal.company?.name || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-xs border-none"
                        style={{ backgroundColor: `${deal.stage.color}20`, color: deal.stage.color }}
                      >
                        {deal.stage.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-[var(--crm-text-primary)]">
                      {formatCurrency(Number(deal.value))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {tab === 'info' && (
        <Card className="glass-card-static">
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-[var(--crm-text-muted)] uppercase tracking-wide mb-1">{t('partner.company')}</div>
                <div className="text-sm text-[var(--crm-text-primary)]">
                  <Link href={`/companies/${partner.companyId}`} className="text-[var(--crm-accent-text)] hover:underline">
                    {partner.company?.name}
                  </Link>
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--crm-text-muted)] uppercase tracking-wide mb-1">{t('partner.territory')}</div>
                <div className="text-sm text-[var(--crm-text-primary)]">{partner.territory || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--crm-text-muted)] uppercase tracking-wide mb-1">{t('partner.contractStart')}</div>
                <div className="text-sm text-[var(--crm-text-primary)]">
                  {partner.contractStartDate ? new Date(partner.contractStartDate).toLocaleDateString() : '—'}
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--crm-text-muted)] uppercase tracking-wide mb-1">{t('partner.contractEnd')}</div>
                <div className="text-sm text-[var(--crm-text-primary)]">
                  {partner.contractEndDate ? new Date(partner.contractEndDate).toLocaleDateString() : '—'}
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--crm-text-muted)] uppercase tracking-wide mb-1">{t('partner.commissionRate')}</div>
                <div className="text-sm text-[var(--crm-text-primary)]">{partner.commissionRate}%</div>
              </div>
              <div>
                <div className="text-xs text-[var(--crm-text-muted)] uppercase tracking-wide mb-1">Created</div>
                <div className="text-sm text-[var(--crm-text-primary)]">
                  {new Date(partner.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            {partner.notes && (
              <>
                <Separator className="bg-[var(--crm-border)]" />
                <div>
                  <div className="text-xs text-[var(--crm-text-muted)] uppercase tracking-wide mb-1">{t('common.notes')}</div>
                  <div className="text-sm text-[var(--crm-text-secondary)] whitespace-pre-wrap">{partner.notes}</div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </PageShell>
  )
}
