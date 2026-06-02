// src/app/(dashboard)/analytics/executive/page.tsx
// Executive Dashboard

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Target,
  Download,
  RefreshCw,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface ExecutiveMetrics {
  headcount: {
    total: number
    active: number
    change: number
    changePercent: number
  }
  turnover: {
    rate: number
    change: number
    benchmark: number
  }
  labor: {
    totalCost: number
    avgSalary: number
    costPerEmployee: number
    change: number
  }
  productivity: {
    avgHoursPerWeek: number
    overtimePercent: number
    attendanceRate: number
  }
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function ExecutiveDashboardPage() {
  const [period, setPeriod] = useState('month')
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<ExecutiveMetrics | null>(null)
  const [headcountTrend, setHeadcountTrend] = useState<Array<{ month: string; count: number }>>([])
  const [departmentData, setDepartmentData] = useState<Array<{ name: string; value: number }>>([])
  const [turnoverTrend, setTurnoverTrend] = useState<Array<{ month: string; rate: number; benchmark: number }>>([])

  useEffect(() => {
    fetchDashboardData()
  }, [period])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const endDate = new Date()
      const startDate = new Date()

      switch (period) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1)
          break
        case 'quarter':
          startDate.setMonth(startDate.getMonth() - 3)
          break
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1)
          break
      }

      const response = await fetch(
        `/api/analytics/workforce?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      )

      if (response.ok) {
        const data = await response.json()
        const workforce = data.data

        setMetrics({
          headcount: {
            total: workforce.headcount?.total || 0,
            active: workforce.headcount?.active || 0,
            change: workforce.movement?.netChange || 0,
            changePercent: 2.5, // Placeholder
          },
          turnover: {
            rate: workforce.turnover?.rate || 0,
            change: -0.5,
            benchmark: 12,
          },
          labor: {
            totalCost: 5200000000,
            avgSalary: 18500000,
            costPerEmployee: 21000000,
            change: 3.2,
          },
          productivity: {
            avgHoursPerWeek: 42,
            overtimePercent: 15,
            attendanceRate: 95.5,
          },
        })

        // Department breakdown
        setDepartmentData(
          (workforce.headcount?.byDepartment || []).map((d: { department: string; count: number }) => ({
            name: d.department,
            value: d.count,
          }))
        )
      }

      // Fetch real trend data
      try {
        const trendsRes = await fetch('/api/analytics/workforce/trends')
        if (trendsRes.ok) {
          const trendsJson = await trendsRes.json()
          const trends = trendsJson.data || []
          setHeadcountTrend(trends.map((t: { month: string; headcount: number }) => ({
            month: t.month,
            count: t.headcount,
          })))
          setTurnoverTrend(trends.map((t: { month: string; turnoverRate: number; benchmark: number }) => ({
            month: t.month,
            rate: t.turnoverRate,
            benchmark: t.benchmark,
          })))
        }
      } catch (e) {
        console.error('Error fetching trends:', e)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    return value.toLocaleString('vi-VN')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Executive Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Tổng quan KPIs và metrics cho lãnh đạo
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Kỳ báo cáo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Tuần này</SelectItem>
              <SelectItem value="month">Tháng này</SelectItem>
              <SelectItem value="quarter">Quý này</SelectItem>
              <SelectItem value="year">Năm nay</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchDashboardData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng nhân sự</p>
                {loading ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <p className="text-2xl font-bold">{metrics?.headcount.total || 0}</p>
                )}
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            {!loading && metrics && (
              <div className="mt-2 flex items-center gap-1 text-sm">
                {metrics.headcount.change >= 0 ? (
                  <ArrowUp className="h-4 w-4 text-green-600" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-600" />
                )}
                <span className={metrics.headcount.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(metrics.headcount.change)} ({metrics.headcount.changePercent}%)
                </span>
                <span className="text-muted-foreground">so với kỳ trước</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tỷ lệ nghỉ việc</p>
                {loading ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <p className="text-2xl font-bold">{metrics?.turnover.rate.toFixed(1)}%</p>
                )}
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                {(metrics?.turnover.rate || 0) > 15 ? (
                  <TrendingUp className="h-6 w-6 text-red-600" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-green-600" />
                )}
              </div>
            </div>
            {!loading && metrics && (
              <div className="mt-2 flex items-center gap-2 text-sm">
                <Badge variant={(metrics.turnover.rate <= metrics.turnover.benchmark) ? 'default' : 'destructive'}>
                  {metrics.turnover.rate <= metrics.turnover.benchmark ? 'Tốt' : 'Cao'}
                </Badge>
                <span className="text-muted-foreground">
                  Benchmark: {metrics.turnover.benchmark}%
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Chi phí lương</p>
                {loading ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <p className="text-2xl font-bold">{formatCurrency(metrics?.labor.totalCost || 0)}</p>
                )}
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            {!loading && metrics && (
              <div className="mt-2 flex items-center gap-1 text-sm">
                <ArrowUp className="h-4 w-4 text-yellow-600" />
                <span className="text-yellow-600">{metrics.labor.change}%</span>
                <span className="text-muted-foreground">so với kỳ trước</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tỷ lệ chuyên cần</p>
                {loading ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <p className="text-2xl font-bold">{metrics?.productivity.attendanceRate}%</p>
                )}
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            {!loading && metrics && (
              <div className="mt-2 flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  OT: {metrics.productivity.overtimePercent}% tổng giờ làm
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Headcount Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Xu hướng nhân sự</CardTitle>
            <CardDescription>Biến động số lượng nhân viên theo thời gian</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={headcountTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    name="Nhân sự"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Phân bố theo phòng ban</CardTitle>
            <CardDescription>Cơ cấu nhân sự hiện tại</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={departmentData.slice(0, 6)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {departmentData.slice(0, 6).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Turnover Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tỷ lệ nghỉ việc</CardTitle>
            <CardDescription>So sánh với benchmark ngành</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={turnoverTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="rate" fill="#ef4444" name="Tỷ lệ nghỉ việc" />
                  <Bar dataKey="benchmark" fill="#94a3b8" name="Benchmark" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats Table */}
        <Card>
          <CardHeader>
            <CardTitle>Thống kê nhanh</CardTitle>
            <CardDescription>Các chỉ số quan trọng khác</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-muted-foreground">Lương trung bình</span>
                <span className="font-medium">
                  {loading ? (
                    <Skeleton className="h-5 w-24" />
                  ) : (
                    formatCurrency(metrics?.labor.avgSalary || 0) + ' VND'
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-muted-foreground">Chi phí/nhân viên</span>
                <span className="font-medium">
                  {loading ? (
                    <Skeleton className="h-5 w-24" />
                  ) : (
                    formatCurrency(metrics?.labor.costPerEmployee || 0) + ' VND'
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-muted-foreground">Giờ làm TB/tuần</span>
                <span className="font-medium">
                  {loading ? <Skeleton className="h-5 w-16" /> : `${metrics?.productivity.avgHoursPerWeek}h`}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-muted-foreground">NV đang hoạt động</span>
                <span className="font-medium">
                  {loading ? <Skeleton className="h-5 w-16" /> : metrics?.headcount.active}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-muted-foreground">% OT so với tổng giờ</span>
                <span className="font-medium">
                  {loading ? <Skeleton className="h-5 w-16" /> : `${metrics?.productivity.overtimePercent}%`}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
