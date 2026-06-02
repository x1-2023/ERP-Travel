'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface SystemStats {
  employees: number
  users: number
  auditLogs30d: number
  emailQueuePending: number
  importJobs7d: number
  activeApiKeys: number
  activeWebhooks: number
}

interface HealthData {
  status: string
  timestamp: string
  services: Record<string, { status: string }>
  uptime: number
}

export default function SystemDashboardPage() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [health, setHealth] = useState<HealthData | null>(null)

  useEffect(() => {
    fetch('/api/admin/system/stats').then(r => r.json()).then(r => setStats(r.data))
    fetch('/api/admin/system/health').then(r => r.json()).then(r => setHealth(r.data))
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quản trị hệ thống</h1>

      {health && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Trạng thái hệ thống
              <Badge variant={health.status === 'healthy' ? 'default' : 'destructive'}>
                {health.status === 'healthy' ? 'Hoạt động' : 'Có lỗi'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(health.services).map(([name, svc]) => (
                <div key={name} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${svc.status === 'up' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="capitalize">{name}</span>
                </div>
              ))}
              <div className="text-sm text-muted-foreground">
                Uptime: {Math.floor((health.uptime || 0) / 3600)}h {Math.floor(((health.uptime || 0) % 3600) / 60)}m
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.employees}</div>
              <p className="text-sm text-muted-foreground">Nhân viên</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.users}</div>
              <p className="text-sm text-muted-foreground">Người dùng</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.auditLogs30d}</div>
              <p className="text-sm text-muted-foreground">Audit logs (30 ngày)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.emailQueuePending}</div>
              <p className="text-sm text-muted-foreground">Email chờ gửi</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.importJobs7d}</div>
              <p className="text-sm text-muted-foreground">Import (7 ngày)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.activeApiKeys}</div>
              <p className="text-sm text-muted-foreground">API Keys</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.activeWebhooks}</div>
              <p className="text-sm text-muted-foreground">Webhooks</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
