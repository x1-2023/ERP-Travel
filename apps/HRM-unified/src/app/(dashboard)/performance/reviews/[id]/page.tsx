'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, ClipboardCheck, Target, Award, Heart, MessageSquare, BookOpen } from 'lucide-react'
import { PerformanceReview } from '@/types/performance'
import { REVIEW_STATUS, RATING_SCALE } from '@/lib/performance/constants'

export default function ReviewDetailPage() {
  const params = useParams()
  const [review, setReview] = useState<PerformanceReview | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function loadReview() {
      try {
        const res = await fetch(`/api/performance/reviews/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setReview(data.data ?? data)
        }
      } catch {
        // Handle error
      } finally {
        setLoading(false)
      }
    }
    loadReview()
  }, [params.id])

  const handleAction = async (action: string) => {
    setSubmitting(true)
    try {
      await fetch(`/api/performance/reviews/${params.id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      // Reload review
      const res = await fetch(`/api/performance/reviews/${params.id}`)
      if (res.ok) { const r = await res.json(); setReview(r.data ?? r) }
    } catch {
      // Handle error
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64 bg-zinc-800" />
        <Skeleton className="h-48 bg-zinc-800" />
        <Skeleton className="h-96 bg-zinc-800" />
      </div>
    )
  }

  if (!review) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-zinc-500">
        <ClipboardCheck className="h-16 w-16 mb-4 text-zinc-700" />
        <p>Không tìm thấy đánh giá</p>
        <Link href="/performance/reviews">
          <Button variant="ghost" className="mt-4 text-amber-400">Quay lại</Button>
        </Link>
      </div>
    )
  }

  const statusInfo = REVIEW_STATUS[review.status as keyof typeof REVIEW_STATUS]

  return (
    <div className="space-y-6 p-6 bg-zinc-950 min-h-screen text-zinc-100">
      <div className="flex items-center gap-4">
        <Link href="/performance/reviews">
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-amber-400">
            {review.reviewCycle?.name || 'Đánh giá hiệu suất'}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-zinc-400">{review.employee?.fullName}</span>
            <Badge className={
              statusInfo?.color === 'green' ? 'bg-green-500/20 text-green-400' :
              statusInfo?.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
              statusInfo?.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-zinc-700 text-zinc-300'
            }>
              {statusInfo?.label || review.status}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          {review.status === 'SELF_REVIEW_PENDING' && (
            <Button onClick={() => handleAction('submit-self-review')} disabled={submitting} className="bg-amber-500 hover:bg-amber-600 text-black">
              Gửi tự đánh giá
            </Button>
          )}
          {review.status === 'MANAGER_REVIEW_PENDING' && (
            <Button onClick={() => handleAction('submit-manager-review')} disabled={submitting} className="bg-amber-500 hover:bg-amber-600 text-black">
              Gửi đánh giá quản lý
            </Button>
          )}
          {review.status === 'COMPLETED' && !review.acknowledgedAt && (
            <Button onClick={() => handleAction('acknowledge')} disabled={submitting} className="bg-green-600 hover:bg-green-700 text-white">
              Xác nhận
            </Button>
          )}
        </div>
      </div>

      {/* Review Summary */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-xs text-zinc-500">Mục tiêu</p>
              <p className="text-xl font-bold text-zinc-200">{review.goalScore?.toFixed(1) || '-'}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-zinc-500">Năng lực</p>
              <p className="text-xl font-bold text-zinc-200">{review.competencyScore?.toFixed(1) || '-'}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-zinc-500">Giá trị</p>
              <p className="text-xl font-bold text-zinc-200">{review.valuesScore?.toFixed(1) || '-'}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-zinc-500">Feedback</p>
              <p className="text-xl font-bold text-zinc-200">{review.feedbackScore?.toFixed(1) || '-'}</p>
            </div>
            <div className="text-center border-l border-zinc-800">
              <p className="text-xs text-zinc-500">Tổng điểm</p>
              <p className="text-2xl font-bold text-amber-400">{review.overallScore?.toFixed(1) || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="goals" className="space-y-4">
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="goals" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-amber-400">
            <Target className="mr-1 h-3 w-3" /> Mục tiêu
          </TabsTrigger>
          <TabsTrigger value="competencies" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-amber-400">
            <Award className="mr-1 h-3 w-3" /> Năng lực
          </TabsTrigger>
          <TabsTrigger value="values" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-amber-400">
            <Heart className="mr-1 h-3 w-3" /> Giá trị
          </TabsTrigger>
          <TabsTrigger value="feedback" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-amber-400">
            <MessageSquare className="mr-1 h-3 w-3" /> Feedback
          </TabsTrigger>
          <TabsTrigger value="development" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-amber-400">
            <BookOpen className="mr-1 h-3 w-3" /> Phát triển
          </TabsTrigger>
        </TabsList>

        <TabsContent value="goals">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6">
              {review.goals && review.goals.length > 0 ? (
                <div className="space-y-4">
                  {review.goals.map((rg) => (
                    <div key={rg.id} className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                      <p className="font-medium text-zinc-200">{rg.goal?.title || 'Mục tiêu'}</p>
                      <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                        <div>
                          <p className="text-zinc-500">Tự đánh giá</p>
                          <p className="text-zinc-300 font-medium">{rg.selfScore?.toFixed(1) || '-'}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500">Quản lý</p>
                          <p className="text-zinc-300 font-medium">{rg.managerScore?.toFixed(1) || '-'}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500">Điểm cuối</p>
                          <p className="text-amber-400 font-bold">{rg.finalScore?.toFixed(1) || '-'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-500">
                  <Target className="h-12 w-12 mx-auto mb-3 text-zinc-700" />
                  <p>Chưa có mục tiêu nào được gắn</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competencies">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6">
              {review.competencies && review.competencies.length > 0 ? (
                <div className="space-y-4">
                  {review.competencies.map((rc) => (
                    <div key={rc.id} className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                      <div className="flex justify-between">
                        <p className="font-medium text-zinc-200">{rc.competency?.name || 'Năng lực'}</p>
                        <Badge variant="outline" className="text-xs border-zinc-600">
                          Yêu cầu: Level {rc.requiredLevel}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                        <div>
                          <p className="text-zinc-500">Tự đánh giá</p>
                          <p className="text-zinc-300">{rc.selfRating || '-'}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500">Quản lý</p>
                          <p className="text-zinc-300">{rc.managerRating || '-'}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500">Điểm cuối</p>
                          <p className="text-amber-400 font-bold">{rc.finalRating || '-'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-500">
                  <Award className="h-12 w-12 mx-auto mb-3 text-zinc-700" />
                  <p>Chưa có năng lực nào được đánh giá</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="values">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6">
              {review.values && review.values.length > 0 ? (
                <div className="space-y-4">
                  {review.values.map((rv) => (
                    <div key={rv.id} className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                      <p className="font-medium text-zinc-200">{rv.coreValue?.name || 'Giá trị'}</p>
                      <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                        <div>
                          <p className="text-zinc-500">Tự đánh giá</p>
                          <p className="text-zinc-300">{rv.selfRating || '-'}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500">Quản lý</p>
                          <p className="text-zinc-300">{rv.managerRating || '-'}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500">Điểm cuối</p>
                          <p className="text-amber-400 font-bold">{rv.finalRating || '-'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-500">
                  <Heart className="h-12 w-12 mx-auto mb-3 text-zinc-700" />
                  <p>Chưa có giá trị nào được đánh giá</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {review.selfComments && (
                  <div className="p-4 bg-zinc-800 rounded-lg">
                    <p className="text-xs text-zinc-500 mb-1">Nhận xét của nhân viên</p>
                    <p className="text-sm text-zinc-300">{review.selfComments}</p>
                  </div>
                )}
                {review.managerComments && (
                  <div className="p-4 bg-zinc-800 rounded-lg">
                    <p className="text-xs text-zinc-500 mb-1">Nhận xét của quản lý</p>
                    <p className="text-sm text-zinc-300">{review.managerComments}</p>
                  </div>
                )}
                {review.strengths && (
                  <div className="p-4 bg-zinc-800 rounded-lg">
                    <p className="text-xs text-zinc-500 mb-1">Điểm mạnh</p>
                    <p className="text-sm text-zinc-300">{review.strengths}</p>
                  </div>
                )}
                {review.developmentAreas && (
                  <div className="p-4 bg-zinc-800 rounded-lg">
                    <p className="text-xs text-zinc-500 mb-1">Cần cải thiện</p>
                    <p className="text-sm text-zinc-300">{review.developmentAreas}</p>
                  </div>
                )}
                {!review.selfComments && !review.managerComments && (
                  <div className="text-center py-8 text-zinc-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 text-zinc-700" />
                    <p>Chưa có nhận xét</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="development">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6">
              {review.developmentPlan && review.developmentPlan.length > 0 ? (
                <div className="space-y-3">
                  {review.developmentPlan.map((item, idx) => (
                    <div key={idx} className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-zinc-500">Lĩnh vực</p>
                          <p className="text-zinc-200">{item.area}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500">Hành động</p>
                          <p className="text-zinc-200">{item.action}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500">Thời gian</p>
                          <p className="text-zinc-200">{item.timeline}</p>
                        </div>
                        {item.resources && (
                          <div>
                            <p className="text-zinc-500">Tài nguyên</p>
                            <p className="text-zinc-200">{item.resources}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 text-zinc-700" />
                  <p>Chưa có kế hoạch phát triển</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
