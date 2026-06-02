// src/app/(dashboard)/analytics/predictive/hiring-forecast/page.tsx
// Hiring Forecast Page

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Calendar,
  Users,
  TrendingUp,
  Building2,
  RefreshCw,
  Download,
} from 'lucide-react'
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

interface ForecastData {
  period: string
  predicted: number
  replacement: number
  growth: number
  total: number
}

interface DepartmentNeed {
  department: string
  current: number
  projected: number
  gap: number
  priority: 'high' | 'medium' | 'low'
}

export default function HiringForecastPage() {
  const [loading, setLoading] = useState(true)
  const [horizon, setHorizon] = useState('6months')
  const [forecastData, setForecastData] = useState<ForecastData[]>([])
  const [departmentNeeds, setDepartmentNeeds] = useState<DepartmentNeed[]>([])
  const [summary, setSummary] = useState({
    totalNeeded: 0,
    forReplacement: 0,
    forGrowth: 0,
  })

  useEffect(() => {
    fetchData()
  }, [horizon])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Simulate API call - in reality would fetch from /api/analytics/hiring-forecast
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Generate mock forecast data
      const months = horizon === '3months' ? 3 : horizon === '6months' ? 6 : 12
      const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12']
      const currentMonth = new Date().getMonth()

      const forecast: ForecastData[] = []
      let totalNeeded = 0
      let totalReplacement = 0
      let totalGrowth = 0

      for (let i = 0; i < months; i++) {
        const monthIndex = (currentMonth + i + 1) % 12
        const replacement = Math.floor(2 + Math.random() * 4)
        const growth = Math.floor(1 + Math.random() * 3)
        const total = replacement + growth

        forecast.push({
          period: monthNames[monthIndex],
          predicted: total,
          replacement,
          growth,
          total,
        })

        totalNeeded += total
        totalReplacement += replacement
        totalGrowth += growth
      }

      setForecastData(forecast)
      setSummary({
        totalNeeded,
        forReplacement: totalReplacement,
        forGrowth: totalGrowth,
      })

      // Department needs
      setDepartmentNeeds([
        { department: 'Phòng Kinh doanh', current: 45, projected: 52, gap: 7, priority: 'high' },
        { department: 'Phòng IT', current: 30, projected: 35, gap: 5, priority: 'high' },
        { department: 'Phòng Marketing', current: 15, projected: 18, gap: 3, priority: 'medium' },
        { department: 'Phòng Nhân sự', current: 10, projected: 12, gap: 2, priority: 'medium' },
        { department: 'Phòng Kế toán', current: 12, projected: 13, gap: 1, priority: 'low' },
      ])
    } catch (error) {
      console.error('Error fetching forecast data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return ''
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Ưu tiên cao'
      case 'medium':
        return 'Trung bình'
      case 'low':
        return 'Thấp'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dự báo tuyển dụng</h1>
          <p className="text-muted-foreground mt-1">
            Dự đoán nhu cầu tuyển dụng dựa trên phân tích dữ liệu
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={horizon} onValueChange={setHorizon}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Kỳ dự báo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">3 tháng</SelectItem>
              <SelectItem value="6months">6 tháng</SelectItem>
              <SelectItem value="12months">12 tháng</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng cần tuyển</p>
                {loading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold">{summary.totalNeeded}</p>
                )}
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              trong {horizon === '3months' ? '3' : horizon === '6months' ? '6' : '12'} tháng tới
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Thay thế nghỉ việc</p>
                {loading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-orange-600">{summary.forReplacement}</p>
                )}
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              bù đắp turnover dự kiến
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tăng trưởng</p>
                {loading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-green-600">{summary.forGrowth}</p>
                )}
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              mở rộng đội ngũ
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Dự báo nhu cầu tuyển dụng theo tháng</CardTitle>
          <CardDescription>Phân tích theo lý do tuyển dụng</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[400px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="replacement" stackId="a" fill="#f97316" name="Thay thế" />
                <Bar dataKey="growth" stackId="a" fill="#10b981" name="Tăng trưởng" />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Tổng" />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Department Needs */}
      <Card>
        <CardHeader>
          <CardTitle>Nhu cầu theo phòng ban</CardTitle>
          <CardDescription>Khoảng cách giữa nhân sự hiện tại và dự kiến</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {departmentNeeds.map((dept) => (
                <div
                  key={dept.department}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-muted rounded-lg">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{dept.department}</p>
                      <p className="text-sm text-muted-foreground">
                        Hiện tại: {dept.current} | Dự kiến: {dept.projected}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">+{dept.gap}</p>
                      <p className="text-xs text-muted-foreground">cần tuyển</p>
                    </div>
                    <Badge className={getPriorityColor(dept.priority)}>
                      {getPriorityLabel(dept.priority)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch tuyển dụng đề xuất</CardTitle>
          <CardDescription>Thời điểm tốt nhất để bắt đầu tuyển dụng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative pl-8 space-y-6">
            {/* Timeline line */}
            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-border" />

            {/* Timeline items */}
            <div className="relative">
              <div className="absolute -left-5 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
              <div className="p-4 border rounded-lg ml-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Ngay bây giờ</span>
                  <Badge variant="destructive">Khẩn cấp</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Bắt đầu tuyển dụng cho Phòng Kinh doanh và IT - các vị trí ưu tiên cao
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-5 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white" />
              <div className="p-4 border rounded-lg ml-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Tháng 2</span>
                  <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                    Chuẩn bị
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Đăng tin tuyển dụng cho Phòng Marketing - dự kiến onboard tháng 3
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-5 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
              <div className="p-4 border rounded-lg ml-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Tháng 3-4</span>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Theo kế hoạch
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Tuyển dụng các vị trí còn lại theo kế hoạch phát triển Q2
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
