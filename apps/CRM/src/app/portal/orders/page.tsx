'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Chờ xác nhận', color: '#F59E0B' },
  CONFIRMED: { label: 'Đã xác nhận', color: '#3B82F6' },
  IN_PRODUCTION: { label: 'Đang sản xuất', color: '#8B5CF6' },
  SHIPPED: { label: 'Đã giao', color: '#06B6D4' },
  DELIVERED: { label: 'Đã nhận', color: '#10B981' },
  CANCELLED: { label: 'Đã hủy', color: '#EF4444' },
}

export default function PortalOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/portal/orders')
      .then((r) => {
        if (!r.ok) throw new Error('Unauthorized')
        return r.json()
      })
      .then(setOrders)
      .catch(() => router.push('/portal/login'))
      .finally(() => setLoading(false))
  }, [router])

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
  const formatDate = (d: string) => new Date(d).toLocaleDateString('vi-VN')

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold text-gray-900">Đơn hàng</h1>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 h-20 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <p className="text-gray-500">Chưa có đơn hàng nào</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">Mã đơn</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">Trạng thái</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">Tổng tiền</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const status = STATUS_LABELS[order.status] || { label: order.status, color: '#6B7280' }
                return (
                  <tr
                    key={order.id}
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/portal/orders/${order.id}`)}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${status.color}15`, color: status.color }}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">{formatCurrency(Number(order.total))}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
