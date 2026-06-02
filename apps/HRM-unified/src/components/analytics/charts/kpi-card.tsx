'use client';

import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: number;
  change?: number;
  changePercent?: number;
  trend?: 'up' | 'down' | 'neutral';
  format?: 'number' | 'currency' | 'percent';
  icon?: LucideIcon;
  className?: string;
}

function formatValue(value: number, format: 'number' | 'currency' | 'percent'): string {
  switch (format) {
    case 'currency':
      if (value >= 1_000_000_000) {
        return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
      }
      if (value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(1)} tr`;
      }
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        notation: 'compact',
      }).format(value);
    case 'percent':
      return `${value.toFixed(1)}%`;
    case 'number':
    default:
      return new Intl.NumberFormat('vi-VN').format(value);
  }
}

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

const trendColors = {
  up: 'text-green-600',
  down: 'text-red-600',
  neutral: 'text-gray-500',
};

export function KPICard({
  title,
  value,
  change,
  changePercent,
  trend = 'neutral',
  format = 'number',
  icon: Icon,
  className,
}: KPICardProps) {
  const TrendIcon = trendIcons[trend];

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{formatValue(value, format)}</p>
            {(change !== undefined || changePercent !== undefined) && (
              <div className={cn('flex items-center gap-1 text-sm', trendColors[trend])}>
                <TrendIcon className="h-4 w-4" />
                <span>
                  {changePercent !== undefined && `${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}%`}
                  {change !== undefined && changePercent !== undefined && ' | '}
                  {change !== undefined && `${change > 0 ? '+' : ''}${formatValue(change, format)}`}
                </span>
              </div>
            )}
          </div>
          {Icon && (
            <div className="rounded-full bg-primary/10 p-3">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
