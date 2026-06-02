'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2, Package, Truck, Home, ClipboardCheck, XCircle, RotateCcw, Clock, ArrowRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Chờ xác nhận', color: '#F59E0B' },
  CONFIRMED: { label: 'Đã xác nhận', color: '#3B82F6' },
  IN_PRODUCTION: { label: 'Đang sản xuất', color: '#8B5CF6' },
  SHIPPED: { label: 'Đã giao', color: '#06B6D4' },
  DELIVERED: { label: 'Đã nhận', color: '#10B981' },
  CANCELLED: { label: 'Đã hủy', color: '#EF4444' },
  REFUNDED: { label: 'Hoàn tiền', color: '#6B7280' },
}

const STEPS = [
  { key: 'PENDING', label: 'Chờ xác nhận', icon: ClipboardCheck },
  { key: 'CONFIRMED', label: 'Đã xác nhận', icon: CheckCircle2 },
  { key: 'IN_PRODUCTION', label: 'Đang sản xuất', icon: Package },
  { key: 'SHIPPED', label: 'Đã giao', icon: Truck },
  { key: 'DELIVERED', label: 'Đã nhận', icon: Home },
]

function getStepIndex(status: string) {
  const idx = STEPS.findIndex((s) => s.key === status)
  return idx >= 0 ? idx : 0
}

export default function PortalOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/portal/orders/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed')
        return r.json()
      })
      .then(setOrder)
      .catch(() => router.push('/portal/orders'))
      .finally(() => setLoading(false))
  }, [id, router])

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('vi-VN') : '--'

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="h-40 bg-gray-200 rounded animate-pulse" />
        <div className="h-60 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-16 text-gray-500">
        Không tìm thấy đơn hàng
      </div>
    )
  }

  const status = STATUS_LABELS[order.status] || { label: order.status, color: '#6B7280' }
  const isCancelled = order.status === 'CANCELLED' || order.status === 'REFUNDED'
  const currentStep = getStepIndex(order.status)

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/portal/orders')}
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">
          Đơn hàng {order.orderNumber}
        </h1>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${status.color}15`, color: status.color }}
        >
          {status.label}
        </span>
      </div>

      {/* Cancelled / Refunded Banner */}
      {order.status === 'CANCELLED' && order.cancellationReason && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <XCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Lý do hủy đơn</span>
          </div>
          <p className="text-sm text-red-700">{order.cancellationReason}</p>
        </div>
      )}

      {order.status === 'REFUNDED' && order.refundAmount && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm font-medium">Số tiền hoàn trả</span>
          </div>
          <p className="text-sm text-gray-900 font-semibold">
            {formatCurrency(Number(order.refundAmount))}
          </p>
        </div>
      )}

      {/* Fulfillment Progress */}
      {!isCancelled && (
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Tiến trình thực hiện</h3>
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200" />
            <div
              className="absolute top-5 left-5 h-0.5 bg-emerald-500 transition-all duration-500"
              style={{
                width: `${(currentStep / (STEPS.length - 1)) * 100}%`,
                maxWidth: 'calc(100% - 40px)',
              }}
            />
            {STEPS.map((step, idx) => {
              const isCompleted = idx <= currentStep
              const isCurrent = idx === currentStep
              const StepIcon = step.icon
              return (
                <div key={step.key} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isCompleted
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-500'
                        : 'bg-white border-gray-200 text-gray-400'
                    } ${isCurrent ? 'ring-2 ring-emerald-200' : ''}`}
                  >
                    {isCompleted && idx < currentStep ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={`text-[11px] mt-2 whitespace-nowrap ${
                      isCompleted ? 'text-emerald-600' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Order Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-3">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Thông tin đơn hàng</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <p className="text-gray-500 text-xs">Ngày tạo</p>
            <p className="text-gray-900 mt-0.5">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Thanh toán</p>
            <p className={`mt-0.5 ${order.paidAt ? 'text-emerald-600' : 'text-amber-500'}`}>
              {order.paidAt ? formatDate(order.paidAt) : 'Chưa thanh toán'}
            </p>
          </div>
          {order.trackingNumber && (
            <div>
              <p className="text-gray-500 text-xs">Mã vận đơn</p>
              <p className="text-gray-900 mt-0.5">{order.trackingNumber}</p>
            </div>
          )}
          {order.shippingProvider && (
            <div>
              <p className="text-gray-500 text-xs">Đơn vị vận chuyển</p>
              <p className="text-gray-900 mt-0.5">{order.shippingProvider}</p>
            </div>
          )}
        </div>
        {order.shippingAddress && (
          <div className="mt-4">
            <p className="text-gray-500 text-xs">Địa chỉ giao hàng</p>
            <p className="text-gray-900 text-sm mt-0.5">{order.shippingAddress}</p>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 pb-0">
          <h3 className="text-sm font-medium text-gray-900">Sản phẩm</h3>
        </div>
        <table className="w-full mt-2">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-2">#</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-2">Sản phẩm</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-2">SL</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-2">Đơn giá</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-2">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item: any, idx: number) => (
              <tr key={item.id} className="border-b border-gray-50">
                <td className="px-4 py-2 text-sm text-gray-400">{idx + 1}</td>
                <td className="px-4 py-2 text-sm font-medium text-gray-900">
                  {item.product?.name || 'Sản phẩm tùy chỉnh'}
                </td>
                <td className="px-4 py-2 text-sm text-right text-gray-900">{Number(item.quantity)}</td>
                <td className="px-4 py-2 text-sm text-right text-gray-900">{formatCurrency(Number(item.unitPrice))}</td>
                <td className="px-4 py-2 text-sm text-right font-medium text-gray-900">{formatCurrency(Number(item.total))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 border-t border-gray-100">
          <div className="flex justify-end">
            <div className="w-64 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Tạm tính</span>
                <span className="text-gray-900">{formatCurrency(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Thuế (VAT)</span>
                <span className="text-gray-900">{formatCurrency(Number(order.taxAmount))}</span>
              </div>
              <div className="border-t border-gray-200 pt-1.5 flex justify-between font-bold">
                <span className="text-gray-900">Tổng cộng</span>
                <span className="text-emerald-600">{formatCurrency(Number(order.total))}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status History */}
      {order.statusHistory && order.statusHistory.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Lịch sử trạng thái</h3>
          <div className="space-y-3">
            {order.statusHistory.map((entry: any) => {
              const from = STATUS_LABELS[entry.fromStatus] || { label: entry.fromStatus, color: '#6B7280' }
              const to = STATUS_LABELS[entry.toStatus] || { label: entry.toStatus, color: '#6B7280' }
              return (
                <div key={entry.id} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: to.color }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-xs font-medium px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: `${from.color}15`, color: from.color }}
                      >
                        {from.label}
                      </span>
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                      <span
                        className="text-xs font-medium px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: `${to.color}15`, color: to.color }}
                      >
                        {to.label}
                      </span>
                    </div>
                    {entry.note && (
                      <p className="text-xs text-gray-500 mt-1">{entry.note}</p>
                    )}
                    <span className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(entry.createdAt), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
