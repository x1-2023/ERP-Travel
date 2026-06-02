'use client';
import { formatCurrency } from '@/lib/compensation/utils';

interface SalaryRangeBarProps { min: number; mid: number; max: number; current?: number; }

export function SalaryRangeBar({ min, mid, max, current }: SalaryRangeBarProps) {
  const range = max - min;
  const midPos = range > 0 ? ((mid - min) / range) * 100 : 50;
  const currentPos = current && range > 0 ? Math.min(100, Math.max(0, ((current - min) / range) * 100)) : null;
  return (
    <div className="space-y-1">
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-200 via-green-200 to-blue-200 dark:from-blue-900 dark:via-green-900 dark:to-blue-900 rounded-full w-full" />
        <div className="absolute top-0 bottom-0 w-0.5 bg-foreground/50" style={{ left: `${midPos}%` }} />
        {currentPos !== null && (
          <div className="absolute top-0.5 w-2 h-2 rounded-full bg-primary border-2 border-background" style={{ left: `${currentPos}%` }} />
        )}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatCurrency(min)}</span>
        <span>{formatCurrency(mid)}</span>
        <span>{formatCurrency(max)}</span>
      </div>
    </div>
  );
}
