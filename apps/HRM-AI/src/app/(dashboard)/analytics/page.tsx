// src/app/(dashboard)/analytics/page.tsx
// Analytics Hub - Overview Page

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Users,
  TrendingUp,
  TrendingDown,
  Brain,
  FileText,
  Bell,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
} from 'lucide-react'

interface QuickStats {
  totalEmployees: number
  activeEmployees: number
  turnoverRate: number
  highRiskCount: number
  pendingAlerts: number
  recentReports: number
}

export default function AnalyticsHubPage() {
  const [stats, setStats] = useState<QuickStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuickStats()
  }, [])

  const fetchQuickStats = async () => {
    try {
      // Fetch workforce metrics
      const endDate = new Date()
      const startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1)

      const [workforceRes, predictionsRes, alertsRes] = await Promise.all([
        fetch(`/api/analytics/workforce?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`),
        fetch('/api/analytics/predictions?riskLevel=HIGH&limit=100'),
        fetch('/api/analytics/alerts?status=ACTIVE'),
      ])

      const workforceData = workforceRes.ok ? await workforceRes.json() : null
      const predictionsData = predictionsRes.ok ? await predictionsRes.json() : null
      const alertsData = alertsRes.ok ? await alertsRes.json() : null

      setStats({
        totalEmployees: workforceData?.data?.headcount?.total || 0,
        activeEmployees: workforceData?.data?.headcount?.active || 0,
        turnoverRate: workforceData?.data?.turnover?.rate || 0,
        highRiskCount: predictionsData?.data?.length || 0,
        pendingAlerts: alertsData?.data?.filter((a: { status: string }) => a.status === 'ACTIVE').length || 0,
        recentReports: 5, // Placeholder
      })
    } catch (error) {
      console.error('Error fetching quick stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickAccessCards = [
    {
      title: 'Executive Dashboard',
      description: 'Tổng quan KPIs và metrics cho lãnh đạo',
      href: '/analytics/executive',
      icon: BarChart3,
      color: 'bg-blue-500',
    },
    {
      title: 'Phân tích nhân sự',
      description: 'Số lượng, cơ cấu, biến động nhân sự',
      href: '/analytics/workforce',
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: 'Dự đoán thông minh',
      description: 'AI dự báo nguy cơ nghỉ việc, tuyển dụng',
      href: '/analytics/predictive',
      icon: Brain,
      color: 'bg-purple-500',
    },
    {
      title: 'Báo cáo tùy chỉnh',
      description: 'Tạo và quản lý báo cáo theo nhu cầu',
      href: '/analytics/reports',
      icon: FileText,
      color: 'bg-orange-500',
    },
    {
      title: 'Cảnh báo',
      description: 'Thiết lập và quản lý cảnh báo tự động',
      href: '/analytics/alerts',
      icon: Bell,
      color: 'bg-red-500',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics Hub</h1>
        <p className="text-muted-foreground mt-1">
          Trung tâm phân tích dữ liệu nhân sự thông minh
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng nhân sự</p>
                {loading ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.totalEmployees || 0}</p>
                )}
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-muted-foreground">
                {stats?.activeEmployees || 0} đang hoạt động
              </span>
            </div>
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
                  <p className="text-2xl font-bold">{stats?.turnoverRate || 0}%</p>
                )}
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                {(stats?.turnoverRate || 0) > 15 ? (
                  <TrendingUp className="h-6 w-6 text-red-600" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-green-600" />
                )}
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              {(stats?.turnoverRate || 0) > 15 ? (
                <span className="text-red-600">Cao hơn mức trung bình</span>
              ) : (
                <span className="text-green-600">Trong tầm kiểm soát</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Nguy cơ cao</p>
                {loading ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.highRiskCount || 0}</p>
                )}
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-muted-foreground">nhân viên cần chú ý</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cảnh báo đang hoạt động</p>
                {loading ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.pendingAlerts || 0}</p>
                )}
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Bell className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-muted-foreground">cần xử lý</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Truy cập nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickAccessCards.map((card) => (
            <Link key={card.href} href={card.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${card.color}`}>
                      <card.icon className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-lg">{card.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{card.description}</CardDescription>
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

      {/* Recent Activity & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Cảnh báo gần đây</CardTitle>
              <Link href="/analytics/alerts">
                <Button variant="ghost" size="sm">
                  Xem tất cả
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <>
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Tỷ lệ nghỉ việc cao</p>
                      <p className="text-xs text-muted-foreground">Phòng Kinh doanh - 2 giờ trước</p>
                    </div>
                    <Badge variant="destructive">Nghiêm trọng</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">5 hợp đồng sắp hết hạn</p>
                      <p className="text-xs text-muted-foreground">Cần xử lý trong 30 ngày</p>
                    </div>
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">Cảnh báo</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Mục tiêu Q4 đạt 95%</p>
                      <p className="text-xs text-muted-foreground">Toàn công ty - 1 ngày trước</p>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">Thông tin</Badge>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Thông tin từ AI</CardTitle>
              <Link href="/analytics/predictive">
                <Button variant="ghost" size="sm">
                  Xem thêm
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <>
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </>
              ) : (
                <>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Dự báo nghỉ việc</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {stats?.highRiskCount || 0} nhân viên có nguy cơ nghỉ việc cao trong 3 tháng tới.
                      Phòng Kinh doanh và IT cần được chú ý đặc biệt.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Xu hướng tuyển dụng</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Dựa trên phân tích, công ty cần tuyển thêm 8-12 nhân viên trong Q1
                      để đảm bảo tiến độ dự án.
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
