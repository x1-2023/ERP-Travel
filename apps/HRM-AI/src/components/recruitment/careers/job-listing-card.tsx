'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { JOB_TYPE, WORK_MODE } from '@/lib/recruitment/constants'
import type { JobPosting } from '@/types/recruitment'
import { MapPin, Briefcase, Monitor, Clock, ArrowRight } from 'lucide-react'

interface JobListingCardProps {
  posting: JobPosting
  onApply?: () => void
  onViewDetails?: () => void
}

export function JobListingCard({ posting, onApply, onViewDetails }: JobListingCardProps) {
  const publishedDate = posting.publishedAt
    ? new Date(posting.publishedAt)
    : new Date(posting.createdAt)

  const daysAgo = Math.floor(
    (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  const timeLabel =
    daysAgo === 0
      ? 'Hôm nay'
      : daysAgo === 1
      ? 'Hôm qua'
      : `${daysAgo} ngày trước`

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:border-primary/30 group">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                {posting.title}
              </h3>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {timeLabel}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                <Briefcase className="h-3 w-3 mr-1" />
                {JOB_TYPE[posting.jobType]?.label || posting.jobType}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Monitor className="h-3 w-3 mr-1" />
                {WORK_MODE[posting.workMode]?.label || posting.workMode}
              </Badge>
              {posting.location && (
                <Badge variant="outline" className="text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  {posting.location}
                </Badge>
              )}
            </div>

            {posting.salaryDisplay && (
              <div className="text-sm font-medium text-green-700">
                {posting.salaryDisplay}
              </div>
            )}

            {posting.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {posting.description}
              </p>
            )}
          </div>

          <div className="flex sm:flex-col gap-2 sm:items-end">
            <Button onClick={onApply} size="sm">
              Ứng tuyển
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onViewDetails}>
              Chi tiết
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
