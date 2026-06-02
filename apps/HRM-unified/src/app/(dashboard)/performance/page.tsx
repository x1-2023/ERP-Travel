'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Target,
  ClipboardCheck,
  MessageSquare,
  Users,
  Plus,
  ArrowRight,
  TrendingUp,
  Calendar,
} from 'lucide-react'

export default function PerformanceDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    goalsCompleted: 0,
    goalsTotal: 0,
    reviewStatus: 'NOT_STARTED',
    pendingFeedback: 0,
    teamReviewsCompleted: 0,
    teamReviewsTotal: 0,
  })

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/performance/dashboard')
        if (res.ok) {
          const data = await res.json()
          setStats(data.data ?? data)
        }
      } catch {
        // Use empty/mock state
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  const goalsProgress = stats.goalsTotal > 0 ? Math.round((stats.goalsCompleted / stats.goalsTotal) * 100) : 0

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 bg-zinc-800" />
          ))}
        </div>
        <Skeleton className="h-96 bg-zinc-800" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 bg-zinc-950 min-h-screen text-zinc-100">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-amber-400">Performance Management</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Mục tiêu của tôi</CardTitle>
            <Target className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">
              {stats.goalsCompleted}/{stats.goalsTotal}
            </div>
            <Progress value={goalsProgress} className="mt-2 h-2" />
            <p className="text-xs text-zinc-500 mt-1">{goalsProgress}% hoàn thành</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Đánh giá của tôi</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-blue-400 border-blue-400/30">
              {stats.reviewStatus === 'NOT_STARTED' ? 'Chưa bắt đầu' :
               stats.reviewStatus === 'SELF_REVIEW_PENDING' ? 'Chờ tự đánh giá' :
               stats.reviewStatus === 'COMPLETED' ? 'Hoàn thành' : stats.reviewStatus}
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Feedback chờ xử lý</CardTitle>
            <MessageSquare className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{stats.pendingFeedback}</div>
            <p className="text-xs text-zinc-500 mt-1">yêu cầu chờ phản hồi</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Đánh giá team</CardTitle>
            <Users className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">
              {stats.teamReviewsCompleted}/{stats.teamReviewsTotal}
            </div>
            <p className="text-xs text-zinc-500 mt-1">đã hoàn thành</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="goals" className="space-y-4">
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="goals" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-amber-400">
            Mục tiêu
          </TabsTrigger>
          <TabsTrigger value="reviews" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-amber-400">
            Đánh giá
          </TabsTrigger>
          <TabsTrigger value="feedback" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-amber-400">
            Feedback
          </TabsTrigger>
          <TabsTrigger value="checkins" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-amber-400">
            Check-ins
          </TabsTrigger>
        </TabsList>

        <TabsContent value="goals">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-zinc-100">Mục tiêu gần đây</CardTitle>
              <Link href="/performance/goals">
                <Button variant="ghost" size="sm" className="text-amber-400 hover:text-amber-300">
                  Xem tất cả <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
                <Target className="h-12 w-12 mb-3 text-zinc-700" />
                <p>Chưa có mục tiêu nào</p>
                <Link href="/performance/goals/new">
                  <Button size="sm" className="mt-3 bg-amber-500 hover:bg-amber-600 text-black">
                    <Plus className="mr-1 h-4 w-4" /> Tạo mục tiêu
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-zinc-100">Đánh giá hiện tại</CardTitle>
              <Link href="/performance/reviews">
                <Button variant="ghost" size="sm" className="text-amber-400 hover:text-amber-300">
                  Xem tất cả <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
                <ClipboardCheck className="h-12 w-12 mb-3 text-zinc-700" />
                <p>Không có đánh giá đang diễn ra</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-zinc-100">Feedback gần đây</CardTitle>
              <Link href="/performance/feedback">
                <Button variant="ghost" size="sm" className="text-amber-400 hover:text-amber-300">
                  Xem tất cả <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
                <MessageSquare className="h-12 w-12 mb-3 text-zinc-700" />
                <p>Chưa có feedback nào</p>
                <Link href="/performance/feedback/give">
                  <Button size="sm" className="mt-3 bg-amber-500 hover:bg-amber-600 text-black">
                    <Plus className="mr-1 h-4 w-4" /> Gửi feedback
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checkins">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-zinc-100">Check-ins gần đây</CardTitle>
              <Link href="/performance/check-ins">
                <Button variant="ghost" size="sm" className="text-amber-400 hover:text-amber-300">
                  Xem tất cả <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
                <Calendar className="h-12 w-12 mb-3 text-zinc-700" />
                <p>Chưa có check-in nào</p>
                <Link href="/performance/check-ins">
                  <Button size="sm" className="mt-3 bg-amber-500 hover:bg-amber-600 text-black">
                    <Plus className="mr-1 h-4 w-4" /> Tạo check-in
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
