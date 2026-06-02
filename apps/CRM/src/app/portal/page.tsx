'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface PortalUser {
  id: string
  firstName: string
  lastName: string
  email: string
  company: { id: string; name: string }
}

interface DashboardData {
  stats: { pendingQuotes: number; activeOrders: number; openTickets: number }
  recent: {
    quotes: Array<{ id: string; quoteNumber: string; status: string; total: number; currency: string; createdAt: string }>
    orders: Array<{ id: string; orderNumber: string; status: string; total: number; currency: string; createdAt: string }>
    tickets: Array<{ id: string; ticketNumber: string; subject: string; status: string; priority: string; createdAt: string }>
  }
}

const STATUS_LABELS: Record<string, string> = {
  // Quotes
  DRAFT: 'Nháp',
  SENT: 'Đã gửi',
  VIEWED: 'Đã xem',
  ACCEPTED: 'Chấp nhận',
  REJECTED: 'Từ chối',
  EXPIRED: 'Hết hạn',
  // Orders
  PENDING: 'Chờ xử lý',
  CONFIRMED: 'Đã xác nhận',
  IN_PRODUCTION: 'Đang sản xuất',
  SHIPPED: 'Đã giao',
  DELIVERED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  REFUNDED: 'Hoàn tiền',
  // Tickets
  OPEN: 'Mở',
  IN_PROGRESS: 'Đang xử lý',
  WAITING_CUSTOMER: 'Chờ phản hồi',
  RESOLVED: 'Đã giải quyết',
  CLOSED: 'Đóng',
}

function formatCurrency(amount: number, currency = 'VND') {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(amount)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function PortalDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<PortalUser | null>(null)
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/portal/me').then((r) => {
        if (!r.ok) throw new Error('Unauthorized')
        return r.json()
      }),
      fetch('/api/portal/dashboard').then((r) => {
        if (!r.ok) return null
        return r.json()
      }),
    ])
      .then(([userData, dashData]) => {
        setUser(userData)
        setDashboard(dashData)
      })
      .catch(() => router.push('/portal/login'))
      .finally(() => setLoading(false))
  }, [router])

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 h-32 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!user) return null

  const stats = dashboard?.stats
  const recent = dashboard?.recent

  const cards = [
    {
      title: 'Đơn hàng',
      description: 'Xem trạng thái đơn hàng',
      href: '/portal/orders',
      icon: '\u{1F4E6}',
      color: 'bg-blue-50 text-blue-600',
      badge: stats?.activeOrders,
    },
    {
      title: 'Báo giá',
      description: 'Xem và phản hồi báo giá',
      href: '/portal/quotes',
      icon: '\u{1F4CB}',
      color: 'bg-emerald-50 text-emerald-600',
      badge: stats?.pendingQuotes,
    },
    {
      title: 'Hỗ trợ',
      description: 'Gửi yêu cầu hỗ trợ',
      href: '/portal/tickets',
      icon: '\u{1F4AC}',
      color: 'bg-purple-50 text-purple-600',
      badge: stats?.openTickets,
    },
  ]

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Xin chào, {user.firstName}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{user.company.name}</p>
      </div>

      {/* Stat cards with badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all group relative"
          >
            <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center text-lg mb-3`}>
              {card.icon}
            </div>
            <h3 className="font-medium text-gray-900 group-hover:text-emerald-600 transition-colors">
              {card.title}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{card.description}</p>
            {card.badge != null && card.badge > 0 && (
              <span className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                {card.badge}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Recent activity sections */}
      {recent && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Recent Quotes */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Báo giá gần đây</h3>
              <Link href="/portal/quotes" className="text-xs text-emerald-600 hover:underline">
                Xem tất cả
              </Link>
            </div>
            {recent.quotes.length === 0 ? (
              <p className="text-sm text-gray-400">Chưa có báo giá</p>
            ) : (
              <div className="space-y-3">
                {recent.quotes.map((q) => (
                  <div key={q.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-gray-700 font-medium">{q.quoteNumber}</span>
                      <span className="text-gray-400 ml-2 text-xs">{STATUS_LABELS[q.status] || q.status}</span>
                    </div>
                    <span className="text-gray-600">{formatCurrency(q.total, q.currency)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Đơn hàng gần đây</h3>
              <Link href="/portal/orders" className="text-xs text-emerald-600 hover:underline">
                Xem tất cả
              </Link>
            </div>
            {recent.orders.length === 0 ? (
              <p className="text-sm text-gray-400">Chưa có đơn hàng</p>
            ) : (
              <div className="space-y-3">
                {recent.orders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-gray-700 font-medium">{o.orderNumber}</span>
                      <span className="text-gray-400 ml-2 text-xs">{STATUS_LABELS[o.status] || o.status}</span>
                    </div>
                    <span className="text-gray-600">{formatCurrency(o.total, o.currency)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Tickets */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Ticket gần đây</h3>
              <Link href="/portal/tickets" className="text-xs text-emerald-600 hover:underline">
                Xem tất cả
              </Link>
            </div>
            {recent.tickets.length === 0 ? (
              <p className="text-sm text-gray-400">Chưa có ticket</p>
            ) : (
              <div className="space-y-3">
                {recent.tickets.map((t) => (
                  <div key={t.id} className="text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700 font-medium">{t.ticketNumber}</span>
                      <span className="text-gray-400 text-xs">{STATUS_LABELS[t.status] || t.status}</span>
                    </div>
                    <p className="text-gray-500 text-xs truncate mt-0.5">{t.subject}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
