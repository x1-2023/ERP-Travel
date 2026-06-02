/**
 * Promotion Status Badge Component
 */

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { PromotionStatus } from '@/types';

interface PromotionStatusBadgeProps {
  status: PromotionStatus;
  className?: string;
}

const statusConfig: Record<PromotionStatus, { label: string; className: string }> = {
  DRAFT: {
    label: 'Draft',
    className: 'bg-slate-500 text-white border border-slate-600 dark:bg-slate-600 dark:border-slate-700',
  },
  PENDING_APPROVAL: {
    label: 'Pending Approval',
    className: 'bg-amber-500 text-white border border-amber-600 dark:bg-amber-600 dark:border-amber-700',
  },
  APPROVED: {
    label: 'Approved',
    className: 'bg-blue-500 text-white border border-blue-600 dark:bg-blue-600 dark:border-blue-700',
  },
  ACTIVE: {
    label: 'Active',
    className: 'bg-emerald-600 text-white border border-emerald-700 dark:bg-emerald-500 dark:border-emerald-600',
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-violet-500 text-white border border-violet-600 dark:bg-violet-600 dark:border-violet-700',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-red-500 text-white border border-red-600 dark:bg-red-600 dark:border-red-700',
  },
  REJECTED: {
    label: 'Rejected',
    className: 'bg-red-500 text-white border border-red-600 dark:bg-red-600 dark:border-red-700',
  },
};

export function PromotionStatusBadge({ status, className }: PromotionStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.DRAFT;

  return (
    <Badge className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
