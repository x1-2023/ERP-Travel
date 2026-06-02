'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Send, Lock, User, Building2, Mail, Clock, ExternalLink, Timer,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTicket, useUpdateTicket, useCreateTicketMessage } from '@/hooks/use-tickets'
import { useAuth } from '@/hooks/use-auth'
import { useTranslation } from '@/i18n'
import { VALID_TRANSITIONS } from '@/lib/validations'
import { useQuery } from '@tanstack/react-query'

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

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '--'
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

const SLA_STATUS_CONFIG: Record<string, { icon: string; colorClass: string; bgClass: string }> = {
  on_track: { icon: '\uD83D\uDFE2', colorClass: 'text-green-600 dark:text-green-400', bgClass: 'bg-green-500/10' },
  at_risk: { icon: '\uD83D\uDFE1', colorClass: 'text-yellow-600 dark:text-yellow-400', bgClass: 'bg-yellow-500/10' },
  breached: { icon: '\uD83D\uDD34', colorClass: 'text-red-600 dark:text-red-400', bgClass: 'bg-red-500/10' },
  met: { icon: '\u2705', colorClass: 'text-green-600 dark:text-green-400', bgClass: 'bg-green-500/10' },
}

function formatSlaRemaining(ms: number): string {
  const absMins = Math.abs(Math.floor(ms / 60000))
  if (absMins < 60) return `${absMins} phút`
  const hours = Math.floor(absMins / 60)
  const mins = absMins % 60
  if (hours < 24) {
    return mins > 0 ? `${hours}h ${mins}p` : `${hours} giờ`
  }
  const days = Math.floor(hours / 24)
  const rh = hours % 24
  return rh > 0 ? `${days}d ${rh}h` : `${days} ngày`
}

