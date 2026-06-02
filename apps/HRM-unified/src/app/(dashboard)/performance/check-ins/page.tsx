'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, Plus, CheckCircle, Circle } from 'lucide-react'
import { CheckIn } from '@/types/performance'
import { MOOD_OPTIONS } from '@/lib/performance/constants'

export default function CheckInsPage() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    async function loadCheckIns() {
      try {
        const params = new URLSearchParams()
        if (dateFrom) params.set('from', dateFrom)
        if (dateTo) params.set('to', dateTo)
        const res = await fetch(`/api/performance/check-ins?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          setCheckIns(Array.isArray(data) ? data : data.data || [])
        }
      } catch {
        setCheckIns([])
      } finally {
        setLoading(false)
      }
    }
    loadCheckIns()
  }, [dateFrom, dateTo])

  const getMoodEmoji = (rating?: number) => {
    if (!rating) return ''
    const mood = MOOD_OPTIONS.find((m) => m.value === rating)
    return mood?.emoji || ''
  }

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
        <h1 className="text-2xl font-bold text-amber-400">Check-ins</h1>
        <Link href="/performance/check-ins/new">
          <Button className="bg-amber-500 hover:bg-amber-600 text-black">
            <Plus className="mr-2 h-4 w-4" /> Tạo check-in
          </Button>
        </Link>
      </div>

      {/* Date Filter */}
      <div className="flex gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500">Từ:</span>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-40 bg-zinc-900 border-zinc-800 text-zinc-100"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500">Đến:</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-40 bg-zinc-900 border-zinc-800 text-zinc-100"
          />
        </div>
      </div>

      {/* Check-ins List */}
      {checkIns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
          <Calendar className="h-16 w-16 mb-4 text-zinc-700" />
          <p className="text-lg">Chưa có check-in nào</p>
          <p className="text-sm text-zinc-600 mt-1">Tạo check-in hàng tuần để cập nhật tiến độ</p>
        </div>
      ) : (
        <div className="space-y-3">
          {checkIns.map((checkIn) => (
            <Link key={checkIn.id} href={`/performance/check-ins/${checkIn.id}`}>
              <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getMoodEmoji(checkIn.moodRating)}</span>
                      <div>
                        <p className="text-sm font-medium text-zinc-200">
                          {new Date(checkIn.checkInDate).toLocaleDateString('vi-VN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        {checkIn.accomplishments && (
                          <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{checkIn.accomplishments}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {checkIn.isCompleted ? (
                        <Badge className="bg-green-500/20 text-green-400">
                          <CheckCircle className="mr-1 h-3 w-3" /> Hoàn thành
                        </Badge>
                      ) : (
                        <Badge className="bg-zinc-700 text-zinc-400">
                          <Circle className="mr-1 h-3 w-3" /> Đang thực hiện
                        </Badge>
                      )}
                    </div>
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
