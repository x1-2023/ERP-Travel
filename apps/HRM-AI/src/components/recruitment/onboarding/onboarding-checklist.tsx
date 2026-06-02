'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  ONBOARDING_CATEGORY,
} from '@/lib/recruitment/constants'
import type { OnboardingTask } from '@/types/recruitment'
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'

interface OnboardingChecklistProps {
  tasks: OnboardingTask[]
  onTaskComplete: (taskId: string, completed: boolean) => Promise<void>
  readOnly?: boolean
}

export function OnboardingChecklist({
  tasks,
  onTaskComplete,
  readOnly = false,
}: OnboardingChecklistProps) {
  const [loadingTasks, setLoadingTasks] = useState<Set<string>>(new Set())

  // Group tasks by category
  const groupedTasks = tasks.reduce((groups, task) => {
    const category = task.category
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(task)
    return groups
  }, {} as Record<string, OnboardingTask[]>)

  // Sort categories by order
  const sortedCategories = Object.entries(groupedTasks).sort(([a], [b]) => {
    const orderA = ONBOARDING_CATEGORY[a]?.order || 999
    const orderB = ONBOARDING_CATEGORY[b]?.order || 999
    return orderA - orderB
  })

  const handleTaskToggle = async (taskId: string, currentlyCompleted: boolean) => {
    setLoadingTasks((prev) => new Set(prev).add(taskId))
    try {
      await onTaskComplete(taskId, !currentlyCompleted)
    } finally {
      setLoadingTasks((prev) => {
        const next = new Set(prev)
        next.delete(taskId)
        return next
      })
    }
  }

  const getTaskStatusIcon = (task: OnboardingTask) => {
    if (task.status === 'COMPLETED') {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    }
    if (task.status === 'OVERDUE') {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    }
    return <Clock className="h-4 w-4 text-muted-foreground" />
  }

  const getCategoryProgress = (categoryTasks: OnboardingTask[]) => {
    const completed = categoryTasks.filter((t) => t.status === 'COMPLETED').length
    return { completed, total: categoryTasks.length }
  }

  const isTaskOverdue = (task: OnboardingTask) => {
    return task.status !== 'COMPLETED' && new Date(task.dueDate) < new Date()
  }

  return (
    <div className="space-y-4">
      {sortedCategories.map(([category, categoryTasks]) => {
        const sortedTasks = [...categoryTasks].sort((a, b) => a.order - b.order)
        const progress = getCategoryProgress(sortedTasks)
        const categoryConfig = ONBOARDING_CATEGORY[category] || {
          label: category,
          order: 999,
        }

        return (
          <Card key={category}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">
                  {categoryConfig.label}
                </CardTitle>
                <span className="text-xs text-muted-foreground">
                  {progress.completed}/{progress.total} hoàn thành
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div
                  className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${progress.total > 0 ? (progress.completed / progress.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {sortedTasks.map((task) => {
                const isCompleted = task.status === 'COMPLETED'
                const isLoading = loadingTasks.has(task.id)
                const overdue = isTaskOverdue(task)

                return (
                  <div
                    key={task.id}
                    className={`flex items-start gap-3 p-2 rounded-md transition-colors ${
                      isCompleted
                        ? 'bg-green-50/50'
                        : overdue
                        ? 'bg-red-50/50'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={isCompleted}
                      disabled={readOnly || isLoading}
                      onCheckedChange={() => handleTaskToggle(task.id, isCompleted)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <Label
                        htmlFor={`task-${task.id}`}
                        className={`text-sm cursor-pointer ${
                          isCompleted ? 'line-through text-muted-foreground' : ''
                        }`}
                      >
                        {task.title}
                        {task.isRequired && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </Label>
                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          Hạn: {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                        </span>
                        {overdue && !isCompleted && (
                          <Badge variant="destructive" className="text-[10px] px-1 py-0">
                            Quá hạn
                          </Badge>
                        )}
                        {task.completedAt && (
                          <span className="text-xs text-green-600">
                            Xong: {new Date(task.completedAt).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                      </div>
                    </div>
                    {getTaskStatusIcon(task)}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )
      })}

      {sortedCategories.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Chưa có danh sách công việc onboarding
          </CardContent>
        </Card>
      )}
    </div>
  )
}