function SlaTimerDisplay({ label, timer }: { label: string; timer: { target: string; actual: string | null; remaining: number; status: string } }) {
  const { t } = useTranslation()
  const config = SLA_STATUS_CONFIG[timer.status] || SLA_STATUS_CONFIG.on_track
  const statusLabels: Record<string, string> = {
    on_track: t('sla.onTrack' as any),
    at_risk: t('sla.atRisk' as any),
    breached: t('sla.breached' as any),
    met: t('sla.met' as any),
  }

  return (
    <div className={`rounded-lg p-2.5 ${config.bgClass}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-[var(--crm-text-secondary)]">{label}</span>
        <span className={`text-xs font-semibold ${config.colorClass}`}>
          {config.icon} {statusLabels[timer.status]}
        </span>
      </div>
      {timer.status !== 'met' && (
        <p className={`text-xs ${config.colorClass}`}>
          {timer.remaining >= 0
            ? `Còn ${formatSlaRemaining(timer.remaining)}`
            : `Trễ ${formatSlaRemaining(timer.remaining)}`
          }
        </p>
      )}
      <p className="text-[10px] text-[var(--crm-text-muted)] mt-0.5">
        {t('sla.deadline' as any)}: {formatDate(timer.target)}
      </p>
    </div>
  )
}

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { t } = useTranslation()
  const { user: currentUser } = useAuth()
  const { data: ticket, isLoading } = useTicket(id)
  const updateTicket = useUpdateTicket()
  const createMessage = useCreateTicketMessage()

  const [replyContent, setReplyContent] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch users for assignee dropdown
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('/api/users')
      if (!res.ok) return []
      return res.json()
    },
    staleTime: 60_000,
  })

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [ticket?.messages?.length])

  const handleStatusChange = useCallback((status: string) => {
    updateTicket.mutate({ id, status })
  }, [id, updateTicket])

  const handlePriorityChange = useCallback((priority: string) => {
    updateTicket.mutate({ id, priority })
  }, [id, updateTicket])

  const handleAssigneeChange = useCallback((assigneeId: string) => {
    updateTicket.mutate({ id, assigneeId: assigneeId === 'NONE' ? null : assigneeId })
  }, [id, updateTicket])

  const handleAssignToMe = useCallback(() => {
    if (currentUser?.id) {
      updateTicket.mutate({ id, assigneeId: currentUser.id })
    }
  }, [id, currentUser, updateTicket])

  const handleSubmitReply = useCallback(() => {
    if (!replyContent.trim()) return
    createMessage.mutate(
      { ticketId: id, content: replyContent.trim(), isInternal },
      { onSuccess: () => setReplyContent('') }
    )
  }, [id, replyContent, isInternal, createMessage])

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48 bg-[var(--crm-bg-subtle)]" />
        <Skeleton className="h-64 w-full bg-[var(--crm-bg-subtle)]" />
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="p-6">
        <p className="text-[var(--crm-text-secondary)]">Ticket not found</p>
      </div>
    )
  }

  const validNextStatuses = VALID_TRANSITIONS[ticket.status] || []
  const customerName = ticket.portalUser
    ? `${ticket.portalUser.firstName} ${ticket.portalUser.lastName}`.trim()
    : 'Unknown'

  return (
    <div className="flex flex-col lg:flex-row gap-3 p-6 min-h-0">
      {/* Main column — messages + reply */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Header */}
        <div>
          <button
            onClick={() => router.push('/tickets')}
            className="flex items-center gap-1.5 text-sm text-[var(--crm-text-muted)] hover:text-[var(--crm-text-primary)] mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back' as any)}
          </button>
          <h1 className="text-xl font-bold text-[var(--crm-text-primary)]">
            {ticket.subject}
          </h1>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-xs font-mono text-[var(--crm-text-muted)]">{ticket.ticketNumber}</span>
            <Badge
              className="badge-premium border-0 text-[10px] px-1.5 py-0"
              style={{ backgroundColor: `${STATUS_COLORS[ticket.status]}20`, color: STATUS_COLORS[ticket.status] }}
            >
              {t(`ticketStatus.${ticket.status}` as any)}
            </Badge>
            <span className="text-xs text-[var(--crm-text-muted)]">{timeAgo(ticket.createdAt)}</span>
          </div>
        </div>

        {/* Message thread */}
        <div className="space-y-3 max-h-[calc(100vh-380px)] overflow-y-auto pr-1">
          {ticket.messages?.map((msg: any) => {
            const isStaff = !!msg.userId
            const isNote = msg.isInternal
            const authorName = isStaff
              ? msg.user?.name || 'Staff'
              : msg.portalUser
                ? `${msg.portalUser.firstName} ${msg.portalUser.lastName}`
                : 'Customer'
            const initials = getInitials(authorName)

            return (
              <div
                key={msg.id}
                className={`rounded-lg p-4 ${
                  isNote
                    ? 'bg-amber-500/10 border border-dashed border-amber-500/30'
                    : isStaff
                      ? 'bg-blue-500/5 border border-[var(--crm-border)]'
                      : 'glass-card-static'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                    isNote
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                      : isStaff
                        ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                        : 'bg-[var(--crm-accent-bg)] text-[var(--crm-accent-text)]'
                  }`}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-[var(--crm-text-primary)]">{authorName}</span>
                    <span className="text-xs text-[var(--crm-text-muted)] ml-2">
                      {isStaff ? t('tickets.staffLabel' as any) : t('tickets.customerLabel' as any)}
                    </span>
                  </div>
                  {isNote && (
                    <Badge className="badge-premium border-0 text-[10px] px-1.5 py-0 bg-amber-500/20 text-amber-600 dark:text-amber-400">
                      <Lock className="w-2.5 h-2.5 mr-1" />
                      {t('tickets.internalLabel' as any)}
                    </Badge>
                  )}
                  <span className="text-xs text-[var(--crm-text-muted)]">{timeAgo(msg.createdAt)}</span>
                </div>
                <p className="text-sm text-[var(--crm-text-secondary)] whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </p>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply form */}
        <div className="glass-card-static overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-[var(--crm-border)]">
            <button
              onClick={() => setIsInternal(false)}
              className={`flex-1 py-2.5 text-sm font-medium text-center transition-colors ${
                !isInternal
                  ? 'text-[var(--crm-accent-text)] border-b-2 border-[var(--crm-accent-text)]'
                  : 'text-[var(--crm-text-muted)] hover:text-[var(--crm-text-secondary)]'
              }`}
            >
              {t('tickets.reply' as any)}
            </button>
            <button
              onClick={() => setIsInternal(true)}
              className={`flex-1 py-2.5 text-sm font-medium text-center transition-colors flex items-center justify-center gap-1.5 ${
                isInternal
                  ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500'
                  : 'text-[var(--crm-text-muted)] hover:text-[var(--crm-text-secondary)]'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              {t('tickets.internalNote' as any)}
            </button>
          </div>

          {isInternal && (
            <div className="px-4 pt-2">
              <p className="text-xs text-amber-600 dark:text-amber-400">{t('tickets.internalHint' as any)}</p>
            </div>
          )}

          <div className="p-4">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={isInternal ? t('tickets.notePlaceholder' as any) : t('tickets.replyPlaceholder' as any)}
              rows={3}
              className="w-full resize-none bg-transparent text-sm text-[var(--crm-text-primary)] placeholder:text-[var(--crm-text-muted)] focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmitReply()
              }}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-[var(--crm-text-muted)]">Ctrl+Enter để gửi</span>
              <Button
                size="sm"
                onClick={handleSubmitReply}
                disabled={!replyContent.trim() || createMessage.isPending}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                {isInternal ? t('tickets.saveNote' as any) : t('tickets.send' as any)}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-80 shrink-0 space-y-4">
        {/* Customer info */}
        <div className="glass-card-static p-4 space-y-3">
          <h3 className="text-xs font-semibold text-[var(--crm-text-muted)] uppercase tracking-wide">
            {t('tickets.customer' as any)}
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[var(--crm-text-muted)]" />
              <span className="text-sm text-[var(--crm-text-primary)]">{customerName}</span>
            </div>
            {ticket.portalUser?.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[var(--crm-text-muted)]" />
                <span className="text-sm text-[var(--crm-text-secondary)]">{ticket.portalUser.email}</span>
              </div>
            )}
            {ticket.company && (
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[var(--crm-text-muted)]" />
                <span className="text-sm text-[var(--crm-text-secondary)]">{ticket.company.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* SLA Status */}
        {ticket.sla && (
          <div className="glass-card-static p-4 space-y-3">
            <h3 className="text-xs font-semibold text-[var(--crm-text-muted)] uppercase tracking-wide flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5" />
              {t('sla.title' as any)}
            </h3>
            <SlaTimerDisplay
              label={t('sla.firstResponse' as any)}
              timer={ticket.sla.firstResponse}
            />
            <SlaTimerDisplay
              label={t('sla.resolution' as any)}
              timer={ticket.sla.resolution}
            />
          </div>
        )}

        {/* Controls */}
        <div className="glass-card-static p-4 space-y-4">
          <h3 className="text-xs font-semibold text-[var(--crm-text-muted)] uppercase tracking-wide">
            {t('tickets.info' as any)}
          </h3>

          {/* Status */}
          <div>
            <label className="text-xs text-[var(--crm-text-muted)] mb-1 block">{t('tickets.status' as any)}</label>
            <Select value={ticket.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="input-premium bg-[var(--crm-bg-card)] border-[var(--crm-border)] text-[var(--crm-text-primary)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
                <SelectItem value={ticket.status} className="text-[var(--crm-text-primary)] focus:bg-[var(--crm-bg-subtle)] focus:text-[var(--crm-text-primary)]">
                  {t(`ticketStatus.${ticket.status}` as any)}
                </SelectItem>
                {validNextStatuses.map((s: string) => (
                  <SelectItem key={s} value={s} className="text-[var(--crm-text-primary)] focus:bg-[var(--crm-bg-subtle)] focus:text-[var(--crm-text-primary)]">
                    {t(`ticketStatus.${s}` as any)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs text-[var(--crm-text-muted)] mb-1 block">{t('tickets.priority' as any)}</label>
            <Select value={ticket.priority} onValueChange={handlePriorityChange}>
              <SelectTrigger className="input-premium bg-[var(--crm-bg-card)] border-[var(--crm-border)] text-[var(--crm-text-primary)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
                {PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p} className="text-[var(--crm-text-primary)] focus:bg-[var(--crm-bg-subtle)] focus:text-[var(--crm-text-primary)]">
                    {t(`ticketPriority.${p}` as any)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assignee */}
          <div>
            <label className="text-xs text-[var(--crm-text-muted)] mb-1 block">{t('tickets.assignee' as any)}</label>
            <Select value={ticket.assigneeId || 'NONE'} onValueChange={handleAssigneeChange}>
              <SelectTrigger className="input-premium bg-[var(--crm-bg-card)] border-[var(--crm-border)] text-[var(--crm-text-primary)]">
                <SelectValue placeholder={t('tickets.unassigned' as any)} />
              </SelectTrigger>
              <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
                <SelectItem value="NONE" className="text-[var(--crm-text-muted)] focus:bg-[var(--crm-bg-subtle)] focus:text-[var(--crm-text-primary)]">
                  {t('tickets.unassigned' as any)}
                </SelectItem>
                {(users || []).map((u: any) => (
                  <SelectItem key={u.id} value={u.id} className="text-[var(--crm-text-primary)] focus:bg-[var(--crm-bg-subtle)] focus:text-[var(--crm-text-primary)]">
                    {u.name || u.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(!ticket.assigneeId || ticket.assigneeId !== currentUser?.id) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAssignToMe}
                className="w-full mt-2 text-[var(--crm-text-secondary)] border-[var(--crm-border)] hover:bg-[var(--crm-bg-subtle)]"
              >
                {t('tickets.assignToMe' as any)}
              </Button>
            )}
          </div>

          {/* Dates */}
          <div className="pt-2 border-t border-[var(--crm-border)] space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[var(--crm-text-muted)]" />
              <div>
                <p className="text-xs text-[var(--crm-text-muted)]">{t('tickets.created' as any)}</p>
                <p className="text-xs text-[var(--crm-text-secondary)]">{formatDate(ticket.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[var(--crm-text-muted)]" />
              <div>
                <p className="text-xs text-[var(--crm-text-muted)]">{t('tickets.lastUpdated' as any)}</p>
                <p className="text-xs text-[var(--crm-text-secondary)]">{formatDate(ticket.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
