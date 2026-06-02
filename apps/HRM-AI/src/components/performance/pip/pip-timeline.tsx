'use client'

import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { PIPMilestone, PIPCheckIn } from '@/types/performance'

interface PIPTimelineProps {
  milestones: PIPMilestone[]
  checkIns: PIPCheckIn[]
}

type TimelineItem =
  | { type: 'milestone'; data: PIPMilestone; date: string }
  | { type: 'checkin'; data: PIPCheckIn; date: string }

function getMilestoneIcon(status: string) {
  switch (status) {
    case 'COMPLETED':
      return <CheckCircle2 className="h-4 w-4 text-success" />
    case 'OVERDUE':
      return <AlertCircle className="h-4 w-4 text-destructive" />
    case 'IN_PROGRESS':
      return <Clock className="h-4 w-4 text-primary" />
    default:
      return <Circle className="h-4 w-4 text-muted-foreground" />
  }
}

export function PIPTimeline({ milestones, checkIns }: PIPTimelineProps) {
  // Combine and sort chronologically
  const items: TimelineItem[] = [
    ...milestones.map((m) => ({
      type: 'milestone' as const,
      data: m,
      date: m.dueDate,
    })),
    ...checkIns.map((c) => ({
      type: 'checkin' as const,
      data: c,
      date: c.checkInDate,
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  if (items.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        Chưa có sự kiện nào
      </div>
    )
  }

  return (
    <div className="relative space-y-0">
      {/* Timeline line */}
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

      {items.map((item, index) => (
        <div key={`${item.type}-${index}`} className="relative flex gap-3 pb-4">
          {/* Icon */}
          <div className="relative z-10 shrink-0 mt-0.5">
            {item.type === 'milestone' ? (
              getMilestoneIcon(item.data.status)
            ) : (
              <div
                className={cn(
                  'h-4 w-4 rounded-full border-2',
                  (item.data as PIPCheckIn).isOnTrack
                    ? 'border-success bg-success/20'
                    : 'border-destructive bg-destructive/20'
                )}
              />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 p-3 rounded-sm border bg-card">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                {item.type === 'milestone' ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] py-0 shrink-0">
                        Milestone
                      </Badge>
                      <span className="text-sm font-medium truncate">
                        {(item.data as PIPMilestone).title}
                      </span>
                    </div>
                    {(item.data as PIPMilestone).description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {(item.data as PIPMilestone).description}
                      </p>
                    )}
                    {(item.data as PIPMilestone).notes && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        {(item.data as PIPMilestone).notes}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={cn(
                          'text-[10px] py-0 border-transparent',
                          (item.data as PIPCheckIn).isOnTrack
                            ? 'bg-success/15 text-success'
                            : 'bg-destructive/15 text-destructive'
                        )}
                      >
                        {(item.data as PIPCheckIn).isOnTrack ? 'Đúng tiến độ' : 'Chậm tiến độ'}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">Check-in</span>
                    </div>
                    <p className="text-sm mt-1">
                      {(item.data as PIPCheckIn).progressNotes}
                    </p>
                    {(item.data as PIPCheckIn).managerAssessment && (
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium">Quản lý:</span>{' '}
                        {(item.data as PIPCheckIn).managerAssessment}
                      </p>
                    )}
                    {(item.data as PIPCheckIn).nextSteps && (
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium">Bước tiếp:</span>{' '}
                        {(item.data as PIPCheckIn).nextSteps}
                      </p>
                    )}
                  </>
                )}
              </div>
              <span className="text-[10px] font-data text-muted-foreground shrink-0">
                {new Date(item.date).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
