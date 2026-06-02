'use client';

import { useCompensationReviews } from '@/hooks/use-compensation';
import { ReviewList } from '@/components/compensation/reviews/review-list';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

export default function ReviewsPage() {
  const [status, setStatus] = useState<string>('');
  const { data, isLoading } = useCompensationReviews(undefined, status || undefined);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Xét duyệt lương</h1>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Lọc trạng thái" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="DRAFT">Bản nháp</SelectItem>
            <SelectItem value="PENDING_MANAGER">Chờ quản lý</SelectItem>
            <SelectItem value="PENDING_HR">Chờ HR</SelectItem>
            <SelectItem value="APPROVED">Đã duyệt</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isLoading ? <p className="text-muted-foreground">Đang tải...</p> : data?.data && <ReviewList reviews={data.data} />}
    </div>
  );
}
