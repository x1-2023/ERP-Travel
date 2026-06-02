'use client';

import { useEffect, useState } from 'react';
import { UserMinus, TrendingUp, TrendingDown } from 'lucide-react';
import { WidgetContainer } from './widget-container';
import { cn } from '@/lib/utils';

interface TurnoverData {
  rate: number;
  previousRate: number;
  trend: 'up' | 'down' | 'neutral';
  resigned: number;
  hired: number;
}

interface TurnoverWidgetProps {
  id?: string;
  onRemove?: (id: string) => void;
  isDragging?: boolean;
  className?: string;
}

export function TurnoverWidget({
  id = 'turnover',
  onRemove,
  isDragging,
  className,
}: TurnoverWidgetProps) {
  const [data, setData] = useState<TurnoverData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/analytics/turnover');
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Failed to fetch turnover data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <WidgetContainer
      id={id}
      title="Tỷ lệ nghỉ việc"
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
            <div className="rounded-full bg-red-100 dark:bg-red-900 p-2">
              <UserMinus className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.rate.toFixed(1)}%</p>
              <div className={cn(
                'flex items-center gap-1 text-xs',
                data.trend === 'down' ? 'text-green-600' : data.trend === 'up' ? 'text-red-600' : 'text-muted-foreground'
              )}>
                {data.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>
                  {Math.abs(data.rate - data.previousRate).toFixed(1)}% so với tháng trước
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-md bg-red-50 dark:bg-red-950 p-2 text-center">
              <p className="text-lg font-semibold text-red-600">{data.resigned}</p>
              <p className="text-xs text-muted-foreground">Nghỉ việc</p>
            </div>
            <div className="rounded-md bg-green-50 dark:bg-green-950 p-2 text-center">
              <p className="text-lg font-semibold text-green-600">{data.hired}</p>
              <p className="text-xs text-muted-foreground">Tuyển mới</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Không có dữ liệu</p>
      )}
    </WidgetContainer>
  );
}
