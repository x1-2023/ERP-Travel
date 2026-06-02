'use client'

import { MessageSquare, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { StarRating } from '../ratings/star-rating'
import { FEEDBACK_TYPE } from '@/lib/performance/constants'
import type { FeedbackData } from '@/types/performance'

interface FeedbackCardProps {
  feedback: FeedbackData
}

export function FeedbackCard({ feedback }: FeedbackCardProps) {
  const typeInfo = FEEDBACK_TYPE[feedback.feedbackType as keyof typeof FEEDBACK_TYPE]

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="text-[10px]">
              {typeInfo?.label || feedback.feedbackType}
            </Badge>
          </div>
          <span className="text-[10px] font-data text-muted-foreground">
            {new Date(feedback.createdAt).toLocaleDateString('vi-VN')}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        {/* Rating */}
        {feedback.overallRating && (
          <div className="flex items-center gap-2">
            <StarRating value={feedback.overallRating} readonly size="sm" />
            <span className="font-data text-xs text-muted-foreground">
              {feedback.overallRating}/5
            </span>
          </div>
        )}

        {/* Strengths */}
        {feedback.strengths && (
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Điểm mạnh
            </span>
            <p className="text-sm mt-0.5">{feedback.strengths}</p>
          </div>
        )}

        {/* Areas for improvement */}
        {feedback.areasForImprovement && (
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Cần cải thiện
            </span>
            <p className="text-sm mt-0.5">{feedback.areasForImprovement}</p>
          </div>
        )}

        {/* Comments */}
        {feedback.comments && (
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Nhận xét
            </span>
            <p className="text-sm mt-0.5">{feedback.comments}</p>
          </div>
        )}

        <Separator />

        {/* Provider */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <User className="h-3 w-3" />
          <span>
            {feedback.isAnonymous
              ? 'Ẩn danh'
              : feedback.provider?.name || 'Không xác định'}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
