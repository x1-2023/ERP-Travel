'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, FileText } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
// Card import removed - using glass-card-static div
import { Skeleton } from '@/components/ui/skeleton'
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
import { useQuotes } from '@/hooks/use-quotes'
import { usePermissions } from '@/hooks/use-permissions'
import { QUOTE_STATUSES, formatCurrency } from '@/lib/constants'
import { useTranslation } from '@/i18n'

export default function QuotesPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const { canCreate } = usePermissions()
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const params = statusFilter !== 'ALL' ? { status: statusFilter } : {}
  const { data, isLoading } = useQuotes(params)
  const quotes = data?.data || []

  const getStatusConfig = (status: string) =>
    QUOTE_STATUSES.find((s) => s.value === status) || { labelKey: status, color: '#6B7280' }

  const formatDate = (dateStr: string | Date | null | undefined) => {
    if (!dateStr) return '--'
    return new Date(dateStr).toLocaleDateString('vi-VN')
  }

  return (
    <PageShell
      title={t('quotes.title')}
      description="Quản lý báo giá và đề xuất cho khách hàng"
      actions={
        canCreate ? (
          <Button asChild className="btn-accent-glow">
            <Link href="/quotes/new">
              <Plus className="w-4 h-4 mr-1.5" />
              Tạo báo giá
            </Link>
          </Button>
        ) : undefined
      }
    >
      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 input-premium bg-[var(--crm-bg-card)] border-[var(--crm-border)] text-[var(--crm-text-primary)]">
            <SelectValue placeholder={t('common.status')} />
          </SelectTrigger>
          <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
            <SelectItem value="ALL" className="text-[var(--crm-text-primary)] focus:bg-[var(--crm-bg-subtle)] focus:text-[var(--crm-text-primary)]">
              {t('contacts.allStatuses')}
            </SelectItem>
            {QUOTE_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value} className="text-[var(--crm-text-primary)] focus:bg-[var(--crm-bg-subtle)] focus:text-[var(--crm-text-primary)]">
                {t(s.labelKey)}
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
        ) : quotes.length === 0 ? (
          <div className="glass-card-static py-16 flex flex-col items-center justify-center text-center">
            <FileText className="w-12 h-12 text-[#333] mb-3" />
            <p className="text-[var(--crm-text-secondary)] text-sm">{t('quotes.empty')}</p>
            <p className="text-[var(--crm-text-muted)] text-xs mt-1">Tạo báo giá đầu tiên cho khách hàng</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-[var(--crm-border-subtle)] hover:bg-transparent">
                <TableHead className="text-[var(--crm-text-secondary)] text-[11px] font-semibold uppercase tracking-wide">{t('quotes.quoteNumber')}</TableHead>
                <TableHead className="text-[var(--crm-text-secondary)] text-[11px] font-semibold uppercase tracking-wide">{t('common.status')}</TableHead>
                <TableHead className="text-[var(--crm-text-secondary)] text-[11px] font-semibold uppercase tracking-wide">{t('nav.contacts')}</TableHead>
                <TableHead className="text-[var(--crm-text-secondary)] text-[11px] font-semibold uppercase tracking-wide">{t('nav.companies')}</TableHead>
                <TableHead className="text-[var(--crm-text-secondary)] text-[11px] font-semibold uppercase tracking-wide text-right">Tổng tiền</TableHead>
                <TableHead className="text-[var(--crm-text-secondary)] text-[11px] font-semibold uppercase tracking-wide">Hiệu lực đến</TableHead>
                <TableHead className="text-[var(--crm-text-secondary)] text-[11px] font-semibold uppercase tracking-wide">{t('quotes.createdDate')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => {
                const status = getStatusConfig(quote.status)
                return (
                  <TableRow
                    key={quote.id}
                    className="border-[var(--crm-border)] cursor-pointer hover:bg-[var(--glass-bg)]"
                    onClick={() => router.push(`/quotes/${quote.id}`)}
                  >
                    <TableCell className="text-[var(--crm-text-primary)] font-medium">
                      {quote.quoteNumber}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className="badge-premium border-0 text-[10px] px-1.5 py-0"
                        style={{ backgroundColor: `${status.color}20`, color: status.color }}
                      >
                        {t(status.labelKey)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[var(--crm-text-secondary)]">
                      {quote.contact
                        ? `${quote.contact.firstName} ${quote.contact.lastName}`
                        : '--'}
                    </TableCell>
                    <TableCell className="text-[var(--crm-text-secondary)]">
                      {quote.company?.name || '--'}
                    </TableCell>
                    <TableCell className="text-right text-[var(--crm-text-primary)] font-medium">
                      {formatCurrency(Number(quote.total))}
                    </TableCell>
                    <TableCell className="text-[var(--crm-text-secondary)]">
                      {formatDate(quote.validUntil)}
                    </TableCell>
                    <TableCell className="text-[var(--crm-text-muted)]">
                      {formatDate(quote.createdAt)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </PageShell>
  )
}
