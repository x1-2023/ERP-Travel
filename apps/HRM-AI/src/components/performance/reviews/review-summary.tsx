'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { RatingBadge } from '../ratings/rating-badge'
import { ReviewStatusBadge } from './review-status-badge'
import type { PerformanceReview } from '@/types/performance'

interface ReviewSummaryProps {
  review: PerformanceReview
}

function ScoreRow({ label, score }: { label: string; score?: number }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-data text-sm">
        {score != null ? score.toFixed(2) : '-'}
      </span>
    </div>
  )
}

export function ReviewSummary({ review }: ReviewSummaryProps) {
  const finalRating = review.finalRating || review.calibratedRating || review.managerRating

  return (
    <Card>
      <CardHeader className="p-4 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Tổng kết đánh giá</CardTitle>
          <ReviewStatusBadge status={review.status} />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        {/* Overall Score */}
        <div className="flex items-center justify-between p-3 rounded-sm bg-muted/50">
          <span className="text-sm font-medium">Điểm tổng</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-data font-bold">
              {review.overallScore != null ? review.overallScore.toFixed(2) : '-'}
            </span>
            {finalRating && <RatingBadge rating={finalRating} size="sm" />}
          </div>
        </div>

        {/* Section Scores */}
        <div className="space-y-0">
          <ScoreRow label="Mục tiêu (Goals)" score={review.goalScore} />
          <ScoreRow label="Năng lực (Competency)" score={review.competencyScore} />
          <ScoreRow label="Giá trị cốt lõi (Values)" score={review.valuesScore} />
          <ScoreRow label="Phản hồi (Feedback)" score={review.feedbackScore} />
        </div>

        <Separator />

        {/* Ratings comparison */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Tự đánh giá</span>
            {review.selfRating ? (
              <RatingBadge rating={review.selfRating} size="sm" />
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Quản lý đánh giá</span>
            {review.managerRating ? (
              <RatingBadge rating={review.managerRating} size="sm" />
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
          {review.calibratedRating && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Sau điều chỉnh</span>
              <RatingBadge rating={review.calibratedRating} size="sm" />
            </div>
          )}
        </div>

        {/* Comments */}
        {(review.managerComments || review.selfComments) && (
          <>
            <Separator />
            <div className="space-y-2">
              {review.selfComments && (
                <div>
                  <span className="text-xs text-muted-foreground">Nhận xét nhân viên:</span>
                  <p className="text-sm mt-0.5">{review.selfComments}</p>
                </div>
              )}
              {review.managerComments && (
                <div>
                  <span className="text-xs text-muted-foreground">Nhận xét quản lý:</span>
                  <p className="text-sm mt-0.5">{review.managerComments}</p>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
