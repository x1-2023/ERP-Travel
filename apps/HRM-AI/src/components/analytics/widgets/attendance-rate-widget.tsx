'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { WidgetContainer } from './widget-container';
import { cn } from '@/lib/utils';

interface AttendanceData {
  rate: number;
  present: number;
  absent: number;
  late: number;
  onLeave: number;
}

interface AttendanceRateWidgetProps {
  id?: string;
  onRemove?: (id: string) => void;
  isDragging?: boolean;
  className?: string;
}

export function AttendanceRateWidget({
  id = 'attendance-rate',
  onRemove,
  isDragging,
  className,
}: AttendanceRateWidgetProps) {
  const [data, setData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/analytics/attendance-rate');
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Failed to fetch attendance data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <WidgetContainer
      id={id}
      title="Tỷ lệ chuyên cần"
      onRemove={onRemove}
      isDragging={isDragging}
      className={className}
    >
      {loading ? (
        <div className="space-y-3">
          <div className="h-8 w-20 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
        </div>
      ) : data ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 dark:bg-green-900 p-2">
              <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.rate.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">Hôm nay</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={cn(
                'h-2 rounded-full transition-all',
                data.rate >= 90 ? 'bg-green-500' : data.rate >= 75 ? 'bg-yellow-500' : 'bg-red-500'
              )}
              style={{ width: `${data.rate}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Có mặt</span>
              <span className="font-medium text-green-600">{data.present}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Vắng</span>
              <span className="font-medium text-red-600">{data.absent}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Đi trễ</span>
              <span className="font-medium text-orange-600">{data.late}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Nghỉ phép</span>
              <span className="font-medium text-blue-600">{data.onLeave}</span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Không có dữ liệu</p>
      )}
    </WidgetContainer>
  );
}
