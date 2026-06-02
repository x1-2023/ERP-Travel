'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Check } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
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
import { useOrders } from '@/hooks/use-orders'
import { ORDER_STATUSES, formatCurrency } from '@/lib/constants'
import { useTranslation } from '@/i18n'

export default function OrdersPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const params = statusFilter !== 'ALL' ? { status: statusFilter } : {}
  const { data, isLoading } = useOrders(params)
  const orders = data?.data || []

  const getStatusConfig = (status: string) =>
    ORDER_STATUSES.find((s) => s.value === status) || { labelKey: status, color: '#6B7280' }

  const formatDate = (dateStr: string | Date | null | undefined) => {
    if (!dateStr) return '--'
    return new Date(dateStr).toLocaleDateString('vi-VN')
  }

  return (
    <PageShell
      title={t('orders.title')}
      description="Quản lý đơn hàng từ báo giá đã duyệt"
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
            {ORDER_STATUSES.map((s) => (
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
        ) : orders.length === 0 ? (
          <div className="glass-card-static py-16 flex flex-col items-center justify-center text-center">
            <ShoppingCart className="w-12 h-12 text-[#333] mb-3" />
            <p className="text-[var(--crm-text-secondary)] text-sm">{t('orders.empty')}</p>
            <p className="text-[var(--crm-text-muted)] text-xs mt-1">Đơn hàng sẽ được tạo từ báo giá đã chấp nhận</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-[var(--crm-border-subtle)] hover:bg-transparent">
                <TableHead className="text-[var(--crm-text-secondary)] text-[11px] font-semibold uppercase tracking-wide">{t('orders.orderNumber')}</TableHead>
                <TableHead className="text-[var(--crm-text-secondary)] text-[11px] font-semibold uppercase tracking-wide">{t('common.status')}</TableHead>
                <TableHead className="text-[var(--crm-text-secondary)] text-[11px] font-semibold uppercase tracking-wide">Công ty</TableHead>
                <TableHead className="text-[var(--crm-text-secondary)] text-[11px] font-semibold uppercase tracking-wide text-right">Tổng tiền</TableHead>
                <TableHead className="text-[var(--crm-text-secondary)] text-[11px] font-semibold uppercase tracking-wide">{t('quotes.createdDate')}</TableHead>
                <TableHead className="text-[var(--crm-text-secondary)] text-[11px] font-semibold uppercase tracking-wide">Thanh toán</TableHead>
                <TableHead className="text-[var(--crm-text-secondary)] text-[11px] font-semibold uppercase tracking-wide">Giao hàng</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const status = getStatusConfig(order.status)
                return (
                  <TableRow
                    key={order.id}
                    className="border-[var(--crm-border)] cursor-pointer hover:bg-[var(--crm-bg-subtle)]"
                    onClick={() => router.push(`/orders/${order.id}`)}
                  >
                    <TableCell className="text-[var(--crm-text-primary)] font-medium">
                      {order.orderNumber}
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
                      {order.company?.name || '--'}
                    </TableCell>
                    <TableCell className="text-right text-[var(--crm-text-primary)] font-medium">
                      {formatCurrency(Number(order.total))}
                    </TableCell>
                    <TableCell className="text-[var(--crm-text-muted)]">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell>
                      {order.paidAt ? (
                        <span className="flex items-center gap-1 text-xs text-[#10B981]">
                          <Check className="w-3.5 h-3.5" />
                          {formatDate(order.paidAt)}
                        </span>
                      ) : (
                        <span className="text-xs text-[var(--crm-text-muted)]">Chưa thanh toán</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {order.shippedAt ? (
                        <span className="flex items-center gap-1 text-xs text-[#10B981]">
                          <Check className="w-3.5 h-3.5" />
                          {formatDate(order.shippedAt)}
                        </span>
                      ) : (
                        <span className="text-xs text-[var(--crm-text-muted)]">Chưa giao</span>
                      )}
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
