'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Calendar, CheckCircle, ListChecks, Smile } from 'lucide-react'
import { CheckIn, ActionItem } from '@/types/performance'
import { MOOD_OPTIONS } from '@/lib/performance/constants'

export default function CheckInDetailPage() {
  const params = useParams()
  const [checkIn, setCheckIn] = useState<CheckIn | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCheckIn() {
      try {
        const res = await fetch(`/api/performance/check-ins/${params.id}`)
        if (res.ok) {
          setCheckIn(await res.json())
        }
      } catch {
        // Handle error
      } finally {
        setLoading(false)
      }
    }
    loadCheckIn()
  }, [params.id])

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64 bg-zinc-800" />
        <Skeleton className="h-64 bg-zinc-800" />
      </div>
    )
  }

  if (!checkIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-zinc-500">
        <Calendar className="h-16 w-16 mb-4 text-zinc-700" />
        <p>Không tìm thấy check-in</p>
        <Link href="/performance/check-ins">
          <Button variant="ghost" className="mt-4 text-amber-400">Quay lại</Button>
        </Link>
      </div>
    )
  }

  const moodInfo = MOOD_OPTIONS.find((m) => m.value === checkIn.moodRating)

  return (
    <div className="space-y-6 p-6 bg-zinc-950 min-h-screen text-zinc-100">
      <div className="flex items-center gap-4">
        <Link href="/performance/check-ins">
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-amber-400">
            Check-in {new Date(checkIn.checkInDate).toLocaleDateString('vi-VN')}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            {checkIn.isCompleted ? (
              <Badge className="bg-green-500/20 text-green-400">
                <CheckCircle className="mr-1 h-3 w-3" /> Hoàn thành
              </Badge>
            ) : (
              <Badge className="bg-zinc-700 text-zinc-400">Đang thực hiện</Badge>
            )}
            {moodInfo && (
              <span className="text-sm text-zinc-400">
                {moodInfo.emoji} {moodInfo.label}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100 text-sm">Thành tựu tuần này</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-300 whitespace-pre-wrap">
                {checkIn.accomplishments || 'Chưa cập nhật'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100 text-sm">Thách thức</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-300 whitespace-pre-wrap">
                {checkIn.challenges || 'Không có thách thức'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100 text-sm">Ưu tiên tuần tới</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-300 whitespace-pre-wrap">
                {checkIn.priorities || 'Chưa thiết lập'}
              </p>
            </CardContent>
          </Card>

          {checkIn.supportNeeded && (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-100 text-sm">Hỗ trợ cần thiết</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-300 whitespace-pre-wrap">{checkIn.supportNeeded}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Manager Notes */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100 text-sm">Ghi chú quản lý</CardTitle>
            </CardHeader>
            <CardContent>
              {checkIn.managerNotes ? (
                <p className="text-sm text-zinc-300 whitespace-pre-wrap">{checkIn.managerNotes}</p>
              ) : (
                <p className="text-sm text-zinc-600 italic">Chưa có ghi chú từ quản lý</p>
              )}
            </CardContent>
          </Card>

          {/* Action Items */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100 text-sm flex items-center gap-2">
                <ListChecks className="h-4 w-4" /> Công việc
              </CardTitle>
            </CardHeader>
            <CardContent>
              {checkIn.actionItems && checkIn.actionItems.length > 0 ? (
                <div className="space-y-2">
                  {checkIn.actionItems.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-2 rounded bg-zinc-800">
                      <Checkbox checked={item.completed} className="mt-0.5" disabled />
                      <div className="flex-1">
                        <p className={`text-sm ${item.completed ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                          {item.task}
                        </p>
                        <div className="flex gap-3 mt-1 text-xs text-zinc-600">
                          <span>{item.assignee}</span>
                          {item.dueDate && <span>Hạn: {new Date(item.dueDate).toLocaleDateString('vi-VN')}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-600 italic">Không có công việc</p>
              )}
            </CardContent>
          </Card>

          {/* Mood */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100 text-sm flex items-center gap-2">
                <Smile className="h-4 w-4" /> Tâm trạng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                {MOOD_OPTIONS.map((mood) => (
                  <div
                    key={mood.value}
                    className={`text-center p-2 rounded ${checkIn.moodRating === mood.value ? 'bg-zinc-800 ring-1 ring-amber-400' : ''}`}
                  >
                    <span className="text-2xl">{mood.emoji}</span>
                    <p className="text-xs text-zinc-500 mt-1">{mood.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
