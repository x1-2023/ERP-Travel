'use client'

import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import Link from 'next/link'
import {
  Phone,
  Mail,
  Users,
  CheckSquare,
  FileText,
  Coffee,
  Monitor,
  ArrowRight,
  Circle,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ActivityWithRelations } from '@/types'
import { Badge } from '@/components/ui/badge'
import { ACTIVITY_TYPES } from '@/lib/constants'
import { useTranslation } from '@/i18n'

// ── Icon map ────────────────────────────────────────────────────────
const iconMap: Record<string, React.ElementType> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Users,
  TASK: CheckSquare,
  NOTE: FileText,
  LUNCH: Coffee,
  DEMO: Monitor,
  FOLLOW_UP: ArrowRight,
}

const colorMap: Record<string, string> = {
  CALL: '#10B981',
  EMAIL: '#3B82F6',
  MEETING: '#8B5CF6',
  TASK: '#F59E0B',
  NOTE: '#6B7280',
  LUNCH: '#F97316',
  DEMO: '#06B6D4',
  FOLLOW_UP: '#EC4899',
}

// ── Props ───────────────────────────────────────────────────────────
interface ActivityFeedProps {
  activities: ActivityWithRelations[]
  onToggleComplete?: (id: string, completed: boolean) => void
}

export function ActivityFeed({ activities, onToggleComplete }: ActivityFeedProps) {
  const { t } = useTranslation()
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Circle className="w-12 h-12 text-[#333] mb-3" />
        <p className="text-[var(--crm-text-secondary)] text-sm">{t('activities.empty')}</p>
      </div>
    )
  }

  return (
    <div className="relative space-y-0">
      {/* Vertical timeline line */}
      <div className="absolute left-[19px] top-3 bottom-3 w-px bg-[var(--crm-border)]" />

      {activities.map((activity) => {
        const Icon = iconMap[activity.type] || Circle
        const color = colorMap[activity.type] || '#6B7280'
        const typeLabel = ACTIVITY_TYPES.find((at) => at.value === activity.type)
        const typeLabelText = typeLabel ? t(typeLabel.labelKey) : activity.type

        return (
          <div key={activity.id} className="relative flex gap-3 py-3 group">
            {/* Icon */}
            <div
              className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full shrink-0 border border-[var(--crm-border)]"
              style={{ backgroundColor: `${color}15` }}
            >
              <Icon className="w-4 h-4" style={{ color }} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-[var(--crm-text-primary)] truncate">
                      {activity.subject}
                    </span>
                    <Badge
                      className="text-[10px] px-1.5 py-0 border-0"
                      style={{ backgroundColor: `${color}20`, color }}
                    >
                      {typeLabelText}
                    </Badge>
                  </div>

                  {activity.description && (
                    <p className="mt-0.5 text-xs text-[var(--crm-text-muted)] line-clamp-2">
                      {activity.description}
                    </p>
                  )}

                  {/* Linked entities */}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {activity.contact && (
                      <Link
                        href={`/contacts/${activity.contact.id}`}
                        className="text-xs text-[#10B981] hover:underline"
                      >
                        {activity.contact.firstName} {activity.contact.lastName}
                      </Link>
                    )}
                    {activity.deal && (
                      <Link
                        href={`/pipeline?deal=${activity.deal.id}`}
                        className="text-xs text-[#3B82F6] hover:underline"
                      >
                        {activity.deal.title}
                      </Link>
                    )}
                    {activity.company && (
                      <Link
                        href={`/companies/${activity.company.id}`}
                        className="text-xs text-[#8B5CF6] hover:underline"
                      >
                        {activity.company.name}
                      </Link>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Toggle complete for tasks */}
                  {activity.type === 'TASK' && onToggleComplete && (
                    <button
                      onClick={() => onToggleComplete(activity.id, !activity.isCompleted)}
                      className={cn(
                        'transition-colors',
                        activity.isCompleted
                          ? 'text-[#10B981] hover:text-[#10B981]/70'
                          : 'text-[var(--crm-text-muted)] hover:text-[var(--crm-text-secondary)]'
                      )}
                    >
                      {activity.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                  )}

                  {/* Time ago */}
                  <span className="text-[11px] text-[var(--crm-text-muted)] whitespace-nowrap">
                    {formatDistanceToNow(new Date(activity.createdAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </span>
                </div>
              </div>

              {/* User avatar / name */}
              <div className="flex items-center gap-1.5 mt-2">
                <div className="w-5 h-5 rounded-full bg-[var(--crm-bg-hover)] flex items-center justify-center text-[10px] text-[var(--crm-text-secondary)] font-medium">
                  {activity.user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-[11px] text-[var(--crm-text-muted)]">
                  {activity.user?.name || t('common.user')}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
