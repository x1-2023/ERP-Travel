'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, RotateCcw, Play, CheckCircle } from 'lucide-react'
import { ReviewCycle, PerformanceReview } from '@/types/performance'
import { REVIEW_CYCLE_STATUS, REVIEW_CYCLE_TYPE, REVIEW_STATUS } from '@/lib/performance/constants'

export default function CycleDetailPage() {
  const params = useParams()
  const [cycle, setCycle] = useState<ReviewCycle | null>(null)
  const [reviews, setReviews] = useState<PerformanceReview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCycle() {
      try {
        const [cycleRes, reviewsRes] = await Promise.all([
          fetch(`/api/performance/cycles/${params.id}`),
          fetch(`/api/performance/reviews?cycleId=${params.id}`),
        ])
        if (cycleRes.ok) setCycle(await cycleRes.json())
        if (reviewsRes.ok) {
          const data = await reviewsRes.json()
          setReviews(Array.isArray(data) ? data : data.reviews || [])
        }
      } catch {
        // Handle error
      } finally {
        setLoading(false)
      }
    }
    loadCycle()
  }, [params.id])

  const handleLaunch = async () => {
    try {
      const res = await fetch(`/api/performance/cycles/${params.id}/launch`, {
        method: 'POST',
      })
      if (res.ok) setCycle(await res.json())
    } catch {
      // Handle error
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64 bg-zinc-800" />
        <Skeleton className="h-48 bg-zinc-800" />
        <Skeleton className="h-64 bg-zinc-800" />
      </div>
    )
  }

  if (!cycle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-zinc-500">
        <RotateCcw className="h-16 w-16 mb-4 text-zinc-700" />
        <p>Không tìm thấy chu kỳ</p>
        <Link href="/performance/admin/cycles">
          <Button variant="ghost" className="mt-4 text-amber-400">Quay lại</Button>
        </Link>
      </div>
    )
  }

  const statusInfo = REVIEW_CYCLE_STATUS[cycle.status as keyof typeof REVIEW_CYCLE_STATUS]
  const typeInfo = REVIEW_CYCLE_TYPE[cycle.cycleType as keyof typeof REVIEW_CYCLE_TYPE]

  const phases = [
    { label: 'Thiết lập mục tiêu', start: cycle.goalSettingStart, end: cycle.goalSettingEnd, status: 'GOAL_SETTING' },
    { label: 'Tự đánh giá', start: cycle.selfReviewStart, end: cycle.selfReviewEnd, status: 'SELF_REVIEW' },
    { label: 'Quản lý đánh giá', start: cycle.managerReviewStart, end: cycle.managerReviewEnd, status: 'MANAGER_REVIEW' },
    { label: 'Calibration', start: cycle.calibrationStart, end: cycle.calibrationEnd, status: 'CALIBRATION' },
  ]

  return (
    <div className="space-y-6 p-6 bg-zinc-950 min-h-screen text-zinc-100">
      <div className="flex items-center gap-4">
        <Link href="/performance/admin/cycles">
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-amber-400">{cycle.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-zinc-400">{typeInfo?.label} - {cycle.year}</span>
            <Badge className={
              statusInfo?.color === 'green' ? 'bg-green-500/20 text-green-400' :
              statusInfo?.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
              'bg-zinc-700 text-zinc-300'
            }>
              {statusInfo?.label || cycle.status}
            </Badge>
          </div>
        </div>
        {cycle.status === 'DRAFT' && (
          <Button onClick={handleLaunch} className="bg-green-600 hover:bg-green-700 text-white">
            <Play className="mr-2 h-4 w-4" /> Khởi chạy
          </Button>
        )}
      </div>

      {/* Phase Timeline */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">Giai đoạn</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {phases.map((phase, idx) => {
              const isActive = cycle.status === phase.status
              const isPast = phases.findIndex((p) => p.status === cycle.status) > idx
              return (
                <div key={idx} className="flex-1">
                  <div className={`h-2 rounded ${isActive ? 'bg-amber-400' : isPast ? 'bg-green-500' : 'bg-zinc-800'}`} />
                  <p className={`text-xs mt-2 ${isActive ? 'text-amber-400' : isPast ? 'text-green-400' : 'text-zinc-600'}`}>
                    {phase.label}
                  </p>
                  {phase.start && (
                    <p className="text-[10px] text-zinc-600">
                      {new Date(phase.start).toLocaleDateString('vi-VN')} - {phase.end ? new Date(phase.end).toLocaleDateString('vi-VN') : ''}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Cycle Info */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100 text-sm">Trọng số đánh giá</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-zinc-800 rounded-lg">
              <p className="text-xl font-bold text-amber-400">{cycle.goalWeight}%</p>
              <p className="text-xs text-zinc-500">Mục tiêu</p>
            </div>
            <div className="p-3 bg-zinc-800 rounded-lg">
              <p className="text-xl font-bold text-blue-400">{cycle.competencyWeight}%</p>
              <p className="text-xs text-zinc-500">Năng lực</p>
            </div>
            <div className="p-3 bg-zinc-800 rounded-lg">
              <p className="text-xl font-bold text-purple-400">{cycle.valuesWeight}%</p>
              <p className="text-xs text-zinc-500">Giá trị</p>
            </div>
            <div className="p-3 bg-zinc-800 rounded-lg">
              <p className="text-xl font-bold text-green-400">{cycle.feedbackWeight}%</p>
              <p className="text-xs text-zinc-500">Feedback</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">Đánh giá ({reviews.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-6">Chưa có đánh giá nào trong chu kỳ này</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800">
                  <TableHead className="text-zinc-400">Nhân viên</TableHead>
                  <TableHead className="text-zinc-400">Trạng thái</TableHead>
                  <TableHead className="text-zinc-400">Điểm</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => {
                  const revStatus = REVIEW_STATUS[review.status as keyof typeof REVIEW_STATUS]
                  return (
                    <TableRow key={review.id} className="border-zinc-800">
                      <TableCell className="text-zinc-200">{review.employee?.fullName || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs border-zinc-600">
                          {revStatus?.label || review.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-300">{review.overallScore?.toFixed(1) || '-'}</TableCell>
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
