'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ClipboardCheck, ArrowRight, FileText } from 'lucide-react'
import { PerformanceReview } from '@/types/performance'
import { REVIEW_STATUS } from '@/lib/performance/constants'

function ReviewStatusBadge({ status }: { status: string }) {
  const info = REVIEW_STATUS[status as keyof typeof REVIEW_STATUS]
  const colorMap: Record<string, string> = {
    gray: 'bg-zinc-700 text-zinc-300',
    blue: 'bg-blue-500/20 text-blue-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    purple: 'bg-purple-500/20 text-purple-400',
    green: 'bg-green-500/20 text-green-400',
  }

  return (
    <Badge className={colorMap[info?.color || 'gray'] || colorMap.gray}>
      {info?.label || status}
    </Badge>
  )
}

export default function ReviewsPage() {
  const [myReviews, setMyReviews] = useState<PerformanceReview[]>([])
  const [teamReviews, setTeamReviews] = useState<PerformanceReview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadReviews() {
      try {
        const [myRes, teamRes] = await Promise.all([
          fetch('/api/performance/reviews?scope=my'),
          fetch('/api/performance/reviews?scope=team'),
        ])
        if (myRes.ok) {
          const data = await myRes.json()
          setMyReviews(Array.isArray(data) ? data : data.data || [])
        }
        if (teamRes.ok) {
          const data = await teamRes.json()
          setTeamReviews(Array.isArray(data) ? data : data.data || [])
        }
      } catch {
        // Handle error
      } finally {
        setLoading(false)
      }
    }
    loadReviews()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48 bg-zinc-800" />
        <Skeleton className="h-48 bg-zinc-800" />
        <Skeleton className="h-64 bg-zinc-800" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 bg-zinc-950 min-h-screen text-zinc-100">
      <h1 className="text-2xl font-bold text-amber-400">Đánh giá hiệu suất</h1>

      {/* My Pending Reviews */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">Đánh giá của tôi</CardTitle>
        </CardHeader>
        <CardContent>
          {myReviews.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-zinc-500">
              <ClipboardCheck className="h-12 w-12 mb-3 text-zinc-700" />
              <p>Không có đánh giá đang chờ</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myReviews.map((review) => (
                <Link key={review.id} href={`/performance/reviews/${review.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-zinc-200">
                        {review.reviewCycle?.name || 'Review Cycle'}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {review.overallScore ? `Điểm: ${review.overallScore}` : 'Chưa có điểm'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <ReviewStatusBadge status={review.status} />
                      <ArrowRight className="h-4 w-4 text-zinc-600" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Reviews */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">Đánh giá team</CardTitle>
        </CardHeader>
        <CardContent>
          {teamReviews.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-zinc-500">
              <FileText className="h-12 w-12 mb-3 text-zinc-700" />
              <p>Không có đánh giá team cần xử lý</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800">
                  <TableHead className="text-zinc-400">Nhân viên</TableHead>
                  <TableHead className="text-zinc-400">Chu kỳ</TableHead>
                  <TableHead className="text-zinc-400">Trạng thái</TableHead>
                  <TableHead className="text-zinc-400">Điểm</TableHead>
                  <TableHead className="text-zinc-400">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamReviews.map((review) => (
                  <TableRow key={review.id} className="border-zinc-800">
                    <TableCell className="text-zinc-200">
                      {review.employee?.fullName || 'N/A'}
                    </TableCell>
                    <TableCell className="text-zinc-400">
                      {review.reviewCycle?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <ReviewStatusBadge status={review.status} />
                    </TableCell>
                    <TableCell className="text-zinc-300">
                      {review.overallScore?.toFixed(1) || '-'}
                    </TableCell>
                    <TableCell>
                      <Link href={`/performance/reviews/${review.id}`}>
                        <Button size="sm" variant="ghost" className="text-amber-400 hover:text-amber-300">
                          Xem
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
