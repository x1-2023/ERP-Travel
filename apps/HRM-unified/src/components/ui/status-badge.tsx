'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  MinusCircle,
  Loader2,
} from 'lucide-react';

type StatusType = 'success' | 'error' | 'warning' | 'info' | 'pending' | 'neutral';

interface StatusBadgeProps {
  status: StatusType;
  label: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  className?: string;
}

const statusConfig: Record<StatusType, {
  icon: React.ElementType;
  className: string;
}> = {
  success: {
    icon: CheckCircle2,
    className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  },
  error: {
    icon: XCircle,
    className: 'bg-red-500/10 text-red-500 border-red-500/20',
  },
  warning: {
    icon: AlertCircle,
    className: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  info: {
    icon: AlertCircle,
    className: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  },
  pending: {
    icon: Clock,
    className: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  neutral: {
    icon: MinusCircle,
    className: 'bg-muted text-muted-foreground border-border',
  },
};

const sizeConfig = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-xs px-2 py-0.5',
  lg: 'text-sm px-2.5 py-1',
};

const iconSizeConfig = {
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
  lg: 'w-4 h-4',
};

export function StatusBadge({
  status,
  label,
  showIcon = true,
  size = 'md',
  pulse = false,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = pulse && status === 'pending' ? Loader2 : config.icon;

  return (
    <span className={cn(
      'inline-flex items-center gap-1 font-medium rounded border',
      config.className,
      sizeConfig[size],
      className,
    )}>
      {showIcon && (
        <Icon className={cn(
          iconSizeConfig[size],
          pulse && status === 'pending' && 'animate-spin',
        )} />
      )}
      {label}
    </span>
  );
}
