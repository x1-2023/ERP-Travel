'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Loader2 } from 'lucide-react'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Nháp', color: '#6B7280' },
  SENT: { label: 'Đã gửi', color: '#3B82F6' },
  VIEWED: { label: 'Đã xem', color: '#8B5CF6' },
  ACCEPTED: { label: 'Chấp nhận', color: '#10B981' },
  REJECTED: { label: 'Từ chối', color: '#EF4444' },
  EXPIRED: { label: 'Hết hạn', color: '#F59E0B' },
}

export default function PortalQuotesPage() {
  const router = useRouter()
  const [quotes, setQuotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)
  const viewedFired = useRef(false)

  const loadQuotes = () => {
    fetch('/api/portal/quotes')
      .then((r) => {
        if (!r.ok) throw new Error('Unauthorized')
        return r.json()
      })
      .then((data) => {
        setQuotes(data)
        // Fire VIEWED tracking for SENT quotes (once)
        if (!viewedFired.current) {
          viewedFired.current = true
          data.forEach((q: any) => {
            if (q.status === 'SENT') {
              fetch(`/api/portal/quotes/${q.id}/viewed`, { method: 'POST' })
            }
          })
          // Optimistic update: show SENT as VIEWED immediately
          setQuotes((prev) =>
            prev.map((q) => (q.status === 'SENT' ? { ...q, status: 'VIEWED' } : q))
          )
        }
      })
      .catch(() => router.push('/portal/login'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadQuotes() }, [router])

  const handleAction = async (quoteId: string, action: 'ACCEPTED' | 'REJECTED') => {
    setActing(quoteId)
    try {
      await fetch('/api/portal/quotes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId, action }),
      })
      loadQuotes()
    } finally {
      setActing(null)
    }
  }

  const handleDownloadPdf = async (quoteId: string, quoteNumber: string) => {
    setDownloading(quoteId)
    try {
      const response = await fetch(`/api/portal/quotes/${quoteId}/pdf`)
      if (!response.ok) throw new Error('Không thể tạo PDF')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${quoteNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch {
      // Silent fail for portal
    } finally {
      setDownloading(null)
    }
  }

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('vi-VN') : '--'

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold text-gray-900">Báo giá</h1>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 h-20 animate-pulse" />
          ))}
        </div>
      ) : quotes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <p className="text-gray-500">Chưa có báo giá nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {quotes.map((quote) => {
            const status = STATUS_LABELS[quote.status] || { label: quote.status, color: '#6B7280' }
            const canAct = quote.status === 'SENT' || quote.status === 'VIEWED'
            return (
              <div key={quote.id} className="bg-white rounded-xl border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{quote.quoteNumber}</span>
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${status.color}15`, color: status.color }}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatCurrency(Number(quote.total))} &middot; Hiệu lực đến {formatDate(quote.validUntil)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadPdf(quote.id, quote.quoteNumber)}
                      disabled={downloading === quote.id}
                      className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {downloading === quote.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      PDF
                    </button>
                    {canAct && (
                      <>
                        <button
                          onClick={() => handleAction(quote.id, 'REJECTED')}
                          disabled={acting === quote.id}
                          className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Từ chối
                        </button>
                        <button
                          onClick={() => handleAction(quote.id, 'ACCEPTED')}
                          disabled={acting === quote.id}
                          className="px-3 py-1.5 text-sm rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
                        >
                          Chấp nhận
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {/* Line items */}
                {quote.items && quote.items.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="space-y-1">
                      {quote.items.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{item.product?.name || item.description || 'Sản phẩm'}</span>
                          <span className="text-gray-900">{formatCurrency(Number(item.total))}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
