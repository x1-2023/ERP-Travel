'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ONBOARDING_STATUS } from '@/lib/recruitment/constants'
import type { OnboardingData } from '@/types/recruitment'
import { CheckCircle2, Clock, User, Calendar } from 'lucide-react'

interface OnboardingProgressProps {
  onboarding: OnboardingData
}

export function OnboardingProgress({ onboarding }: OnboardingProgressProps) {
  const statusConfig = ONBOARDING_STATUS[onboarding.status] || {
    label: onboarding.status,
    color: 'gray',
  }

  const statusColorMap: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-800',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
  }

  const totalTasks = onboarding.tasks?.length || 0
  const completedTasks = onboarding.tasks?.filter((t) => t.status === 'COMPLETED').length || 0
  const overdueTasks = onboarding.tasks?.filter(
    (t) => t.status !== 'COMPLETED' && new Date(t.dueDate) < new Date()
  ).length || 0

  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const daysRemaining = Math.max(
    0,
    Math.ceil(
      (new Date(onboarding.expectedEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
  )

  const getProgressColor = () => {
    if (progressPercentage >= 100) return 'bg-green-500'
    if (progressPercentage >= 75) return 'bg-blue-500'
    if (progressPercentage >= 50) return 'bg-yellow-500'
    return 'bg-orange-500'
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Tiến trình Onboarding</CardTitle>
          <Badge className={statusColorMap[statusConfig.color] || statusColorMap.gray}>
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Employee info */}
        {onboarding.employee && (
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">{onboarding.employee.fullName}</p>
              <p className="text-xs text-muted-foreground">
                {onboarding.employee.employeeCode}
                {onboarding.employee.position && ` - ${onboarding.employee.position}`}
              </p>
            </div>
          </div>
        )}

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tiến trình</span>
            <span className="font-bold text-lg">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${getProgressColor()}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{completedTasks} / {totalTasks} công việc</span>
            {onboarding.completedAt ? (
              <span className="text-green-600 font-medium">
                Hoàn thành {new Date(onboarding.completedAt).toLocaleDateString('vi-VN')}
              </span>
            ) : (
              <span>Còn {daysRemaining} ngày</span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <div className="flex justify-center mb-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-lg font-bold text-green-700">{completedTasks}</p>
            <p className="text-[10px] text-green-600">Hoàn thành</p>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <div className="flex justify-center mb-1">
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-lg font-bold text-blue-700">
              {totalTasks - completedTasks}
            </p>
            <p className="text-[10px] text-blue-600">Còn lại</p>
          </div>
          <div className="text-center p-2 bg-red-50 rounded-lg">
            <div className="flex justify-center mb-1">
              <Calendar className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-lg font-bold text-red-700">{overdueTasks}</p>
            <p className="text-[10px] text-red-600">Quá hạn</p>
          </div>
        </div>

        {/* Buddy and HR */}
        <div className="space-y-2 pt-2 border-t">
          {onboarding.buddy && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Buddy:</span>
              <span className="font-medium">{onboarding.buddy.fullName}</span>
            </div>
          )}
          {onboarding.hrContact && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">HR phụ trách:</span>
              <span className="font-medium">{onboarding.hrContact.name}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Ngày bắt đầu:</span>
            <span>{new Date(onboarding.startDate).toLocaleDateString('vi-VN')}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Dự kiến kết thúc:</span>
            <span>{new Date(onboarding.expectedEndDate).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
