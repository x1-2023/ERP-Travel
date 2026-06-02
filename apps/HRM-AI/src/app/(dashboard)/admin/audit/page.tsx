'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AUDIT_ACTIONS, ENTITY_TYPES } from '@/lib/audit/constants'

interface AuditLog {
  id: string
  action: string
  entityType: string
  entityId?: string
  entityName?: string
  userEmail?: string
  userId?: string
  ipAddress?: string
  createdAt: string
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [actionFilter, setActionFilter] = useState<string>('')
  const [entityFilter, setEntityFilter] = useState<string>('')

  const fetchLogs = () => {
    const params = new URLSearchParams({ page: String(page), pageSize: '30' })
    if (actionFilter) params.set('action', actionFilter)
    if (entityFilter) params.set('entityType', entityFilter)

    fetch(`/api/admin/audit?${params}`)
      .then(r => r.json())
      .then(r => {
        setLogs(r.data || [])
        setTotal(r.pagination?.total || 0)
      })
  }

  useEffect(() => { fetchLogs() }, [page, actionFilter, entityFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <Button variant="outline" onClick={() => window.open('/api/admin/export/audit', '_blank')}>
          Xuất Excel
        </Button>
      </div>

      <div className="flex gap-4">
        <Select value={actionFilter} onValueChange={v => { setActionFilter(v === 'all' ? '' : v); setPage(1) }}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Hành động" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {Object.entries(AUDIT_ACTIONS).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={entityFilter} onValueChange={v => { setEntityFilter(v === 'all' ? '' : v); setPage(1) }}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Đối tượng" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {Object.entries(ENTITY_TYPES).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader><CardTitle>Lịch sử ({total})</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Thời gian</th>
                  <th className="text-left p-2">Người dùng</th>
                  <th className="text-left p-2">Hành động</th>
                  <th className="text-left p-2">Đối tượng</th>
                  <th className="text-left p-2">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-b hover:bg-muted/50">
                    <td className="p-2 whitespace-nowrap">{new Date(log.createdAt).toLocaleString('vi-VN')}</td>
                    <td className="p-2">{log.userEmail || log.userId || 'System'}</td>
                    <td className="p-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${AUDIT_ACTIONS[log.action]?.color === 'green' ? 'bg-green-100 text-green-700' : AUDIT_ACTIONS[log.action]?.color === 'red' ? 'bg-red-100 text-red-700' : AUDIT_ACTIONS[log.action]?.color === 'blue' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                        {AUDIT_ACTIONS[log.action]?.label || log.action}
                      </span>
                    </td>
                    <td className="p-2">{ENTITY_TYPES[log.entityType] || log.entityType}</td>
                    <td className="p-2 text-muted-foreground">{log.entityName || log.entityId || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {total > 30 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Trước</Button>
              <span className="text-sm py-2">Trang {page}/{Math.ceil(total / 30)}</span>
              <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / 30)} onClick={() => setPage(p => p + 1)}>Sau</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
