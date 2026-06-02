'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { COMPENSATION_REVIEW_STATUS } from '@/lib/compensation/constants';
import { formatCurrency, formatPercent } from '@/lib/compensation/utils';
import { CompensationReview } from '@/types/compensation';
import Link from 'next/link';

interface ReviewListProps { reviews: CompensationReview[]; }

export function ReviewList({ reviews }: ReviewListProps) {
  return (
    <div className="space-y-3">
      {reviews.map((review) => {
        const statusConfig = COMPENSATION_REVIEW_STATUS[review.status];
        return (
          <Card key={review.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-sm">{review.employee?.fullName}</p>
                  <p className="text-xs text-muted-foreground">{review.employee?.department?.name}</p>
                </div>
                <Badge variant="outline" className="text-xs">{statusConfig?.label}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-3 text-xs">
                <div><span className="text-muted-foreground">Hiện tại</span><p className="font-medium font-mono">{formatCurrency(review.currentSalary)}</p></div>
                <div><span className="text-muted-foreground">Đề xuất</span><p className="font-medium font-mono">{review.proposedSalary ? formatCurrency(review.proposedSalary) : '-'}</p></div>
                <div><span className="text-muted-foreground">% Thay đổi</span><p className="font-medium font-mono">{review.changePercent ? formatPercent(review.changePercent) : '-'}</p></div>
              </div>
              <div className="flex justify-end mt-3">
                <Link href={`/compensation/reviews/${review.id}`}><Button variant="outline" size="sm">Chi tiết</Button></Link>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
