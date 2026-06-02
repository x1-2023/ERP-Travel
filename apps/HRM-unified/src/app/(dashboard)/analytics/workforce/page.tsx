// src/app/(dashboard)/analytics/workforce/page.tsx
// Workforce Analytics Overview

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  UserPlus,
  UserMinus,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  BarChart3,
  PieChart as PieChartIcon,
  RefreshCw,
} from 'lucide-react'
import {
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

interface WorkforceData {
  headcount: {
    total: number
    active: number
    probation: number
    onLeave: number
    byDepartment: Array<{ department: string; count: number }>
    byGender: Array<{ gender: string; count: number }>
    byAge: Array<{ range: string; count: number }>
    byTenure: Array<{ range: string; count: number }>
  }
  movement: {
    newHires: number
    terminations: number
    promotions: number
    transfers: number
    netChange: number
  }
  turnover: {
    rate: number
    voluntaryRate: number
    involuntaryRate: number
    byDepartment: Array<{ department: string; rate: number }>
    byReason: Array<{ reason: string; count: number }>
  }
  retention: {
    rate: number
    avgTenure: number
    newHireRetention90Days: number
  }
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

export default function WorkforceOverviewPage() {
  const [period, setPeriod] = useState('month')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<WorkforceData | null>(null)

  useEffect(() => {
    fetchData()
  }, [period])

  const fetchData = async () => {
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
        const result = await response.json()
        setData(result.data)
      }
    } catch (error) {
      console.error('Error fetching workforce data:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickLinks = [
    {
      title: 'Số lượng nhân sự',
      description: 'Phân tích chi tiết số lượng theo phòng ban, vị trí',
      href: '/analytics/workforce/headcount',
      icon: BarChart3,
      color: 'bg-blue-500',
    },
    {
      title: 'Tỷ lệ nghỉ việc',
      description: 'Phân tích xu hướng và nguyên nhân nghỉ việc',
      href: '/analytics/workforce/turnover',
      icon: TrendingDown,
      color: 'bg-red-500',
    },
    {
      title: 'Nhân khẩu học',
      description: 'Phân tích giới tính, tuổi, thâm niên',
      href: '/analytics/workforce/demographics',
      icon: PieChartIcon,
      color: 'bg-purple-500',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Phân tích nhân sự</h1>
          <p className="text-muted-foreground mt-1">
            Tổng quan về số lượng, cơ cấu và biến động nhân sự
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
          <Button variant="outline" size="icon" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" />
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
                  <p className="text-2xl font-bold">{data?.headcount.total || 0}</p>
                )}
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {data?.headcount.active || 0} đang hoạt động
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tuyển mới</p>
                {loading ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-green-600">+{data?.movement.newHires || 0}</p>
                )}
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <UserPlus className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Trong kỳ báo cáo
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Nghỉ việc</p>
                {loading ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-red-600">-{data?.movement.terminations || 0}</p>
                )}
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <UserMinus className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Trong kỳ báo cáo
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Biến động ròng</p>
                {loading ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <p className={`text-2xl font-bold ${(data?.movement.netChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(data?.movement.netChange || 0) >= 0 ? '+' : ''}{data?.movement.netChange || 0}
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-full ${(data?.movement.netChange || 0) >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                {(data?.movement.netChange || 0) >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-green-600" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-600" />
                )}
              </div>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Tuyển mới - Nghỉ việc
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Phân tích chi tiết</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${link.color}`}>
                      <link.icon className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-lg">{link.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{link.description}</CardDescription>
                  <div className="mt-4 flex items-center text-primary text-sm font-medium">
                    Xem chi tiết
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Department */}
        <Card>
          <CardHeader>
            <CardTitle>Nhân sự theo phòng ban</CardTitle>
            <CardDescription>Phân bổ nhân sự hiện tại</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.headcount.byDepartment || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="department" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" name="Số nhân viên" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* By Status */}
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái nhân sự</CardTitle>
            <CardDescription>Phân bổ theo trạng thái làm việc</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Đang làm việc', value: data?.headcount.active || 0 },
                      { name: 'Thử việc', value: data?.headcount.probation || 0 },
                      { name: 'Nghỉ phép', value: data?.headcount.onLeave || 0 },
                    ].filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {[0, 1, 2].map((index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Turnover by Department */}
        <Card>
          <CardHeader>
            <CardTitle>Tỷ lệ nghỉ việc theo phòng ban</CardTitle>
            <CardDescription>So sánh giữa các phòng ban</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.turnover.byDepartment || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="rate" fill="#ef4444" name="Tỷ lệ nghỉ việc (%)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Retention Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Chỉ số giữ chân nhân viên</CardTitle>
            <CardDescription>Các metrics liên quan đến retention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Tỷ lệ giữ chân</span>
                  <span className="font-medium">{data?.retention.rate.toFixed(1) || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full"
                    style={{ width: `${data?.retention.rate || 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Retention 90 ngày (tuyển mới)</span>
                  <span className="font-medium">{data?.retention.newHireRetention90Days || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full"
                    style={{ width: `${data?.retention.newHireRetention90Days || 0}%` }}
                  />
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Thâm niên trung bình</span>
                  <span className="font-medium">{data?.retention.avgTenure.toFixed(1) || 0} năm</span>
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tỷ lệ nghỉ tự nguyện</span>
                  <Badge variant="outline">{data?.turnover.voluntaryRate.toFixed(1) || 0}%</Badge>
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tỷ lệ nghỉ không tự nguyện</span>
                  <Badge variant="outline">{data?.turnover.involuntaryRate.toFixed(1) || 0}%</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
