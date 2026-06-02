'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Send,
  ShoppingCart,
  Loader2,
  Paperclip,
  Clock,
  AlertTriangle,
  Copy,
  Link2,
} from 'lucide-react'
import Link from 'next/link'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/button'
import { PdfDownloadButton } from '@/components/pdf-download-button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useQuote, useUpdateQuote } from '@/hooks/use-quotes'
import { useCreateOrder } from '@/hooks/use-orders'
import { usePermissions } from '@/hooks/use-permissions'
import { toast } from '@/hooks/use-toast'
import { QUOTE_STATUSES, formatCurrency } from '@/lib/constants'
import { daysUntilExpiry, isQuoteExpired } from '@/lib/quotes/status'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from '@/i18n'

export default function QuoteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { t } = useTranslation()
  const id = params.id as string
  const queryClient = useQueryClient()

  const { data: quote, isLoading } = useQuote(id)
  const updateQuote = useUpdateQuote()
  const createOrder = useCreateOrder()
  const { canEditRecord } = usePermissions()

  // Send dialog state
  const [sendOpen, setSendOpen] = useState(false)
  const [sendTo, setSendTo] = useState('')
  const [sendMessage, setSendMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  const statusConfig = QUOTE_STATUSES.find((s) => s.value === quote?.status) || {
    labelKey: quote?.status || '',
    color: '#6B7280',
  }

  const formatDate = (dateStr: string | Date | null | undefined) => {
    if (!dateStr) return '--'
    return new Date(dateStr).toLocaleDateString('vi-VN')
  }

  // Compute expiry state
  const daysLeft = quote ? daysUntilExpiry(quote) : null
  const expired = quote ? isQuoteExpired(quote) : false
  const canSend =
    quote &&
    (quote.status === 'DRAFT' || quote.status === 'SENT') &&
    !expired &&
    canEditRecord(quote.createdById)
  const isResend = quote?.status === 'SENT'

  const handleOpenSendDialog = () => {
    if (!quote) return
    const contactEmail = quote.contact?.email || ''
    setSendTo(contactEmail)
    setSendMessage('')
    setSendOpen(true)
  }

  const handleSendQuote = async () => {
    if (!quote) return
    setIsSending(true)

    try {
      const res = await fetch(`/api/quotes/${id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: sendTo || undefined,
          message: sendMessage || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast({
          title: t('common.error'),
          description: data.error || 'Không thể gửi báo giá',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Thành công',
        description: t('quotes.sentSuccess'),
      })
      setSendOpen(false)
      // Refresh quote data
      queryClient.invalidateQueries({ queryKey: ['quotes', id] })
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
    } catch {
      toast({
        title: t('common.error'),
        description: 'Không thể gửi báo giá',
        variant: 'destructive',
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleConvertToOrder = () => {
    if (!quote) return
    createOrder.mutate(
      {
        quoteId: quote.id,
        companyId: quote.companyId,
        dealId: quote.dealId,
        subtotal: quote.subtotal,
        taxAmount: quote.taxAmount,
        total: quote.total,
        items: quote.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          description: item.description,
        })),
      } as Parameters<typeof createOrder.mutate>[0],
      {
        onSuccess: () => {
          updateQuote.mutate({ id: quote.id, status: 'ACCEPTED' } as Parameters<typeof updateQuote.mutate>[0])
          router.push('/orders')
        },
      }
    )
  }

  if (isLoading) {
    return (
      <PageShell title="Báo giá">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64 bg-[var(--crm-bg-subtle)]" />
          <Skeleton className="h-40 w-full bg-[var(--crm-bg-subtle)]" />
          <Skeleton className="h-60 w-full bg-[var(--crm-bg-subtle)]" />
        </div>
      </PageShell>
    )
  }

  if (!quote) {
    return (
      <PageShell title="Báo giá">
        <div className="text-center py-16 text-[var(--crm-text-secondary)]">{t('quotes.notFound')}</div>
      </PageShell>
    )
  }

  return (
    <PageShell
      title={`Báo giá ${quote.quoteNumber}`}
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
          {canSend && (
            <Button
              onClick={handleOpenSendDialog}
              className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
            >
              <Send className="w-4 h-4 mr-1.5" />
              {isResend ? t('quotes.resendQuote') : t('quotes.sendQuote')}
            </Button>
          )}
          {quote.status === 'EXPIRED' && (
            <Button
              variant="outline"
              disabled
              className="border-[var(--crm-border)] text-[var(--crm-text-muted)] cursor-not-allowed"
            >
              <Copy className="w-4 h-4 mr-1.5" />
              Tạo bản sao
            </Button>
          )}
          {(quote.status === 'SENT' || quote.status === 'VIEWED') && !expired && !(quote as any).order && (
            <Button
              onClick={handleConvertToOrder}
              disabled={createOrder.isPending}
              className="bg-[#10B981] hover:bg-[#10B981]/90 text-white"
            >
              <ShoppingCart className="w-4 h-4 mr-1.5" />
              Tạo đơn hàng
            </Button>
          )}
          <PdfDownloadButton
            url={`/api/quotes/${id}/pdf`}
            filename={quote.quoteNumber}
            label={t('quotes.exportPdf')}
          />
        </div>
      }
    >
      {/* Header info + Expiry indicator */}
      <div className="flex items-center gap-3 flex-wrap">
        <Badge
          className="border-0 text-xs px-2 py-0.5"
          style={{ backgroundColor: `${statusConfig.color}20`, color: statusConfig.color }}
        >
          {t(statusConfig.labelKey)}
        </Badge>
        <span className="text-sm text-[var(--crm-text-muted)]">Ngày tạo: {formatDate(quote.createdAt)}</span>

        {/* Expiry indicator */}
        {quote.status === 'SENT' && quote.validUntil && daysLeft !== null && (
          <>
            {daysLeft <= 0 && (
              <Badge className="border-0 text-xs px-2 py-0.5 bg-[#EF4444]/10 text-[#EF4444]">
                <AlertTriangle className="w-3 h-3 mr-1" />
                ĐÃ HẾT HẠN
              </Badge>
            )}
            {daysLeft > 0 && daysLeft <= 3 && (
              <Badge className="border-0 text-xs px-2 py-0.5 bg-[#EF4444]/10 text-[#EF4444]">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Sắp hết hạn! Còn {daysLeft} ngày
              </Badge>
            )}
            {daysLeft > 3 && daysLeft <= 7 && (
              <Badge className="border-0 text-xs px-2 py-0.5 bg-[#F59E0B]/10 text-[#F59E0B]">
                <Clock className="w-3 h-3 mr-1" />
                Còn {daysLeft} ngày
              </Badge>
            )}
            {daysLeft > 7 && (
              <span className="text-sm text-[var(--crm-text-muted)]">
                Hiệu lực đến: {formatDate(quote.validUntil)}
              </span>
            )}
          </>
        )}

        {quote.status === 'EXPIRED' && (
          <Badge className="border-0 text-xs px-2 py-0.5 bg-[#EF4444]/10 text-[#EF4444]">
            <AlertTriangle className="w-3 h-3 mr-1" />
            ĐÃ HẾT HẠN
          </Badge>
        )}

        {quote.status !== 'SENT' && quote.status !== 'EXPIRED' && quote.validUntil && (
          <span className="text-sm text-[var(--crm-text-muted)]">Hiệu lực đến: {formatDate(quote.validUntil)}</span>
        )}
      </div>

      {/* Linked order */}
      {(quote as any).order && (
        <Link
          href={`/orders/${(quote as any).order.id}`}
          className="glass-card-static p-4 flex items-center gap-3 hover:border-[#10B981]/40 transition-colors"
        >
          <Link2 className="w-4 h-4 text-[#10B981]" />
          <div className="flex-1">
            <p className="text-sm text-[var(--crm-text-primary)]">
              Đơn hàng liên kết: <span className="font-medium">{(quote as any).order.orderNumber}</span>
            </p>
            <p className="text-xs text-[var(--crm-text-muted)]">
              {formatCurrency(Number((quote as any).order.total))}
            </p>
          </div>
          <ArrowLeft className="w-4 h-4 text-[var(--crm-text-muted)] rotate-180" />
        </Link>
      )}

      {/* Company / Contact info */}
      <div className="glass-card-static p-3">
        <h3 className="text-sm font-medium text-[var(--crm-text-primary)] mb-3">Thông tin khách hàng</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[var(--crm-text-muted)] text-xs">{t('contacts.company')}</p>
            <p className="text-[var(--crm-text-primary)] mt-0.5">{quote.company?.name || '--'}</p>
          </div>
          <div>
            <p className="text-[var(--crm-text-muted)] text-xs">{t('activities.contact')}</p>
            <p className="text-[var(--crm-text-primary)] mt-0.5">
              {quote.contact
                ? `${quote.contact.firstName} ${quote.contact.lastName}`
                : '--'}
            </p>
          </div>
        </div>
      </div>

      {/* Items table */}
      <div className="glass-card-static overflow-hidden">
        <div className="p-4 pb-0">
          <h3 className="text-sm font-medium text-[var(--crm-text-primary)]">Sản phẩm / Dịch vụ</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-[var(--crm-border)] hover:bg-transparent">
              <TableHead className="text-[var(--crm-text-secondary)] w-10">#</TableHead>
              <TableHead className="text-[var(--crm-text-secondary)]">Sản phẩm</TableHead>
              <TableHead className="text-[var(--crm-text-secondary)]">{t('common.description')}</TableHead>
              <TableHead className="text-[var(--crm-text-secondary)] text-right">SL</TableHead>
              <TableHead className="text-[var(--crm-text-secondary)] text-right">Đơn giá</TableHead>
              <TableHead className="text-[var(--crm-text-secondary)] text-right">CK</TableHead>
              <TableHead className="text-[var(--crm-text-secondary)] text-right">Thành tiền</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quote.items.map((item, idx) => (
              <TableRow key={item.id} className="border-[var(--crm-border)]">
                <TableCell className="text-[var(--crm-text-muted)]">{idx + 1}</TableCell>
                <TableCell className="text-[var(--crm-text-primary)] font-medium">
                  {item.product?.name || 'Sản phẩm tùy chỉnh'}
                </TableCell>
                <TableCell className="text-[var(--crm-text-secondary)]">{item.description || '--'}</TableCell>
                <TableCell className="text-right text-[var(--crm-text-primary)]">{Number(item.quantity)}</TableCell>
                <TableCell className="text-right text-[var(--crm-text-primary)]">
                  {formatCurrency(Number(item.unitPrice))}
                </TableCell>
                <TableCell className="text-right text-red-400">
                  {Number(item.discount) > 0 ? `${Number(item.discount)}%` : '--'}
                </TableCell>
                <TableCell className="text-right text-[var(--crm-text-primary)] font-medium">
                  {formatCurrency(Number(item.total))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Summary */}
        <div className="p-4 border-t border-[var(--crm-border)]">
          <div className="flex justify-end">
            <div className="w-72 space-y-2 text-sm">
              <div className="flex justify-between text-[var(--crm-text-secondary)]">
                <span>Tạm tính</span>
                <span className="text-[var(--crm-text-primary)]">{formatCurrency(Number(quote.subtotal))}</span>
              </div>
              {Number(quote.discountAmount) > 0 && (
                <div className="flex justify-between text-[var(--crm-text-secondary)]">
                  <span>Chiết khấu ({Number(quote.discountPercent)}%)</span>
                  <span className="text-red-400">-{formatCurrency(Number(quote.discountAmount))}</span>
                </div>
              )}
              <div className="flex justify-between text-[var(--crm-text-secondary)]">
                <span>Thuế (VAT {Number(quote.taxPercent)}%)</span>
                <span className="text-[var(--crm-text-primary)]">{formatCurrency(Number(quote.taxAmount))}</span>
              </div>
              <Separator className="bg-[var(--crm-border)]" />
              <div className="flex justify-between font-bold text-base">
                <span className="text-[var(--crm-text-primary)]">{t('quotes.total')}</span>
                <span className="text-[#10B981]">{formatCurrency(Number(quote.total))}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms */}
      {quote.terms && (
        <div className="glass-card-static p-3">
          <h3 className="text-sm font-medium text-[var(--crm-text-primary)] mb-2">Điều khoản</h3>
          <p className="text-sm text-[var(--crm-text-secondary)] whitespace-pre-wrap">{quote.terms}</p>
        </div>
      )}

      {/* Send Quote Dialog */}
      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogContent className="bg-[var(--crm-bg-page)] border-[var(--crm-border)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--crm-text-primary)]">
              {isResend ? 'Gửi lại' : 'Gửi'} báo giá {quote.quoteNumber}
            </DialogTitle>
            <DialogDescription className="text-[var(--crm-text-secondary)]">
              {t('quotes.emailAttachNote')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="send-to" className="text-[var(--crm-text-secondary)]">
                {t('quotes.sendTo')}
              </Label>
              <Input
                id="send-to"
                type="email"
                value={sendTo}
                onChange={(e) => setSendTo(e.target.value)}
                placeholder="email@example.com"
                className="bg-[var(--crm-bg-subtle)] border-[var(--crm-border)] text-[var(--crm-text-primary)] placeholder:text-[var(--crm-text-muted)]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="send-message" className="text-[var(--crm-text-secondary)]">
                Lời nhắn (tùy chọn)
              </Label>
              <Textarea
                id="send-message"
                value={sendMessage}
                onChange={(e) => setSendMessage(e.target.value)}
                rows={3}
                placeholder={t('quotes.messagePlaceholder')}
                className="bg-[var(--crm-bg-subtle)] border-[var(--crm-border)] text-[var(--crm-text-primary)] placeholder:text-[var(--crm-text-muted)] resize-none"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-[var(--crm-text-muted)]">
              <Paperclip className="w-3.5 h-3.5" />
              <span>PDF báo giá sẽ được đính kèm tự động</span>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSendOpen(false)}
              disabled={isSending}
              className="border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] hover:bg-[var(--crm-bg-subtle)]"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSendQuote}
              disabled={isSending || !sendTo}
              className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  {t('common.sending')}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1.5" />
                  {isResend ? t('quotes.resendQuote') : t('quotes.sendQuote')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
