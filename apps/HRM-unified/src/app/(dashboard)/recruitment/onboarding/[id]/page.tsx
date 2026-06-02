'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  User,
  Users,
  Mail,
  Calendar,
  CheckCircle,
  Circle,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingPage } from '@/components/shared/loading-spinner'
import {
  ONBOARDING_STATUS,
  ONBOARDING_TASK_STATUS,
  ONBOARDING_CATEGORY,
  ASSIGNEE_TYPE,
} from '@/lib/recruitment/constants'

interface OnboardingTask {
  id: string
  title: string
  description: string
  category: string
  assigneeType: string
  assigneeName: string
  status: string
  dueDate: string | null
  completedAt: string | null
  order: number
}

interface OnboardingDetail {
  id: string
  employeeName: string
  employeeEmail: string
  position: string
  department: string
  startDate: string
  status: string
  progress: number
  totalTasks: number
  completedTasks: number
  buddyName: string | null
  buddyEmail: string | null
  hrContactName: string | null
  hrContactEmail: string | null
  managerName: string | null
  tasks: OnboardingTask[]
  createdAt: string
}

export default function OnboardingDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [onboarding, setOnboarding] = useState<OnboardingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOnboarding() {
      try {
        const res = await fetch(`/api/recruitment/onboarding/${id}`)
        if (!res.ok) throw new Error('Không thể tải thông tin onboarding')
        const json = await res.json()
        setOnboarding(json)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchOnboarding()
  }, [id])

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
    try {
      const res = await fetch(`/api/recruitment/onboarding/${id}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Không thể cập nhật công việc')
      const updated = await res.json()
      setOnboarding(updated)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    }
  }

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'IN_PROGRESS':
        return <Clock className="h-5 w-5 text-blue-600" />
      case 'OVERDUE':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'SKIPPED':
        return <Circle className="h-5 w-5 text-yellow-600" />
      default:
        return <Circle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    const info = ONBOARDING_STATUS[status]
    if (!info) return <Badge variant="secondary">{status}</Badge>
    const colorMap: Record<string, string> = {
      gray: 'bg-gray-100 text-gray-800',
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
    }
    return <Badge className={colorMap[info.color] || ''}>{info.label}</Badge>
  }

  if (loading) return <LoadingPage />

  if (error || !onboarding) {
    return (
      <div className="space-y-6">
        <PageHeader title="Chi tiết Onboarding" />
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {error || 'Không tìm thấy onboarding'}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Group tasks by category
  const tasksByCategory = onboarding.tasks.reduce((acc, task) => {
    const cat = task.category || 'OTHER'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(task)
    return acc
  }, {} as Record<string, OnboardingTask[]>)

  // Sort categories by order
  const sortedCategories = Object.entries(tasksByCategory).sort((a, b) => {
    const orderA = ONBOARDING_CATEGORY[a[0]]?.order || 99
    const orderB = ONBOARDING_CATEGORY[b[0]]?.order || 99
    return orderA - orderB
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Onboarding: ${onboarding.employeeName}`}
        description={`${onboarding.position} - ${onboarding.department}`}
      >
        <Link href="/recruitment/onboarding">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </Link>
      </PageHeader>

      {/* Progress Overview */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getStatusBadge(onboarding.status)}
              <span className="text-sm text-muted-foreground">
                {onboarding.completedTasks}/{onboarding.totalTasks} công việc hoàn thành
              </span>
            </div>
            <span className="font-medium">{onboarding.progress}%</span>
          </div>
          <Progress value={onboarding.progress} className="h-3" />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {sortedCategories.map(([category, tasks]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-base">
                  {ONBOARDING_CATEGORY[category]?.label || category}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {tasks
                  .sort((a, b) => a.order - b.order)
                  .map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-start gap-3 rounded-lg border p-3 ${
                        task.status === 'COMPLETED' ? 'bg-green-50/50' : ''
                      } ${task.status === 'OVERDUE' ? 'border-red-200' : ''}`}
                    >
                      <button
                        onClick={() => handleToggleTask(task.id, task.status)}
                        className="mt-0.5 flex-shrink-0"
                      >
                        {getTaskStatusIcon(task.status)}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm ${
                          task.status === 'COMPLETED' ? 'line-through text-muted-foreground' : ''
                        }`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5">
                          <Badge variant="outline" className="text-xs">
                            {ASSIGNEE_TYPE[task.assigneeType]?.label || task.assigneeType}
                          </Badge>
                          {task.assigneeName && (
                            <span className="text-xs text-muted-foreground">
                              {task.assigneeName}
                            </span>
                          )}
                          {task.dueDate && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`text-xs flex-shrink-0 ${
                          task.status === 'OVERDUE' ? 'bg-red-100 text-red-800' : ''
                        }`}
                      >
                        {ONBOARDING_TASK_STATUS[task.status]?.label || task.status}
                      </Badge>
                    </div>
                  ))}
              </CardContent>
            </Card>
          ))}

          {sortedCategories.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Chưa có công việc onboarding
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Nhân viên mới
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Họ tên</p>
                <p className="font-medium">{onboarding.employeeName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-sm">{onboarding.employeeEmail}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vị trí</p>
                <p className="text-sm">{onboarding.position}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phòng ban</p>
                <p className="text-sm">{onboarding.department}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ngày bắt đầu</p>
                <p className="text-sm">
                  {new Date(onboarding.startDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </CardContent>
          </Card>

          {(onboarding.buddyName || onboarding.hrContactName || onboarding.managerName) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Người hỗ trợ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {onboarding.buddyName && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Buddy</p>
                    <p className="font-medium text-sm">{onboarding.buddyName}</p>
                    {onboarding.buddyEmail && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {onboarding.buddyEmail}
                      </p>
                    )}
                  </div>
                )}
                {onboarding.hrContactName && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">HR</p>
                    <p className="font-medium text-sm">{onboarding.hrContactName}</p>
                    {onboarding.hrContactEmail && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {onboarding.hrContactEmail}
                      </p>
                    )}
                  </div>
                )}
                {onboarding.managerName && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Quản lý</p>
                    <p className="font-medium text-sm">{onboarding.managerName}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
