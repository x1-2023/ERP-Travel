// src/app/(dashboard)/analytics/predictive/page.tsx
// Predictive Analytics Hub

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Brain,
  UserMinus,
  Calendar,
  ArrowRight,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'

interface RiskDistribution {
  LOW: number
  MEDIUM: number
  HIGH: number
  CRITICAL: number
}

const RISK_COLORS = {
  LOW: '#10b981',
  MEDIUM: '#f59e0b',
  HIGH: '#f97316',
  CRITICAL: '#ef4444',
}

export default function PredictiveHubPage() {
  const [loading, setLoading] = useState(true)
  const [distribution, setDistribution] = useState<RiskDistribution | null>(null)
  const [highRiskEmployees, setHighRiskEmployees] = useState<Array<{
    entityName: string
    score: number
    riskLevel: string
  }>>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [predictionsRes] = await Promise.all([
        fetch('/api/analytics/predictions?limit=100'),
      ])

      if (predictionsRes.ok) {
        const predictionsData = await predictionsRes.json()
        const predictions = predictionsData.data || []

        // Calculate distribution
        const dist: RiskDistribution = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 }
        predictions.forEach((p: { riskLevel: keyof RiskDistribution }) => {
          if (dist[p.riskLevel] !== undefined) {
            dist[p.riskLevel]++
          }
        })
        setDistribution(dist)

        // Get high risk employees
        const highRisk = predictions
          .filter((p: { riskLevel: string }) => p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL')
          .slice(0, 5)
        setHighRiskEmployees(highRisk)
      }
    } catch (error) {
      console.error('Error fetching predictive data:', error)
    } finally {
      setLoading(false)
    }
  }

  const runPredictions = async () => {
    setLoading(true)
    try {
      await fetch('/api/analytics/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelType: 'TURNOVER_RISK' }),
      })
      await fetchData()
    } catch (error) {
      console.error('Error running predictions:', error)
    }
  }

  const pieData = distribution
    ? [
        { name: 'Thấp', value: distribution.LOW, color: RISK_COLORS.LOW },
        { name: 'Trung bình', value: distribution.MEDIUM, color: RISK_COLORS.MEDIUM },
        { name: 'Cao', value: distribution.HIGH, color: RISK_COLORS.HIGH },
        { name: 'Nghiêm trọng', value: distribution.CRITICAL, color: RISK_COLORS.CRITICAL },
      ].filter(d => d.value > 0)
    : []

  const quickLinks = [
    {
      title: 'Nguy cơ nghỉ việc',
      description: 'Dự đoán nhân viên có khả năng nghỉ việc cao',
      href: '/analytics/predictive/turnover-risk',
      icon: UserMinus,
      color: 'bg-red-500',
      stat: distribution ? distribution.HIGH + distribution.CRITICAL : 0,
      statLabel: 'nguy cơ cao',
    },
    {
      title: 'Dự báo tuyển dụng',
      description: 'Dự đoán nhu cầu tuyển dụng trong tương lai',
      href: '/analytics/predictive/hiring-forecast',
      icon: Calendar,
      color: 'bg-blue-500',
      stat: '8-12',
      statLabel: 'cần tuyển Q1',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold">Dự đoán thông minh</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Sử dụng AI để dự báo xu hướng nhân sự
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={runPredictions}>
            <Brain className="h-4 w-4 mr-2" />
            Chạy dự đoán
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Tổng dự đoán</p>
            {loading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-2xl font-bold">
                {distribution
                  ? distribution.LOW + distribution.MEDIUM + distribution.HIGH + distribution.CRITICAL
                  : 0}
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Nguy cơ thấp</p>
            {loading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-2xl font-bold text-green-600">{distribution?.LOW || 0}</p>
            )}
          </CardContent>
        </Card>
        <Card className="border-yellow-200">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Nguy cơ TB</p>
            {loading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-2xl font-bold text-yellow-600">{distribution?.MEDIUM || 0}</p>
            )}
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Nguy cơ cao/Nghiêm trọng</p>
            {loading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-2xl font-bold text-red-600">
                {(distribution?.HIGH || 0) + (distribution?.CRITICAL || 0)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${link.color}`}>
                      <link.icon className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-lg">{link.title}</CardTitle>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{link.stat}</p>
                    <p className="text-xs text-muted-foreground">{link.statLabel}</p>
                  </div>
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

      {/* Risk Distribution & High Risk Employees */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Phân bổ mức nguy cơ</CardTitle>
            <CardDescription>Tổng quan về mức độ rủi ro nhân sự</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Chưa có dữ liệu dự đoán. Nhấn "Chạy dự đoán" để bắt đầu.
              </div>
            )}
          </CardContent>
        </Card>

        {/* High Risk Employees */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Nhân viên nguy cơ cao</CardTitle>
                <CardDescription>Cần chú ý đặc biệt</CardDescription>
              </div>
              <Link href="/analytics/predictive/turnover-risk">
                <Button variant="ghost" size="sm">
                  Xem tất cả
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : highRiskEmployees.length > 0 ? (
              <div className="space-y-3">
                {highRiskEmployees.map((emp, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-medium">{emp.entityName}</p>
                        <p className="text-sm text-muted-foreground">
                          Điểm rủi ro: {emp.score.toFixed(0)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={emp.riskLevel === 'CRITICAL' ? 'destructive' : 'outline'}>
                      {emp.riskLevel === 'CRITICAL' ? 'Nghiêm trọng' : 'Cao'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Không có nhân viên nguy cơ cao
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Insights từ AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <span className="font-medium">Xu hướng nghỉ việc</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Dự kiến tỷ lệ nghỉ việc sẽ tăng 1.5% trong Q1 do mùa chuyển việc.
                Phòng Kinh doanh và IT có nguy cơ cao nhất.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Nhu cầu tuyển dụng</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Cần tuyển 8-12 nhân viên trong Q1 để bù đắp nghỉ việc dự kiến
                và đáp ứng tăng trưởng kinh doanh.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
