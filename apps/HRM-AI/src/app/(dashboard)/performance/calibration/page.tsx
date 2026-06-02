'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Scale, Plus, BarChart3, Calendar } from 'lucide-react'
import { CalibrationSession } from '@/types/performance'
import { RATING_SCALE, RATING_DISTRIBUTION_TARGET } from '@/lib/performance/constants'

export default function CalibrationPage() {
  const [sessions, setSessions] = useState<CalibrationSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSessions() {
      try {
        const res = await fetch('/api/performance/calibration')
        if (res.ok) {
          const data = await res.json()
          setSessions(Array.isArray(data) ? data : data.data || [])
        }
      } catch {
        setSessions([])
      } finally {
        setLoading(false)
      }
    }
    loadSessions()
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
        <h1 className="text-2xl font-bold text-amber-400">Calibration</h1>
        <Button className="bg-amber-500 hover:bg-amber-600 text-black">
          <Plus className="mr-2 h-4 w-4" /> Tạo phiên
        </Button>
      </div>

      {/* Rating Distribution Target */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-amber-400" /> Phân bố đánh giá mục tiêu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-32">
            {RATING_SCALE.map((rating) => {
              const target = RATING_DISTRIBUTION_TARGET[rating.value] || 0
              return (
                <div key={rating.value} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-zinc-500">{target}%</span>
                  <div
                    className="w-full rounded-t"
                    style={{
                      height: `${target * 2}px`,
                      backgroundColor: rating.color,
                      opacity: 0.7,
                    }}
                  />
                  <span className="text-xs text-zinc-400">{rating.value}</span>
                  <span className="text-[10px] text-zinc-600">{rating.label}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
          <Scale className="h-16 w-16 mb-4 text-zinc-700" />
          <p className="text-lg">Chưa có phiên calibration nào</p>
          <p className="text-sm text-zinc-600 mt-1">Tạo phiên mới để bắt đầu quá trình điều chỉnh đánh giá</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <Link key={session.id} href={`/performance/calibration/${session.id}`}>
              <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-zinc-200">{session.name}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                        {session.department && <span>{session.department.name}</span>}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(session.scheduledAt).toLocaleDateString('vi-VN')}
                        </span>
                        <span>{session.participantIds.length} người tham gia</span>
                      </div>
                    </div>
                    <Badge className={session.completedAt ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}>
                      {session.completedAt ? 'Hoàn thành' : 'Đang diễn ra'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
