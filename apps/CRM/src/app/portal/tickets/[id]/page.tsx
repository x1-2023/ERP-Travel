'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  OPEN: { label: 'Mở', color: '#3B82F6' },
  IN_PROGRESS: { label: 'Đang xử lý', color: '#F59E0B' },
  WAITING_CUSTOMER: { label: 'Chờ phản hồi', color: '#8B5CF6' },
  RESOLVED: { label: 'Đã giải quyết', color: '#10B981' },
  CLOSED: { label: 'Đã đóng', color: '#6B7280' },
}

export default function PortalTicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [ticket, setTicket] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const loadTicket = () => {
    fetch(`/api/portal/tickets/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed')
        return r.json()
      })
      .then(setTicket)
      .catch(() => router.push('/portal/tickets'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadTicket() }, [id, router])
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [ticket?.messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    setSending(true)
    try {
      await fetch(`/api/portal/tickets/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message }),
      })
      setMessage('')
      loadTicket()
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return <div className="bg-white rounded-xl border border-gray-200 p-8 animate-pulse h-64" />
  }

  if (!ticket) return null

  const status = STATUS_LABELS[ticket.status] || { label: ticket.status, color: '#6B7280' }

  return (
    <div className="space-y-3">
      <button onClick={() => router.push('/portal/tickets')} className="text-sm text-gray-500 hover:text-gray-700">
        &larr; Quay lại
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-gray-400 font-mono">{ticket.ticketNumber}</span>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${status.color}15`, color: status.color }}
          >
            {status.label}
          </span>
          {ticket.assignee && (
            <span className="text-xs text-gray-400">· Phụ trách: {ticket.assignee.name}</span>
          )}
        </div>
        <h1 className="text-xl font-semibold text-gray-900">{ticket.subject}</h1>
        <p className="text-xs text-gray-400 mt-1">Tạo lúc: {new Date(ticket.createdAt).toLocaleString('vi-VN')}</p>
      </div>

      {ticket.status === 'RESOLVED' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-700">
          Yêu cầu đã được giải quyết. Nếu bạn cần hỗ trợ thêm, hãy gửi tin nhắn bên dưới để mở lại.
        </div>
      )}

      {ticket.status === 'CLOSED' && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-500">
          Yêu cầu này đã đóng. Vui lòng tạo yêu cầu mới nếu cần hỗ trợ.
        </div>
      )}

      {/* Messages */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {ticket.messages?.map((msg: any) => {
          const isStaff = !!msg.user
          const name = isStaff
            ? msg.user?.name || 'Nhân viên'
            : `${msg.portalUser?.firstName || ''} ${msg.portalUser?.lastName || ''}`.trim() || 'Bạn'
          return (
            <div key={msg.id} className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-sm font-medium ${isStaff ? 'text-blue-600' : 'text-gray-900'}`}>
                  {name}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(msg.createdAt).toLocaleString('vi-VN')}
                </span>
                {isStaff && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">Nhân viên</span>
                )}
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.content}</p>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply form */}
      {ticket.status !== 'CLOSED' && (
        <form onSubmit={handleSend} className="bg-white rounded-xl border border-gray-200 p-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
            placeholder="Nhập phản hồi của bạn..."
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={sending || !message.trim()}
              className="px-4 py-2 text-sm rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
            >
              {sending ? 'Đang gửi...' : 'Gửi'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
