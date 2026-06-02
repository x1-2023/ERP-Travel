// src/app/(dashboard)/analytics/alerts/page.tsx
// Alerts Management Page

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import {
  Bell,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  RefreshCw,
  Filter,
} from 'lucide-react'

interface Alert {
  id: string
  name: string
  description: string | null
  metricType: string
  condition: string
  threshold: number
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'IDLE' | 'ACTIVE' | 'RESOLVED' | 'DISABLED'
  isActive: boolean
  lastTriggeredAt: string | null
  triggerCount: number
  department: { id: string; name: string } | null
}

interface AlertHistory {
  id: string
  triggeredAt: string
  metricValue: number
  message: string
  acknowledgedAt: string | null
  resolvedAt: string | null
}

const SEVERITY_COLORS = {
  LOW: 'bg-blue-100 text-blue-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
}

const STATUS_COLORS = {
  IDLE: 'bg-gray-100 text-gray-800',
  ACTIVE: 'bg-red-100 text-red-800',
  RESOLVED: 'bg-green-100 text-green-800',
  DISABLED: 'bg-gray-100 text-gray-500',
}

const SEVERITY_LABELS = {
  LOW: 'Thấp',
  MEDIUM: 'Trung bình',
  HIGH: 'Cao',
  CRITICAL: 'Nghiêm trọng',
}

const STATUS_LABELS = {
  IDLE: 'Chờ',
  ACTIVE: 'Đang kích hoạt',
  RESOLVED: 'Đã xử lý',
  DISABLED: 'Tắt',
}

