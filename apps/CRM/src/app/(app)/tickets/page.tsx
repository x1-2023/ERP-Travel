'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LifeBuoy, MessageSquare } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useTickets } from '@/hooks/use-tickets'
import { useTranslation } from '@/i18n'

const STATUS_COLORS: Record<string, string> = {
  OPEN: '#10B981',
  IN_PROGRESS: '#3B82F6',
  WAITING_CUSTOMER: '#F59E0B',
  RESOLVED: '#8B5CF6',
  CLOSED: '#6B7280',
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#10B981',
  MEDIUM: '#F59E0B',
  HIGH: '#F97316',
  URGENT: '#EF4444',
}

const STATUSES = ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED'] as const
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const

function timeAgo(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'vừa xong'
  if (mins < 60) return `${mins}p trước`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h trước`
  const days = Math.floor(hours / 24)
  return `${days}d trước`
}

function SlaIndicator({ status }: { status: string | null }) {
  const { t } = useTranslation()
  if (!status) return <span className="text-[var(--crm-text-muted)]">--</span>
  const config: Record<string, { icon: string; label: string; cls: string }> = {
    on_track: { icon: '\uD83D\uDFE2', label: '', cls: '' },
    at_risk: { icon: '\uD83D\uDFE1', label: t('sla.atRisk' as any), cls: 'text-yellow-600 dark:text-yellow-400' },
    breached: { icon: '\uD83D\uDD34', label: t('sla.breached' as any), cls: 'text-red-600 dark:text-red-400' },
    met: { icon: '\u2705', label: '', cls: '' },
  }
  const c = config[status]
  if (!c) return null
  return (
    <span className={`text-xs ${c.cls}`} title={c.label}>
      {c.icon}{c.label && ` ${c.label}`}
    </span>
  )
}

export default function TicketsPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL')

  const params: Record<string, unknown> = { page, limit: 20 }
  if (statusFilter !== 'ALL') params.status = statusFilter
  if (priorityFilter !== 'ALL') params.priority = priorityFilter

  const { data, isLoading } = useTickets(params as any)
  const tickets = data?.data || []
  const pagination = data?.pagination

  return (
    <PageShell
      title={t('tickets.title' as any)}
    >
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-44 input-premium bg-[var(--crm-bg-card)] border-[var(--crm-border)] text-[var(--crm-text-primary)]">
            <SelectValue placeholder={t('tickets.allStatuses' as any)} />
          </SelectTrigger>
          <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
            <SelectItem value="ALL" className="text-[var(--crm-text-primary)] focus:bg-[var(--crm-bg-subtle)] focus:text-[var(--crm-text-primary)]">
              {t('tickets.allStatuses' as any)}
            </SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="text-[var(--crm-text-primary)] focus:bg-[var(--crm-bg-subtle)] focus:text-[var(--crm-text-primary)]">
                {t(`ticketStatus.${s}` as any)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setPage(1) }}>
          <SelectTrigger className="w-44 input-premium bg-[var(--crm-bg-card)] border-[var(--crm-border)] text-[var(--crm-text-primary)]">
            <SelectValue placeholder={t('tickets.allPriorities' as any)} />
          </SelectTrigger>
          <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
            <SelectItem value="ALL" className="text-[var(--crm-text-primary)] focus:bg-[var(--crm-bg-subtle)] focus:text-[var(--crm-text-primary)]">
              {t('tickets.allPriorities' as any)}
            </SelectItem>
            {PRIORITIES.map((p) => (
              <SelectItem key={p} value={p} className="text-[var(--crm-text-primary)] focus:bg-[var(--crm-bg-subtle)] focus:text-[var(--crm-text-primary)]">
                {t(`ticketPriority.${p}` as any)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="glass-card-static overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full bg-[var(--crm-bg-subtle)]" />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <LifeBuoy className="w-12 h-12 text-[var(--crm-text-muted)] mb-3" />
            <p className="text-[var(--crm-text-secondary)] text-sm">{t('tickets.empty' as any)}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-[var(--crm-border-subtle)] hover:bg-transparent">
                <TableHead className="text-[var(--crm-text-secondary)] text-[11px] font-semibold uppercase tracking-wide">#</TableHead>
                <TableHead className="text-[var(--crm-text-secondary)] text-[11px] font-semibold uppercase tracking-wide">{t('tickets.subject' as any)}</TableHead>
                <TableHead className="text-[var(--crm-text-secondary)] text-[11px] font-semibold uppercase tracking-wide">{t('tickets.customer' as any)}</TableHead>
                <TableHead className="text-[var(--crm-text-secondary)] text-[11px] font-semibold uppercase tracking-wide">{t('tickets.status' as any)}</TableHead>
                <TableHead className="text-[var(--crm-text-secondary)] text-[11px] font-semibold uppercase tracking-wide">{t('tickets.priority' as any)}</TableHead>
                <TableHead className="text-[var(--crm-text-secondary)] text-[11px] font-semibold uppercase tracking-wide">{t('sla.title' as any)}</TableHead>
                <TableHead className="text-[var(--crm-text-secondary)] text-[11px] font-semibold uppercase tracking-wide">{t('tickets.assignee' as any)}</TableHead>
                <TableHead className="text-[var(--crm-text-secondary)] text-[11px] font-semibold uppercase tracking-wide">{t('tickets.updated' as any)}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket: any) => {
                const statusColor = STATUS_COLORS[ticket.status] || '#6B7280'
                const priorityColor = PRIORITY_COLORS[ticket.priority] || '#6B7280'
                return (
                  <TableRow
                    key={ticket.id}
                    className="border-[var(--crm-border)] cursor-pointer hover:bg-[var(--crm-bg-subtle)]"
                    onClick={() => router.push(`/tickets/${ticket.id}`)}
                  >
                    <TableCell className="text-[var(--crm-text-muted)] font-mono text-xs">
                      {ticket.ticketNumber}
                    </TableCell>
                    <TableCell className="text-[var(--crm-text-primary)] font-medium max-w-[300px] truncate">
                      <div className="flex items-center gap-2">
                        {ticket.subject}
                        {ticket._count?.messages > 1 && (
                          <span className="flex items-center gap-0.5 text-[var(--crm-text-muted)] text-xs">
                            <MessageSquare className="w-3 h-3" />
                            {ticket._count.messages}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-[var(--crm-text-secondary)]">
                      {ticket.portalUser ? `${ticket.portalUser.firstName} ${ticket.portalUser.lastName}` : '--'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className="badge-premium border-0 text-[10px] px-1.5 py-0"
                        style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
                      >
                        {t(`ticketStatus.${ticket.status}` as any)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className="badge-premium border-0 text-[10px] px-1.5 py-0"
                        style={{ backgroundColor: `${priorityColor}20`, color: priorityColor }}
                      >
                        {t(`ticketPriority.${ticket.priority}` as any)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <SlaIndicator status={ticket.slaStatus} />
                    </TableCell>
                    <TableCell className="text-[var(--crm-text-secondary)] text-sm">
                      {ticket.assignee?.name || t('tickets.unassigned' as any)}
                    </TableCell>
                    <TableCell className="text-[var(--crm-text-muted)] text-xs">
                      {timeAgo(ticket.updatedAt)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--crm-text-muted)]">
            {pagination.total} {t('tickets.title' as any).toLowerCase()}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="text-[var(--crm-text-secondary)] border-[var(--crm-border)]"
            >
              {t('notifications.prev' as any)}
            </Button>
            <span className="text-xs text-[var(--crm-text-secondary)]">
              {page} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(page + 1)}
              className="text-[var(--crm-text-secondary)] border-[var(--crm-border)]"
            >
              {t('notifications.next' as any)}
            </Button>
          </div>
        </div>
      )}
    </PageShell>
  )
}
