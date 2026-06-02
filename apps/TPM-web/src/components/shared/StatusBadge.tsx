/**
 * StatusBadge Component - Industrial Design System
 */

import { cn } from '@/lib/utils';

type StatusType =
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'PAID'
  | 'UNPAID'
  | 'INACTIVE'
  | 'DEPLETED'
  | 'OVERDUE'
  | 'AT_RISK'
  | 'ON_TRACK';

interface StatusBadgeProps {
  status: StatusType | string;
  showDot?: boolean;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

const statusConfig: Record<string, {
  label: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
}> = {
  DRAFT: {
    label: 'Draft',
    bg: 'bg-slate-500 dark:bg-slate-600',
    text: 'text-white',
    border: 'border-slate-600 dark:border-slate-700',
    dot: 'bg-white/80'
  },
  PENDING: {
    label: 'Pending',
    bg: 'bg-amber-500 dark:bg-amber-600',
    text: 'text-white',
    border: 'border-amber-600 dark:border-amber-700',
    dot: 'bg-white/80'
  },
  APPROVED: {
    label: 'Approved',
    bg: 'bg-blue-500 dark:bg-blue-600',
    text: 'text-white',
    border: 'border-blue-600 dark:border-blue-700',
    dot: 'bg-white/80'
  },
  ACTIVE: {
    label: 'Active',
    bg: 'bg-emerald-600 dark:bg-emerald-500',
    text: 'text-white',
    border: 'border-emerald-700 dark:border-emerald-600',
    dot: 'bg-white/80'
  },
  COMPLETED: {
    label: 'Completed',
    bg: 'bg-violet-500 dark:bg-violet-600',
    text: 'text-white',
    border: 'border-violet-600 dark:border-violet-700',
    dot: 'bg-white/80'
  },
  CANCELLED: {
    label: 'Cancelled',
    bg: 'bg-red-500 dark:bg-red-600',
    text: 'text-white',
    border: 'border-red-600 dark:border-red-700',
    dot: 'bg-white/80'
  },
  REJECTED: {
    label: 'Rejected',
    bg: 'bg-red-500 dark:bg-red-600',
    text: 'text-white',
    border: 'border-red-600 dark:border-red-700',
    dot: 'bg-white/80'
  },
  PAID: {
    label: 'Paid',
    bg: 'bg-emerald-600 dark:bg-emerald-500',
    text: 'text-white',
    border: 'border-emerald-700 dark:border-emerald-600',
    dot: 'bg-white/80'
  },
  UNPAID: {
    label: 'Unpaid',
    bg: 'bg-amber-500 dark:bg-amber-600',
    text: 'text-white',
    border: 'border-amber-600 dark:border-amber-700',
    dot: 'bg-white/80'
  },
  INACTIVE: {
    label: 'Inactive',
    bg: 'bg-slate-500 dark:bg-slate-600',
    text: 'text-white',
    border: 'border-slate-600 dark:border-slate-700',
    dot: 'bg-white/80'
  },
  DEPLETED: {
    label: 'Depleted',
    bg: 'bg-red-500 dark:bg-red-600',
    text: 'text-white',
    border: 'border-red-600 dark:border-red-700',
    dot: 'bg-white/80'
  },
  OVERDUE: {
    label: 'Overdue',
    bg: 'bg-red-500 dark:bg-red-600',
    text: 'text-white',
    border: 'border-red-600 dark:border-red-700',
    dot: 'bg-white/80 animate-status-blink'
  },
  AT_RISK: {
    label: 'At Risk',
    bg: 'bg-amber-500 dark:bg-amber-600',
    text: 'text-white',
    border: 'border-amber-600 dark:border-amber-700',
    dot: 'bg-white/80 animate-pulse-subtle'
  },
  ON_TRACK: {
    label: 'On Track',
    bg: 'bg-emerald-600 dark:bg-emerald-500',
    text: 'text-white',
    border: 'border-emerald-700 dark:border-emerald-600',
    dot: 'bg-white/80'
  },
};

const sizeClasses = {
  sm: 'px-1.5 py-0 text-2xs',
  default: 'px-2 py-0.5 text-2xs',
  lg: 'px-2.5 py-1 text-xs',
};

export function StatusBadge({
  status,
  showDot = true,
  size = 'default',
  className
}: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    bg: 'bg-surface-hover',
    text: 'text-foreground-muted',
    border: 'border-surface-border',
    dot: 'bg-foreground-subtle'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded border font-semibold uppercase tracking-wide',
        config.bg,
        config.text,
        config.border,
        sizeClasses[size],
        className
      )}
    >
      {showDot && (
        <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      )}
      {config.label}
    </span>
  );
}
