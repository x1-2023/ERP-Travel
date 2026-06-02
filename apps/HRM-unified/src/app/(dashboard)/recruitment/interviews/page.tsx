'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Calendar as CalendarIcon,
  List,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingPage } from '@/components/shared/loading-spinner'
import { INTERVIEW_TYPE, INTERVIEW_RESULT } from '@/lib/recruitment/constants'

interface Interview {
  id: string
  type: string
  candidateName: string
  position: string
  scheduledAt: string
  duration: number
  location: string
  result: string
  interviewers: string[]
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('list')
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    async function fetchInterviews() {
      try {
        const res = await fetch('/api/recruitment/interviews')
        if (!res.ok) throw new Error('Không thể tải danh sách phỏng vấn')
        const json = await res.json()
        // API returns { success: true, data: [...] }
        const data = json.data || json || []
        setInterviews(Array.isArray(data) ? data : [])
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
      } finally {
        setLoading(false)
      }
    }
    fetchInterviews()
  }, [])

  const getResultBadge = (result: string) => {
    const info = INTERVIEW_RESULT[result]
    if (!info) return <Badge variant="secondary">{result}</Badge>
    const colorMap: Record<string, string> = {
      gray: 'bg-gray-100 text-gray-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      orange: 'bg-orange-100 text-orange-800',
      yellow: 'bg-yellow-100 text-yellow-800',
    }
    return <Badge className={colorMap[info.color] || ''}>{info.label}</Badge>
  }

  // Calendar helpers
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startOffset = firstDay.getDay()
    const days: (Date | null)[] = []

    for (let i = 0; i < startOffset; i++) {
      days.push(null)
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d))
    }
    return days
  }, [currentDate])

  const getInterviewsForDate = (date: Date) => {
    return interviews.filter(interview => {
      const interviewDate = new Date(interview.scheduledAt)
      return (
        interviewDate.getFullYear() === date.getFullYear() &&
        interviewDate.getMonth() === date.getMonth() &&
        interviewDate.getDate() === date.getDate()
      )
    })
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  if (loading) return <LoadingPage />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Phỏng vấn"
        description="Quản lý lịch phỏng vấn"
      />

      {error ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {error}
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="list" className="gap-2">
              <List className="h-4 w-4" />
              Danh sách
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              Lịch
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ứng viên</TableHead>
                      <TableHead>Vị trí</TableHead>
                      <TableHead>Loại PV</TableHead>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Người PV</TableHead>
                      <TableHead>Kết quả</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {interviews.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Chưa có lịch phỏng vấn nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      interviews.map((interview) => (
                        <TableRow key={interview.id}>
                          <TableCell>
                            <Link
                              href={`/recruitment/interviews/${interview.id}`}
                              className="font-medium hover:underline"
                            >
                              {interview.candidateName}
                            </Link>
                          </TableCell>
                          <TableCell className="text-sm">{interview.position}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {INTERVIEW_TYPE[interview.type]?.label || interview.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              {new Date(interview.scheduledAt).toLocaleString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {interview.interviewers.join(', ')}
                          </TableCell>
                          <TableCell>{getResultBadge(interview.result)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={prevMonth}>
                    &lt;
                  </Button>
                  <CardTitle>
                    {currentDate.toLocaleDateString('vi-VN', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={nextMonth}>
                    &gt;
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                      {day}
                    </div>
                  ))}
                  {calendarDays.map((day, idx) => {
                    if (!day) {
                      return <div key={`empty-${idx}`} className="p-2" />
                    }
                    const dayInterviews = getInterviewsForDate(day)
                    const isToday =
                      day.toDateString() === new Date().toDateString()
                    return (
                      <div
                        key={day.toISOString()}
                        className={`min-h-[80px] p-1 border rounded-lg ${
                          isToday ? 'bg-primary/5 border-primary' : 'border-gray-100'
                        }`}
                      >
                        <div className={`text-xs font-medium p-1 ${isToday ? 'text-primary' : ''}`}>
                          {day.getDate()}
                        </div>
                        {dayInterviews.slice(0, 2).map((interview) => (
                          <Link
                            key={interview.id}
                            href={`/recruitment/interviews/${interview.id}`}
                            className="block text-xs p-1 mb-0.5 rounded bg-blue-50 text-blue-700 truncate hover:bg-blue-100"
                          >
                            {new Date(interview.scheduledAt).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            {interview.candidateName}
                          </Link>
                        ))}
                        {dayInterviews.length > 2 && (
                          <p className="text-xs text-muted-foreground px-1">
                            +{dayInterviews.length - 2} khác
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
