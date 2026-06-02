'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, AlertTriangle, Plus, CheckCircle, XCircle, Clock, User, Calendar } from 'lucide-react'
import { PIP, PIPMilestone, PIPCheckIn } from '@/types/performance'
import { PIP_STATUS } from '@/lib/performance/constants'

function PIPTimeline({ milestones, checkIns }: { milestones: PIPMilestone[]; checkIns: PIPCheckIn[] }) {
  const allEvents = [
    ...milestones.map((m) => ({ type: 'milestone' as const, date: m.dueDate, data: m })),
    ...checkIns.map((c) => ({ type: 'checkin' as const, date: c.checkInDate, data: c })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="space-y-3">
      {allEvents.map((event, idx) => (
        <div key={idx} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full ${
              event.type === 'milestone'
                ? (event.data as PIPMilestone).completedAt ? 'bg-green-400' : 'bg-amber-400'
                : 'bg-blue-400'
            }`} />
            {idx < allEvents.length - 1 && <div className="w-px h-full bg-zinc-700 min-h-[20px]" />}
          </div>
          <div className="flex-1 pb-4">
            {event.type === 'milestone' ? (
              <div className="p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-200">{(event.data as PIPMilestone).title}</span>
                  <Badge variant="outline" className="text-xs border-zinc-600">
                    {(event.data as PIPMilestone).completedAt ? 'Hoàn thành' : (event.data as PIPMilestone).status}
                  </Badge>
                </div>
                {(event.data as PIPMilestone).description && (
                  <p className="text-xs text-zinc-500 mt-1">{(event.data as PIPMilestone).description}</p>
                )}
                <p className="text-xs text-zinc-600 mt-1">
                  Hạn: {new Date((event.data as PIPMilestone).dueDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
            ) : (
              <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-300">Check-in</span>
                  {(event.data as PIPCheckIn).isOnTrack ? (
                    <Badge className="bg-green-500/20 text-green-400 text-xs">Đúng tiến độ</Badge>
                  ) : (
                    <Badge className="bg-red-500/20 text-red-400 text-xs">Chậm tiến độ</Badge>
                  )}
                </div>
                <p className="text-xs text-zinc-500 mt-1">{(event.data as PIPCheckIn).progressNotes}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function PIPDetailPage() {
  const params = useParams()
  const [pip, setPip] = useState<PIP | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPIP() {
      try {
        const res = await fetch(`/api/performance/pip/${params.id}`)
        if (res.ok) {
          setPip(await res.json())
        }
      } catch {
        // Handle error
      } finally {
        setLoading(false)
      }
    }
    loadPIP()
  }, [params.id])

  const handleStatusUpdate = async (action: string) => {
    try {
      const res = await fetch(`/api/performance/pip/${params.id}/${action}`, {
        method: 'POST',
      })
      if (res.ok) {
        setPip(await res.json())
      }
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

  if (!pip) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-zinc-500">
        <AlertTriangle className="h-16 w-16 mb-4 text-zinc-700" />
        <p>Không tìm thấy PIP</p>
        <Link href="/performance/pip">
          <Button variant="ghost" className="mt-4 text-amber-400">Quay lại</Button>
        </Link>
      </div>
    )
  }

  const statusInfo = PIP_STATUS[pip.status as keyof typeof PIP_STATUS]

  return (
    <div className="space-y-6 p-6 bg-zinc-950 min-h-screen text-zinc-100">
      <div className="flex items-center gap-4">
        <Link href="/performance/pip">
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-amber-400">PIP - {pip.employee?.fullName}</h1>
          <Badge className={
            statusInfo?.color === 'green' ? 'bg-green-500/20 text-green-400' :
            statusInfo?.color === 'red' ? 'bg-red-500/20 text-red-400' :
            statusInfo?.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
            statusInfo?.color === 'orange' ? 'bg-orange-500/20 text-orange-400' :
            'bg-zinc-700 text-zinc-300'
          }>
            {statusInfo?.label || pip.status}
          </Badge>
        </div>
        {pip.status === 'ACTIVE' && (
          <div className="flex gap-2">
            <Button onClick={() => handleStatusUpdate('complete')} className="bg-green-600 hover:bg-green-700 text-white" size="sm">
              <CheckCircle className="mr-1 h-3 w-3" /> Hoàn thành
            </Button>
            <Button onClick={() => handleStatusUpdate('fail')} variant="outline" className="border-red-600 text-red-400" size="sm">
              <XCircle className="mr-1 h-3 w-3" /> Không đạt
            </Button>
            <Button onClick={() => handleStatusUpdate('extend')} variant="outline" className="border-zinc-600 text-zinc-300" size="sm">
              <Clock className="mr-1 h-3 w-3" /> Gia hạn
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PIP Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100">Thông tin PIP</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-zinc-400">
                  <User className="h-4 w-4" />
                  <span>Nhân viên: {pip.employee?.fullName} ({pip.employee?.employeeCode})</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <User className="h-4 w-4" />
                  <span>Quản lý: {pip.manager?.fullName}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <Calendar className="h-4 w-4" />
                  <span>Bắt đầu: {new Date(pip.startDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <Calendar className="h-4 w-4" />
                  <span>Kết thúc: {new Date(pip.endDate).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800">
                <p className="text-xs text-zinc-500 mb-1">Vấn đề hiệu suất</p>
                <p className="text-sm text-zinc-300">{pip.performanceIssues}</p>
              </div>

              {pip.impactDescription && (
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Ảnh hưởng</p>
                  <p className="text-sm text-zinc-300">{pip.impactDescription}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-zinc-500 mb-1">Kết quả mong đợi</p>
                <p className="text-sm text-zinc-300">{pip.expectedOutcomes}</p>
              </div>

              {pip.supportProvided && (
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Hỗ trợ</p>
                  <p className="text-sm text-zinc-300">{pip.supportProvided}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-zinc-100">Timeline</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300">
                  <Plus className="mr-1 h-3 w-3" /> Milestone
                </Button>
                <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300">
                  <Plus className="mr-1 h-3 w-3" /> Check-in
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {(pip.milestones?.length || 0) + (pip.checkIns?.length || 0) > 0 ? (
                <PIPTimeline milestones={pip.milestones || []} checkIns={pip.checkIns || []} />
              ) : (
                <div className="text-center py-8 text-zinc-500">
                  <Clock className="h-12 w-12 mx-auto mb-3 text-zinc-700" />
                  <p>Chưa có milestones hoặc check-ins</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-sm text-zinc-400">Tổng quan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Milestones</span>
                <span className="text-zinc-300">
                  {pip.milestones?.filter((m) => m.completedAt).length || 0}/{pip.milestones?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Check-ins</span>
                <span className="text-zinc-300">{pip.checkIns?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Ngày còn lại</span>
                <span className="text-zinc-300">
                  {Math.max(0, Math.ceil((new Date(pip.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}
                </span>
              </div>
              {pip.outcome && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Kết quả</span>
                  <span className="text-zinc-300">{pip.outcome}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
