'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { BarChart3, Target, TrendingUp, Users, Star } from 'lucide-react'
import { PerformanceAnalytics } from '@/types/performance'
import { RATING_SCALE } from '@/lib/performance/constants'

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<PerformanceAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch('/api/performance/analytics')
        if (res.ok) {
          setAnalytics(await res.json())
        }
      } catch {
        // Handle error
      } finally {
        setLoading(false)
      }
    }
    loadAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48 bg-zinc-800" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 bg-zinc-800" />)}
        </div>
        <Skeleton className="h-64 bg-zinc-800" />
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-zinc-500">
        <BarChart3 className="h-16 w-16 mb-4 text-zinc-700" />
        <p>Không có dữ liệu phân tích</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 bg-zinc-950 min-h-screen text-zinc-100">
      <h1 className="text-2xl font-bold text-amber-400">Phân tích hiệu suất</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-zinc-400">Tổng đánh giá</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-zinc-100">{analytics.totalReviews}</p>
            <p className="text-xs text-zinc-500">{analytics.completedReviews} hoàn thành</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-zinc-400">Điểm trung bình</CardTitle>
            <Star className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-400">{analytics.averageRating.toFixed(2)}</p>
            <p className="text-xs text-zinc-500">trên thang 5</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-zinc-400">Hoàn thành mục tiêu</CardTitle>
            <Target className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-400">{analytics.goalCompletionRate}%</p>
            <Progress value={analytics.goalCompletionRate} className="h-1.5 mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-zinc-400">Tỉ lệ hoàn thành</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-zinc-100">
              {analytics.totalReviews > 0 ? Math.round((analytics.completedReviews / analytics.totalReviews) * 100) : 0}%
            </p>
            <p className="text-xs text-zinc-500">đánh giá đã xong</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-amber-400" /> Phân bố đánh giá
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.ratingDistribution.map((item) => {
                const ratingInfo = RATING_SCALE.find((r) => r.value === item.rating)
                return (
                  <div key={item.rating} className="flex items-center gap-3">
                    <span className="text-sm text-zinc-400 w-24">{ratingInfo?.label || item.rating}</span>
                    <div className="flex-1 h-6 bg-zinc-800 rounded overflow-hidden">
                      <div
                        className="h-full rounded flex items-center px-2"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: ratingInfo?.color || '#a1a1aa',
                          minWidth: item.count > 0 ? '24px' : '0',
                        }}
                      >
                        <span className="text-xs text-white font-medium">{item.count}</span>
                      </div>
                    </div>
                    <span className="text-xs text-zinc-500 w-10 text-right">{item.percentage}%</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100 flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-400" /> Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topPerformers.length === 0 ? (
              <p className="text-sm text-zinc-600 text-center py-4">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-2">
                {analytics.topPerformers.map((performer, idx) => (
                  <div key={performer.employeeId} className="flex items-center justify-between p-2 bg-zinc-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold ${idx < 3 ? 'text-amber-400' : 'text-zinc-500'}`}>
                        #{idx + 1}
                      </span>
                      <span className="text-sm text-zinc-200">{performer.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-bold text-amber-400">{performer.rating.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Department Comparison */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">So sánh phòng ban</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.departmentComparison.length === 0 ? (
            <p className="text-sm text-zinc-600 text-center py-6">Chưa có dữ liệu phòng ban</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800">
                  <TableHead className="text-zinc-400">Phòng ban</TableHead>
                  <TableHead className="text-zinc-400">Điểm TB</TableHead>
                  <TableHead className="text-zinc-400">Số lượng</TableHead>
                  <TableHead className="text-zinc-400">So với TB</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.departmentComparison.map((dept) => {
                  const diff = dept.avgRating - analytics.averageRating
                  return (
                    <TableRow key={dept.department} className="border-zinc-800">
                      <TableCell className="text-zinc-200">{dept.department}</TableCell>
                      <TableCell className="text-zinc-300 font-medium">{dept.avgRating.toFixed(2)}</TableCell>
                      <TableCell className="text-zinc-400">{dept.count}</TableCell>
                      <TableCell>
                        <span className={diff >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {diff >= 0 ? '+' : ''}{diff.toFixed(2)}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
