'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageSquare, Plus, Star, User, Clock, Users } from 'lucide-react'
import { FeedbackData, FeedbackRequest } from '@/types/performance'
import { FEEDBACK_TYPE, FEEDBACK_REQUEST_STATUS } from '@/lib/performance/constants'

function FeedbackCard({ feedback }: { feedback: FeedbackData }) {
  const typeInfo = FEEDBACK_TYPE[feedback.feedbackType as keyof typeof FEEDBACK_TYPE]

  return (
    <Card className="bg-zinc-800 border-zinc-700">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-zinc-500" />
              <span className="text-sm font-medium text-zinc-200">
                {feedback.isAnonymous ? 'Ẩn danh' : feedback.provider?.name || 'N/A'}
              </span>
              <Badge variant="secondary" className="text-xs bg-zinc-700">{typeInfo?.label || feedback.feedbackType}</Badge>
            </div>
            {feedback.comments && (
              <p className="text-sm text-zinc-400 mt-2 line-clamp-2">{feedback.comments}</p>
            )}
            {feedback.strengths && (
              <p className="text-xs text-green-400 mt-1">Điểm mạnh: {feedback.strengths}</p>
            )}
          </div>
          {feedback.overallRating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <span className="text-sm font-bold text-amber-400">{feedback.overallRating}</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-700">
          <span className="text-xs text-zinc-600">
            {new Date(feedback.createdAt).toLocaleDateString('vi-VN')}
          </span>
          {feedback.isPublic && <Badge variant="outline" className="text-xs border-zinc-600">Công khai</Badge>}
        </div>
      </CardContent>
    </Card>
  )
}

export default function FeedbackPage() {
  const [received, setReceived] = useState<FeedbackData[]>([])
  const [sent, setSent] = useState<FeedbackData[]>([])
  const [requests, setRequests] = useState<FeedbackRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadFeedback() {
      try {
        const [recRes, sentRes, reqRes] = await Promise.all([
          fetch('/api/performance/feedback?scope=received'),
          fetch('/api/performance/feedback?scope=sent'),
          fetch('/api/performance/feedback/requests?status=PENDING'),
        ])
        if (recRes.ok) {
          const data = await recRes.json()
          setReceived(Array.isArray(data) ? data : data.data || [])
        }
        if (sentRes.ok) {
          const data = await sentRes.json()
          setSent(Array.isArray(data) ? data : data.data || [])
        }
        if (reqRes.ok) {
          const data = await reqRes.json()
          setRequests(Array.isArray(data) ? data : data.data || [])
        }
      } catch {
        // Handle error
      } finally {
        setLoading(false)
      }
    }
    loadFeedback()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48 bg-zinc-800" />
        <Skeleton className="h-64 bg-zinc-800" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 bg-zinc-950 min-h-screen text-zinc-100">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-amber-400">Feedback</h1>
        <div className="flex gap-2">
          <Link href="/performance/feedback/request">
            <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-zinc-100">
              <Users className="mr-2 h-4 w-4" /> Yêu cầu 360°
            </Button>
          </Link>
          <Link href="/performance/feedback/give">
            <Button className="bg-amber-500 hover:bg-amber-600 text-black">
              <Plus className="mr-2 h-4 w-4" /> Gửi feedback
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="received" className="space-y-4">
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="received" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-amber-400">
            Đã nhận ({received.length})
          </TabsTrigger>
          <TabsTrigger value="sent" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-amber-400">
            Đã gửi ({sent.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-amber-400">
            Yêu cầu chờ ({requests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received">
          {received.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <MessageSquare className="h-16 w-16 mb-4 text-zinc-700" />
              <p>Chưa nhận được feedback nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {received.map((fb) => (
                <FeedbackCard key={fb.id} feedback={fb} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent">
          {sent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <MessageSquare className="h-16 w-16 mb-4 text-zinc-700" />
              <p>Chưa gửi feedback nào</p>
              <Link href="/performance/feedback/give">
                <Button size="sm" className="mt-4 bg-amber-500 hover:bg-amber-600 text-black">
                  <Plus className="mr-1 h-4 w-4" /> Gửi feedback
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sent.map((fb) => (
                <FeedbackCard key={fb.id} feedback={fb} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending">
          {requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <Clock className="h-16 w-16 mb-4 text-zinc-700" />
              <p>Không có yêu cầu feedback chờ xử lý</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <Card key={req.id} className="bg-zinc-800 border-zinc-700">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-zinc-200">
                          Feedback cho {req.subject?.fullName || 'N/A'}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                          Yêu cầu từ {req.requester?.name || 'N/A'}
                          {req.dueDate && ` - Hạn: ${new Date(req.dueDate).toLocaleDateString('vi-VN')}`}
                        </p>
                      </div>
                      <Link href={`/performance/feedback/give?requestId=${req.id}&subjectId=${req.subjectId}`}>
                        <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-black">
                          Phản hồi
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
