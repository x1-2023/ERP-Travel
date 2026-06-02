'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Users, Plus, Calendar, Clock } from 'lucide-react'
import { OneOnOne } from '@/types/performance'

export default function OneOnOnesPage() {
  const [meetings, setMeetings] = useState<OneOnOne[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadMeetings() {
      try {
        const res = await fetch('/api/performance/one-on-ones')
        if (res.ok) {
          const data = await res.json()
          setMeetings(Array.isArray(data) ? data : data.data || [])
        }
      } catch {
        setMeetings([])
      } finally {
        setLoading(false)
      }
    }
    loadMeetings()
  }, [])

  const upcoming = meetings.filter((m) => !m.completedAt && new Date(m.scheduledAt) >= new Date())
  const past = meetings.filter((m) => m.completedAt || new Date(m.scheduledAt) < new Date())

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
        <h1 className="text-2xl font-bold text-amber-400">1-on-1 Meetings</h1>
        <Button className="bg-amber-500 hover:bg-amber-600 text-black">
          <Plus className="mr-2 h-4 w-4" /> Lên lịch mới
        </Button>
      </div>

      {meetings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
          <Users className="h-16 w-16 mb-4 text-zinc-700" />
          <p className="text-lg">Chưa có cuộc họp 1-on-1 nào</p>
          <p className="text-sm text-zinc-600 mt-1">Lên lịch họp 1-on-1 với team của bạn</p>
        </div>
      ) : (
        <>
          {/* Upcoming */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-amber-400" /> Sắp tới ({upcoming.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcoming.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-4">Không có cuộc họp sắp tới</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800">
                      <TableHead className="text-zinc-400">Nhân viên / Quản lý</TableHead>
                      <TableHead className="text-zinc-400">Ngày</TableHead>
                      <TableHead className="text-zinc-400">Thời lượng</TableHead>
                      <TableHead className="text-zinc-400">Trạng thái</TableHead>
                      <TableHead className="text-zinc-400">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcoming.map((meeting) => (
                      <TableRow key={meeting.id} className="border-zinc-800">
                        <TableCell className="text-zinc-200">
                          {meeting.employee?.fullName || 'N/A'} / {meeting.manager?.fullName || 'N/A'}
                        </TableCell>
                        <TableCell className="text-zinc-400">
                          {new Date(meeting.scheduledAt).toLocaleString('vi-VN')}
                        </TableCell>
                        <TableCell className="text-zinc-400">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {meeting.duration} phút
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-blue-500/20 text-blue-400">Đã lên lịch</Badge>
                        </TableCell>
                        <TableCell>
                          <Link href={`/performance/one-on-ones/${meeting.id}`}>
                            <Button size="sm" variant="ghost" className="text-amber-400">Xem</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Past */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100 flex items-center gap-2">
                <Clock className="h-4 w-4 text-zinc-500" /> Đã qua ({past.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {past.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-4">Không có cuộc họp đã qua</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800">
                      <TableHead className="text-zinc-400">Nhân viên / Quản lý</TableHead>
                      <TableHead className="text-zinc-400">Ngày</TableHead>
                      <TableHead className="text-zinc-400">Thời lượng</TableHead>
                      <TableHead className="text-zinc-400">Trạng thái</TableHead>
                      <TableHead className="text-zinc-400">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {past.map((meeting) => (
                      <TableRow key={meeting.id} className="border-zinc-800">
                        <TableCell className="text-zinc-200">
                          {meeting.employee?.fullName || 'N/A'} / {meeting.manager?.fullName || 'N/A'}
                        </TableCell>
                        <TableCell className="text-zinc-400">
                          {new Date(meeting.scheduledAt).toLocaleString('vi-VN')}
                        </TableCell>
                        <TableCell className="text-zinc-400">{meeting.duration} phút</TableCell>
                        <TableCell>
                          {meeting.completedAt ? (
                            <Badge className="bg-green-500/20 text-green-400">Hoàn thành</Badge>
                          ) : (
                            <Badge className="bg-zinc-700 text-zinc-400">Bỏ lỡ</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Link href={`/performance/one-on-ones/${meeting.id}`}>
                            <Button size="sm" variant="ghost" className="text-amber-400">Xem</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
