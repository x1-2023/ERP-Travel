'use client';

import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { WidgetContainer } from './widget-container';
import { cn } from '@/lib/utils';

interface LaborCostData {
  totalCost: number;
  previousCost: number;
  change: number;
  breakdown: {
    salary: number;
    bonus: number;
    insurance: number;
    other: number;
  };
}

interface LaborCostWidgetProps {
  id?: string;
  onRemove?: (id: string) => void;
  isDragging?: boolean;
  className?: string;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(0)} tr`;
  }
  return value.toLocaleString('vi-VN');
}

export function LaborCostWidget({
  id = 'labor-cost',
  onRemove,
  isDragging,
  className,
}: LaborCostWidgetProps) {
  const [data, setData] = useState<LaborCostData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/analytics/labor-cost');
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Failed to fetch labor cost data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <WidgetContainer
      id={id}
      title="Chi phí nhân sự"
      onRemove={onRemove}
      isDragging={isDragging}
      className={className}
    >
      {loading ? (
        <div className="space-y-3">
          <div className="h-8 w-24 animate-pulse rounded bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ) : data ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-2">
              <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(data.totalCost)}</p>
              <div className={cn(
                'flex items-center gap-1 text-xs',
                data.change < 0 ? 'text-green-600' : data.change > 0 ? 'text-red-600' : 'text-muted-foreground'
              )}>
                {data.change > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{Math.abs(data.change).toFixed(1)}% so với tháng trước</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Lương cơ bản</span>
              <span className="font-medium">{formatCurrency(data.breakdown.salary)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Thưởng</span>
              <span className="font-medium">{formatCurrency(data.breakdown.bonus)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Bảo hiểm</span>
              <span className="font-medium">{formatCurrency(data.breakdown.insurance)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Khác</span>
              <span className="font-medium">{formatCurrency(data.breakdown.other)}</span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Không có dữ liệu</p>
      )}
    </WidgetContainer>
  );
}
