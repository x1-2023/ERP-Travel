'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
  valueClassName?: string;
  loading?: boolean;
  style?: React.CSSProperties;
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  trend,
  className,
  valueClassName,
  loading = false,
  style,
}: MetricCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground';

  if (loading) {
    return (
      <div className={cn('card-terminal p-4', className)}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/3" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('card-terminal p-4 group hover-lift', className)} style={style}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={cn(
            'text-2xl font-semibold font-mono tabular-nums tracking-tight',
            'transition-colors duration-200',
            'group-hover:text-primary',
            valueClassName
          )}>
            {value}
          </p>
        </div>
        {icon && (
          <div className="p-2 rounded-lg bg-primary/10 text-primary transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
            {icon}
          </div>
        )}
      </div>

      {(change !== undefined || changeLabel) && (
        <div className="mt-3 flex items-center gap-1.5">
          {change !== undefined && (
            <>
              <TrendIcon className={cn('w-3.5 h-3.5', trendColor)} />
              <span className={cn('text-xs font-mono font-medium', trendColor)}>
                {change > 0 ? '+' : ''}{change}%
              </span>
            </>
          )}
          {changeLabel && (
            <span className="text-xs text-muted-foreground">
              {changeLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
