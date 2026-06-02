'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Plus, ListChecks, FileText, Users, CheckCircle } from 'lucide-react'
import { OneOnOne, AgendaItem, ActionItem } from '@/types/performance'

export default function OneOnOneDetailPage() {
  const params = useParams()
  const [meeting, setMeeting] = useState<OneOnOne | null>(null)
  const [loading, setLoading] = useState(true)
  const [newAgendaItem, setNewAgendaItem] = useState('')

  useEffect(() => {
    async function loadMeeting() {
      try {
        const res = await fetch(`/api/performance/one-on-ones/${params.id}`)
        if (res.ok) {
          setMeeting(await res.json())
        }
      } catch {
        // Handle error
      } finally {
        setLoading(false)
      }
    }
    loadMeeting()
  }, [params.id])

  const handleAddAgenda = async () => {
    if (!newAgendaItem.trim()) return
    try {
      const res = await fetch(`/api/performance/one-on-ones/${params.id}/agenda`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: newAgendaItem, owner: 'employee' }),
      })
      if (res.ok) {
        const updated = await res.json()
        setMeeting(updated)
        setNewAgendaItem('')
      }
    } catch {
      // Handle error
    }
  }

  const handleComplete = async () => {
    try {
      const res = await fetch(`/api/performance/one-on-ones/${params.id}/complete`, {
        method: 'POST',
      })
      if (res.ok) {
        const updated = await res.json()
        setMeeting(updated)
      }
    } catch {
      // Handle error
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64 bg-zinc-800" />
        <Skeleton className="h-64 bg-zinc-800" />
      </div>
    )
  }

  if (!meeting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-zinc-500">
        <Users className="h-16 w-16 mb-4 text-zinc-700" />
        <p>Không tìm thấy cuộc họp</p>
        <Link href="/performance/one-on-ones">
          <Button variant="ghost" className="mt-4 text-amber-400">Quay lại</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 bg-zinc-950 min-h-screen text-zinc-100">
      <div className="flex items-center gap-4">
        <Link href="/performance/one-on-ones">
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-amber-400">1-on-1 Meeting</h1>
          <p className="text-sm text-zinc-400 mt-1">
            {meeting.employee?.fullName} & {meeting.manager?.fullName} - {new Date(meeting.scheduledAt).toLocaleString('vi-VN')} ({meeting.duration} phút)
          </p>
        </div>
        {!meeting.completedAt && (
          <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700 text-white">
            <CheckCircle className="mr-2 h-4 w-4" /> Hoàn thành
          </Button>
        )}
        {meeting.completedAt && (
          <Badge className="bg-green-500/20 text-green-400">Đã hoàn thành</Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agenda */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100 flex items-center gap-2">
              <FileText className="h-4 w-4" /> Chương trình
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {meeting.agenda && meeting.agenda.length > 0 ? (
              meeting.agenda.map((item, idx) => (
                <div key={idx} className="p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-200">{item.topic}</span>
                    <Badge variant="outline" className="text-xs border-zinc-600">
                      {item.owner === 'employee' ? 'NV' : 'QL'}
                    </Badge>
                  </div>
                  {item.notes && (
                    <p className="text-xs text-zinc-500 mt-2">{item.notes}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-600 text-center py-4">Chưa có chương trình</p>
            )}
            <div className="flex gap-2 pt-2">
              <Input
                value={newAgendaItem}
                onChange={(e) => setNewAgendaItem(e.target.value)}
                placeholder="Thêm chủ đề..."
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                onKeyDown={(e) => e.key === 'Enter' && handleAddAgenda()}
              />
              <Button size="sm" onClick={handleAddAgenda} className="bg-amber-500 hover:bg-amber-600 text-black">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <div className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100 text-sm">Ghi chú nhân viên</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-300 whitespace-pre-wrap">
                {meeting.employeeNotes || 'Chưa có ghi chú'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100 text-sm">Ghi chú quản lý</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-300 whitespace-pre-wrap">
                {meeting.managerNotes || 'Chưa có ghi chú'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Items */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100 flex items-center gap-2">
            <ListChecks className="h-4 w-4" /> Công việc theo dõi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {meeting.actionItems && meeting.actionItems.length > 0 ? (
            <div className="space-y-2">
              {meeting.actionItems.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-zinc-800 rounded-lg">
                  <Checkbox checked={item.completed} className="mt-0.5" />
                  <div className="flex-1">
                    <p className={`text-sm ${item.completed ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                      {item.task}
                    </p>
                    <div className="flex gap-3 mt-1 text-xs text-zinc-600">
                      <span>Phụ trách: {item.assignee}</span>
                      {item.dueDate && <span>Hạn: {new Date(item.dueDate).toLocaleDateString('vi-VN')}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-600 text-center py-4">Không có công việc theo dõi</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
