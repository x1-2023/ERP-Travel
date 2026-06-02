'use client';

import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { WidgetContainer } from './widget-container';
import { cn } from '@/lib/utils';

interface HeadcountData {
  total: number;
  active: number;
  probation: number;
  partTime: number;
  change: number;
}

interface HeadcountWidgetProps {
  id?: string;
  onRemove?: (id: string) => void;
  isDragging?: boolean;
  className?: string;
}

export function HeadcountWidget({
  id = 'headcount',
  onRemove,
  isDragging,
  className,
}: HeadcountWidgetProps) {
  const [data, setData] = useState<HeadcountData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/analytics/headcount');
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Failed to fetch headcount data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <WidgetContainer
      id={id}
      title="Tổng nhân sự"
      onRemove={onRemove}
      isDragging={isDragging}
      className={className}
    >
      {loading ? (
        <div className="space-y-3">
          <div className="h-8 w-20 animate-pulse rounded bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ) : data ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-2">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.total.toLocaleString('vi-VN')}</p>
              <p className={cn(
                'text-xs',
                data.change > 0 ? 'text-green-600' : data.change < 0 ? 'text-red-600' : 'text-muted-foreground'
              )}>
                {data.change > 0 ? '+' : ''}{data.change} so với tháng trước
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Chính thức</span>
              <span className="font-medium">{data.active.toLocaleString('vi-VN')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Thử việc</span>
              <span className="font-medium">{data.probation.toLocaleString('vi-VN')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Bán thời gian</span>
              <span className="font-medium">{data.partTime.toLocaleString('vi-VN')}</span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Không có dữ liệu</p>
      )}
    </WidgetContainer>
  );
}
