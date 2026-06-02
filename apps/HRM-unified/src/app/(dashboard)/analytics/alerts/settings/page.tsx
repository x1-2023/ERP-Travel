// src/app/(dashboard)/analytics/alerts/settings/page.tsx
// Alert Settings Page

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Save,
  Plus,
  Bell,
  Mail,
  Trash2,
} from 'lucide-react'

interface MetricType {
  id: string
  name: string
  unit: string
  defaultThreshold: number
}

interface Department {
  id: string
  name: string
}

export default function AlertSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [metricTypes, setMetricTypes] = useState<MetricType[]>([])
  const [departments, setDepartments] = useState<Department[]>([])

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [metricType, setMetricType] = useState('')
  const [condition, setCondition] = useState('gt')
  const [threshold, setThreshold] = useState('')
  const [severity, setSeverity] = useState('MEDIUM')
  const [departmentId, setDepartmentId] = useState('')
  const [notifyEmail, setNotifyEmail] = useState(true)
  const [notifyInApp, setNotifyInApp] = useState(true)
  const [cooldownMinutes, setCooldownMinutes] = useState('60')
  const [notifyRoles, setNotifyRoles] = useState<string[]>(['HR_MANAGER'])

  useEffect(() => {
    fetchMetricTypes()
    fetchDepartments()
  }, [])

  const fetchMetricTypes = async () => {
    try {
      const response = await fetch('/api/analytics/alerts/metric-types')
      if (response.ok) {
        const data = await response.json()
        setMetricTypes(data.data || [])
      } else {
        // Mock data
        setMetricTypes([
          { id: 'turnover_rate', name: 'Tỷ lệ nghỉ việc', unit: '%', defaultThreshold: 15 },
          { id: 'attendance_rate', name: 'Tỷ lệ chuyên cần', unit: '%', defaultThreshold: 90 },
          { id: 'overtime_hours', name: 'Giờ làm thêm TB', unit: 'giờ', defaultThreshold: 30 },
          { id: 'headcount', name: 'Tổng nhân sự', unit: 'người', defaultThreshold: 100 },
          { id: 'high_risk_employees', name: 'NV nguy cơ cao', unit: 'người', defaultThreshold: 5 },
          { id: 'expiring_contracts', name: 'HĐ sắp hết hạn', unit: 'hợp đồng', defaultThreshold: 10 },
          { id: 'open_positions', name: 'Vị trí tuyển dụng', unit: 'vị trí', defaultThreshold: 20 },
        ])
      }
    } catch (error) {
      console.error('Error fetching metric types:', error)
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments')
      if (response.ok) {
        const data = await response.json()
        setDepartments(data.data || data || [])
      } else {
        setDepartments([
          { id: '1', name: 'Phòng Kinh doanh' },
          { id: '2', name: 'Phòng IT' },
          { id: '3', name: 'Phòng Nhân sự' },
          { id: '4', name: 'Phòng Marketing' },
        ])
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }

  const handleMetricChange = (value: string) => {
    setMetricType(value)
    const metric = metricTypes.find((m) => m.id === value)
    if (metric) {
      setThreshold(metric.defaultThreshold.toString())
    }
  }

  const toggleRole = (role: string) => {
    setNotifyRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
  }

  const saveAlert = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/analytics/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          metricType,
          condition,
          threshold: parseFloat(threshold),
          severity,
          departmentId: departmentId || undefined,
          notifyEmail,
          notifyInApp,
          cooldownMinutes: parseInt(cooldownMinutes),
          notifyRoles,
        }),
      })

      if (response.ok) {
        router.push('/analytics/alerts')
      }
    } catch (error) {
      console.error('Error saving alert:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectedMetric = metricTypes.find((m) => m.id === metricType)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Tạo cảnh báo mới</h1>
          <p className="text-muted-foreground">
            Thiết lập cảnh báo tự động dựa trên các metrics
          </p>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList>
          <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
          <TabsTrigger value="conditions">Điều kiện</TabsTrigger>
          <TabsTrigger value="notifications">Thông báo</TabsTrigger>
        </TabsList>

        {/* Basic Info */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>Đặt tên và mô tả cho cảnh báo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên cảnh báo *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Tỷ lệ nghỉ việc cao"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả chi tiết về cảnh báo..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Mức độ nghiêm trọng</Label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Thấp</SelectItem>
                    <SelectItem value="MEDIUM">Trung bình</SelectItem>
                    <SelectItem value="HIGH">Cao</SelectItem>
                    <SelectItem value="CRITICAL">Nghiêm trọng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Phòng ban (tùy chọn)</Label>
                <Select value={departmentId} onValueChange={setDepartmentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Áp dụng cho toàn công ty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toàn công ty</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conditions */}
        <TabsContent value="conditions">
          <Card>
            <CardHeader>
              <CardTitle>Điều kiện kích hoạt</CardTitle>
              <CardDescription>Thiết lập ngưỡng và điều kiện</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Loại metric *</Label>
                <Select value={metricType} onValueChange={handleMetricChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn metric" />
                  </SelectTrigger>
                  <SelectContent>
                    {metricTypes.map((metric) => (
                      <SelectItem key={metric.id} value={metric.id}>
                        {metric.name} ({metric.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Điều kiện</Label>
                  <Select value={condition} onValueChange={setCondition}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gt">Lớn hơn ({'>'})</SelectItem>
                      <SelectItem value="gte">Lớn hơn hoặc bằng ({'>'}=)</SelectItem>
                      <SelectItem value="lt">Nhỏ hơn ({'<'})</SelectItem>
                      <SelectItem value="lte">Nhỏ hơn hoặc bằng ({'<'}=)</SelectItem>
                      <SelectItem value="eq">Bằng (=)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ngưỡng *</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={threshold}
                      onChange={(e) => setThreshold(e.target.value)}
                      placeholder="Nhập giá trị"
                    />
                    {selectedMetric && (
                      <span className="flex items-center text-muted-foreground">
                        {selectedMetric.unit}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Thời gian chờ giữa các lần cảnh báo</Label>
                <Select value={cooldownMinutes} onValueChange={setCooldownMinutes}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 phút</SelectItem>
                    <SelectItem value="30">30 phút</SelectItem>
                    <SelectItem value="60">1 giờ</SelectItem>
                    <SelectItem value="120">2 giờ</SelectItem>
                    <SelectItem value="360">6 giờ</SelectItem>
                    <SelectItem value="720">12 giờ</SelectItem>
                    <SelectItem value="1440">24 giờ</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Cảnh báo sẽ không được gửi lại trong khoảng thời gian này
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt thông báo</CardTitle>
              <CardDescription>Chọn cách thức nhận thông báo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Kênh thông báo</Label>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Thông báo trong app</p>
                      <p className="text-sm text-muted-foreground">
                        Nhận thông báo trực tiếp trong hệ thống
                      </p>
                    </div>
                  </div>
                  <Switch checked={notifyInApp} onCheckedChange={setNotifyInApp} />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">
                        Gửi email đến người nhận
                      </p>
                    </div>
                  </div>
                  <Switch checked={notifyEmail} onCheckedChange={setNotifyEmail} />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Gửi thông báo đến vai trò</Label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'SUPER_ADMIN', label: 'Super Admin' },
                    { id: 'ADMIN', label: 'Admin' },
                    { id: 'HR_MANAGER', label: 'HR Manager' },
                    { id: 'HR_STAFF', label: 'HR Staff' },
                  ].map((role) => (
                    <div
                      key={role.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        notifyRoles.includes(role.id)
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => toggleRole(role.id)}
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox checked={notifyRoles.includes(role.id)} />
                        <span>{role.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()}>
          Hủy
        </Button>
        <Button onClick={saveAlert} disabled={loading || !name || !metricType || !threshold}>
          <Save className="h-4 w-4 mr-2" />
          Lưu cảnh báo
        </Button>
      </div>
    </div>
  )
}
