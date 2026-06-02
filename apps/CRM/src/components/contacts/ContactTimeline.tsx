'use client'

import {
  Phone,
  Mail,
  Users,
  CheckSquare,
  FileText,
  Coffee,
  Monitor,
  ArrowRight,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { ACTIVITY_TYPES } from '@/lib/constants'
import type { ActivityWithRelations } from '@/types'

interface ContactTimelineProps {
  activities: ActivityWithRelations[]
}

const iconMap: Record<string, React.ElementType> = {
  Phone,
  Mail,
  Users,
  CheckSquare,
  FileText,
  Coffee,
  Monitor,
  ArrowRight,
}

const colorMap: Record<string, string> = {
  CALL: '#10B981',
  EMAIL: '#3B82F6',
  MEETING: '#8B5CF6',
  TASK: '#F59E0B',
  NOTE: '#6B7280',
  LUNCH: '#EC4899',
  DEMO: '#06B6D4',
  FOLLOW_UP: '#F97316',
}

export function ContactTimeline({ activities }: ContactTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-[var(--crm-text-muted)]">Chưa có hoạt động nào</p>
      </div>
    )
  }

  return (
    <div className="relative space-y-0">
      {/* Vertical line */}
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-[var(--crm-border)]" />

      {activities.map((activity) => {
        const typeMeta = ACTIVITY_TYPES.find((t) => t.value === activity.type)
        const IconComponent = typeMeta
          ? iconMap[typeMeta.icon] || FileText
          : FileText
        const dotColor = colorMap[activity.type] || '#6B7280'

        return (
          <div key={activity.id} className="relative flex gap-3 pb-4">
            {/* Icon dot */}
            <div
              className="relative z-10 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: `${dotColor}20` }}
            >
              <IconComponent
                className="h-3.5 w-3.5"
                style={{ color: dotColor }}
              />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-[var(--crm-text-primary)]">
                  {activity.subject}
                </p>
                <span className="shrink-0 text-xs text-[var(--crm-text-muted)]">
                  {formatDistanceToNow(new Date(activity.createdAt), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </span>
              </div>
              {activity.description && (
                <p className="mt-0.5 text-xs text-[var(--crm-text-secondary)] line-clamp-2">
                  {activity.description}
                </p>
              )}
              {activity.user && (
                <p className="mt-1 text-xs text-[var(--crm-text-muted)]">
                  {activity.user.name || activity.user.email}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
