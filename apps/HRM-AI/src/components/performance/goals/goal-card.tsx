'use client'

import { Calendar, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GoalProgress } from './goal-progress'
import { GOAL_TYPE, GOAL_STATUS, GOAL_PRIORITY } from '@/lib/performance/constants'
import type { Goal } from '@/types/performance'

interface GoalCardProps {
  goal: Goal
  onClick?: () => void
}

const colorMap: Record<string, string> = {
  purple: 'bg-purple-500/15 text-purple-400',
  blue: 'bg-blue-500/15 text-blue-400',
  green: 'bg-success/15 text-success',
  orange: 'bg-primary/15 text-primary',
  gray: 'bg-muted text-muted-foreground',
  red: 'bg-destructive/15 text-destructive',
  yellow: 'bg-yellow-500/15 text-yellow-400',
}

export function GoalCard({ goal, onClick }: GoalCardProps) {
  const typeInfo = GOAL_TYPE[goal.goalType as keyof typeof GOAL_TYPE]
  const statusInfo = GOAL_STATUS[goal.status as keyof typeof GOAL_STATUS]
  const priorityInfo = GOAL_PRIORITY[goal.priority as keyof typeof GOAL_PRIORITY]

  return (
    <Card
      className={cn(
        'cursor-pointer transition-colors hover:border-primary/50',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium leading-tight line-clamp-2">
            {goal.title}
          </h4>
          <div className="flex items-center gap-1 shrink-0">
            {typeInfo && (
              <Badge className={cn('text-[10px]', colorMap[typeInfo.color])}>
                {typeInfo.label}
              </Badge>
            )}
            {priorityInfo && (
              <Badge className={cn('text-[10px]', colorMap[priorityInfo.color])}>
                {priorityInfo.label}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        <GoalProgress progress={goal.progress} size="sm" showLabel />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            {statusInfo && (
              <Badge
                variant="outline"
                className={cn('text-[10px] py-0', colorMap[statusInfo.color])}
              >
                {statusInfo.label}
              </Badge>
            )}
          </div>
          {goal.weight > 0 && (
            <span className="font-data text-[10px]">
              Trọng số: {goal.weight}%
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {goal.owner && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="truncate max-w-[120px]">{goal.owner.fullName}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span className="font-data">
              {new Date(goal.startDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
              {' - '}
              {new Date(goal.endDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
