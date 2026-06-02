// src/app/(dashboard)/analytics/workforce/headcount/page.tsx
// Headcount Analysis Page

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RefreshCw, Download } from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
} from 'recharts'

interface HeadcountData {
  total: number
  active: number
  probation: number
  onLeave: number
  byDepartment: Array<{ department: string; count: number }>
  byPosition: Array<{ position: string; count: number }>
}

export default function HeadcountPage() {
  const [period, setPeriod] = useState('year')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<HeadcountData | null>(null)
  const [trendData, setTrendData] = useState<Array<{ month: string; count: number; hires: number; terminations: number }>>([])

  useEffect(() => {
    fetchData()
  }, [period])

  const fetchData = async () => {
    setLoading(true)
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setFullYear(startDate.getFullYear() - 1)

      const response = await fetch(
        `/api/analytics/workforce?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      )

      if (response.ok) {
        const result = await response.json()
        setData(result.data?.headcount || null)
      }

      // Fetch real trend data
      try {
        const trendsRes = await fetch('/api/analytics/workforce/trends')
        if (trendsRes.ok) {
          const trendsJson = await trendsRes.json()
          setTrendData((trendsJson.data || []).map((t: { month: string; headcount: number; hires: number; terminations: number }) => ({
            month: t.month,
            count: t.headcount,
            hires: t.hires,
            terminations: t.terminations,
          })))
        }
      } catch (e) {
        console.error('Error fetching trends:', e)
      }
    } catch (error) {
      console.error('Error fetching headcount data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Phân tích số lượng nhân sự</h1>
          <p className="text-muted-foreground mt-1">
            Chi tiết về số lượng và phân bổ nhân sự
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Kỳ báo cáo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quarter">Quý này</SelectItem>
              <SelectItem value="year">Năm nay</SelectItem>
              <SelectItem value="2years">2 năm</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Xuất
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Tổng nhân sự</p>
            {loading ? (
              <Skeleton className="h-8 w-20 mt-1" />
            ) : (
              <p className="text-3xl font-bold">{data?.total || 0}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Đang hoạt động</p>
            {loading ? (
              <Skeleton className="h-8 w-20 mt-1" />
            ) : (
              <p className="text-3xl font-bold text-green-600">{data?.active || 0}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Thử việc</p>
            {loading ? (
              <Skeleton className="h-8 w-20 mt-1" />
            ) : (
              <p className="text-3xl font-bold text-orange-600">{data?.probation || 0}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Nghỉ phép</p>
            {loading ? (
              <Skeleton className="h-8 w-20 mt-1" />
            ) : (
              <p className="text-3xl font-bold text-blue-600">{data?.onLeave || 0}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Xu hướng nhân sự</CardTitle>
          <CardDescription>Biến động số lượng nhân sự theo thời gian</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[400px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="count"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  stroke="#3b82f6"
                  name="Tổng nhân sự"
                />
                <Bar yAxisId="right" dataKey="hires" fill="#10b981" name="Tuyển mới" />
                <Bar yAxisId="right" dataKey="terminations" fill="#ef4444" name="Nghỉ việc" />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Distribution Charts */}
      <Tabs defaultValue="department" className="space-y-4">
        <TabsList>
          <TabsTrigger value="department">Theo phòng ban</TabsTrigger>
          <TabsTrigger value="position">Theo vị trí</TabsTrigger>
        </TabsList>

        <TabsContent value="department">
          <Card>
            <CardHeader>
              <CardTitle>Phân bổ theo phòng ban</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={data?.byDepartment || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="department" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" name="Số nhân viên" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="position">
          <Card>
            <CardHeader>
              <CardTitle>Phân bổ theo vị trí</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={data?.byPosition || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="position" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" name="Số nhân viên" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