export default function AlertsPage() {
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [history, setHistory] = useState<AlertHistory[]>([])

  useEffect(() => {
    fetchAlerts()
  }, [statusFilter, severityFilter])

  const fetchAlerts = async () => {
    setLoading(true)
    try {
      let url = '/api/analytics/alerts?'
      if (statusFilter !== 'all') url += `status=${statusFilter}&`
      if (severityFilter !== 'all') url += `severity=${severityFilter}&`

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setAlerts(data.data || [])
      } else {
        // Mock data
        setAlerts([
          {
            id: '1',
            name: 'Tỷ lệ nghỉ việc cao',
            description: 'Cảnh báo khi tỷ lệ nghỉ việc vượt 15%',
            metricType: 'turnover_rate',
            condition: 'gt',
            threshold: 15,
            severity: 'CRITICAL',
            status: 'ACTIVE',
            isActive: true,
            lastTriggeredAt: '2024-01-20T10:00:00Z',
            triggerCount: 3,
            department: null,
          },
          {
            id: '2',
            name: 'Hợp đồng sắp hết hạn',
            description: 'Cảnh báo khi có nhiều hợp đồng sắp hết hạn',
            metricType: 'expiring_contracts',
            condition: 'gte',
            threshold: 5,
            severity: 'HIGH',
            status: 'ACTIVE',
            isActive: true,
            lastTriggeredAt: '2024-01-19T14:30:00Z',
            triggerCount: 2,
            department: null,
          },
          {
            id: '3',
            name: 'Nhân viên nguy cơ cao',
            description: 'Cảnh báo khi số nhân viên nguy cơ cao tăng',
            metricType: 'high_risk_employees',
            condition: 'gte',
            threshold: 10,
            severity: 'HIGH',
            status: 'IDLE',
            isActive: true,
            lastTriggeredAt: null,
            triggerCount: 0,
            department: null,
          },
          {
            id: '4',
            name: 'Tỷ lệ chuyên cần thấp',
            description: 'Phòng Kinh doanh có tỷ lệ chuyên cần thấp',
            metricType: 'attendance_rate',
            condition: 'lt',
            threshold: 90,
            severity: 'MEDIUM',
            status: 'RESOLVED',
            isActive: true,
            lastTriggeredAt: '2024-01-15T09:00:00Z',
            triggerCount: 1,
            department: { id: '1', name: 'Phòng Kinh doanh' },
          },
        ])
      }
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAlert = async (alertId: string, isActive: boolean) => {
    try {
      await fetch(`/api/analytics/alerts/${alertId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      })
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, isActive } : a))
      )
    } catch (error) {
      console.error('Error toggling alert:', error)
    }
  }

  const checkAlerts = async () => {
    setLoading(true)
    try {
      await fetch('/api/analytics/alerts/check', { method: 'POST' })
      await fetchAlerts()
    } catch (error) {
      console.error('Error checking alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const viewHistory = async (alert: Alert) => {
    setSelectedAlert(alert)
    setHistoryOpen(true)
    // Mock history
    setHistory([
      {
        id: '1',
        triggeredAt: '2024-01-20T10:00:00Z',
        metricValue: 18.5,
        message: 'Tỷ lệ nghỉ việc đạt 18.5%, vượt ngưỡng 15%',
        acknowledgedAt: '2024-01-20T10:30:00Z',
        resolvedAt: null,
      },
      {
        id: '2',
        triggeredAt: '2024-01-15T09:00:00Z',
        metricValue: 16.2,
        message: 'Tỷ lệ nghỉ việc đạt 16.2%, vượt ngưỡng 15%',
        acknowledgedAt: '2024-01-15T09:15:00Z',
        resolvedAt: '2024-01-16T14:00:00Z',
      },
    ])
  }

  const filteredAlerts = alerts.filter((alert) =>
    alert.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStats = () => ({
    total: alerts.length,
    active: alerts.filter((a) => a.status === 'ACTIVE').length,
    resolved: alerts.filter((a) => a.status === 'RESOLVED').length,
    disabled: alerts.filter((a) => !a.isActive).length,
  })

  const stats = getStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Quản lý cảnh báo</h1>
          <p className="text-muted-foreground mt-1">
            Thiết lập và theo dõi cảnh báo tự động
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={checkAlerts}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Link href="/analytics/alerts/settings">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Cấu hình
            </Button>
          </Link>
          <Link href="/analytics/alerts/settings">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tạo cảnh báo
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Tổng cảnh báo</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Đang kích hoạt</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                <p className="text-sm text-muted-foreground">Đã xử lý</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Clock className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.disabled}</p>
                <p className="text-sm text-muted-foreground">Đã tắt</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm cảnh báo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="ACTIVE">Đang kích hoạt</SelectItem>
                <SelectItem value="IDLE">Chờ</SelectItem>
                <SelectItem value="RESOLVED">Đã xử lý</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Mức độ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="CRITICAL">Nghiêm trọng</SelectItem>
                <SelectItem value="HIGH">Cao</SelectItem>
                <SelectItem value="MEDIUM">Trung bình</SelectItem>
                <SelectItem value="LOW">Thấp</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách cảnh báo</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredAlerts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên cảnh báo</TableHead>
                  <TableHead>Mức độ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Kích hoạt lần cuối</TableHead>
                  <TableHead>Số lần</TableHead>
                  <TableHead>Bật/Tắt</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{alert.name}</p>
                        {alert.department && (
                          <p className="text-sm text-muted-foreground">
                            {alert.department.name}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={SEVERITY_COLORS[alert.severity]}>
                        {SEVERITY_LABELS[alert.severity]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[alert.status]}>
                        {STATUS_LABELS[alert.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {alert.lastTriggeredAt
                        ? formatDate(alert.lastTriggeredAt)
                        : '-'}
                    </TableCell>
                    <TableCell>{alert.triggerCount}</TableCell>
                    <TableCell>
                      <Switch
                        checked={alert.isActive}
                        onCheckedChange={(checked) => toggleAlert(alert.id, checked)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewHistory(alert)}
                      >
                        Lịch sử
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              Không tìm thấy cảnh báo phù hợp
            </div>
          )}
        </CardContent>
      </Card>

      {/* History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lịch sử cảnh báo: {selectedAlert?.name}</DialogTitle>
            <DialogDescription>
              Các lần kích hoạt cảnh báo gần đây
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {history.map((h) => (
              <div key={h.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="font-medium">{formatDate(h.triggeredAt)}</span>
                  </div>
                  <Badge variant="outline">
                    Giá trị: {h.metricValue}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{h.message}</p>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  {h.acknowledgedAt && (
                    <span>Xác nhận: {formatDate(h.acknowledgedAt)}</span>
                  )}
                  {h.resolvedAt && (
                    <span className="text-green-600">
                      Đã xử lý: {formatDate(h.resolvedAt)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
