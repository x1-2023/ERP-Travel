'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  OPEN: { label: 'Mở', color: '#3B82F6' },
  IN_PROGRESS: { label: 'Đang xử lý', color: '#F59E0B' },
  WAITING_CUSTOMER: { label: 'Chờ phản hồi', color: '#8B5CF6' },
  RESOLVED: { label: 'Đã giải quyết', color: '#10B981' },
  CLOSED: { label: 'Đã đóng', color: '#6B7280' },
}

const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Thấp',
  MEDIUM: 'Trung bình',
  HIGH: 'Cao',
  URGENT: 'Khẩn cấp',
}

export default function PortalTicketsPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [newSubject, setNewSubject] = useState('')
  const [newContent, setNewContent] = useState('')
  const [creating, setCreating] = useState(false)

  const loadTickets = () => {
    fetch('/api/portal/tickets')
      .then((r) => {
        if (!r.ok) throw new Error('Unauthorized')
        return r.json()
      })
      .then(setTickets)
      .catch(() => router.push('/portal/login'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadTickets() }, [router])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      await fetch('/api/portal/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: newSubject, content: newContent }),
      })
      setShowNew(false)
      setNewSubject('')
      setNewContent('')
      loadTickets()
    } finally {
      setCreating(false)
    }
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('vi-VN')

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Hỗ trợ</h1>
        <button
          onClick={() => setShowNew(!showNew)}
          className="px-4 py-2 text-sm rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
        >
          {showNew ? 'Hủy' : 'Tạo yêu cầu'}
        </button>
      </div>

      {showNew && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-3 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
            <input
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              placeholder="Mô tả ngắn gọn vấn đề..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              required
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
              placeholder="Mô tả chi tiết..."
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="px-4 py-2 text-sm rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            {creating ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 h-20 animate-pulse" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <p className="text-gray-500">Chưa có yêu cầu hỗ trợ nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => {
            const status = STATUS_LABELS[ticket.status] || { label: ticket.status, color: '#6B7280' }
            return (
              <Link
                key={ticket.id}
                href={`/portal/tickets/${ticket.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-3 hover:shadow-sm hover:border-gray-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-mono">{ticket.ticketNumber}</span>
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${status.color}15`, color: status.color }}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 mt-1">{ticket.subject}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{formatDate(ticket.updatedAt || ticket.createdAt)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {PRIORITY_LABELS[ticket.priority] || ticket.priority} · {ticket._count?.messages || 0} tin nhắn
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
