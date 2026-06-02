'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { JOB_POSTING_STATUS, JOB_TYPE, WORK_MODE } from '@/lib/recruitment/constants'
import type { JobPosting } from '@/types/recruitment'
import {
  MapPin,
  Briefcase,
  Monitor,
  Eye,
  Users,
  Calendar,
  ExternalLink,
  Edit,
} from 'lucide-react'

interface JobPostingCardProps {
  posting: JobPosting
  onEdit?: () => void
  onView?: () => void
}

export function JobPostingCard({ posting, onEdit, onView }: JobPostingCardProps) {
  const statusConfig = JOB_POSTING_STATUS[posting.status] || {
    label: posting.status,
    color: 'gray',
  }

  const statusColorMap: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
  }

  const formattedDate = posting.publishedAt
    ? new Date(posting.publishedAt).toLocaleDateString('vi-VN')
    : null

  const expiryDate = posting.expiresAt
    ? new Date(posting.expiresAt).toLocaleDateString('vi-VN')
    : null

  const isExpired = posting.expiresAt && new Date(posting.expiresAt) < new Date()

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base">{posting.title}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={statusColorMap[statusConfig.color] || statusColorMap.gray}>
                {statusConfig.label}
              </Badge>
              {posting.isInternal && (
                <Badge variant="outline" className="text-xs">
                  Nội bộ
                </Badge>
              )}
              {isExpired && (
                <Badge variant="destructive" className="text-xs">
                  Hết hạn
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onView && (
              <Button variant="ghost" size="sm" onClick={onView}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5" />
            {JOB_TYPE[posting.jobType]?.shortLabel || posting.jobType}
          </span>
          <span className="flex items-center gap-1">
            <Monitor className="h-3.5 w-3.5" />
            {WORK_MODE[posting.workMode]?.shortLabel || posting.workMode}
          </span>
          {posting.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {posting.location}
            </span>
          )}
        </div>

        {posting.salaryDisplay && (
          <div className="text-sm font-medium text-green-700">
            {posting.salaryDisplay}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {posting.viewCount} lượt xem
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {posting.applicationCount} ứng viên
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {formattedDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formattedDate}
              </span>
            )}
            {expiryDate && (
              <span className="text-xs mt-0.5 block">
                HH: {expiryDate}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
