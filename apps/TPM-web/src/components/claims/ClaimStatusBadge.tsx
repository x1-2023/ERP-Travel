/**
 * Claim Status Badge Component (Phase 6 Enhanced)
 */

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ClaimStatus } from '@/types';

interface ClaimStatusBadgeProps {
  status: ClaimStatus;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  DRAFT: {
    label: 'Nháp',
    className: 'bg-slate-500 text-white border border-slate-600 dark:bg-slate-600 dark:border-slate-700',
  },
  SUBMITTED: {
    label: 'Đã gửi',
    className: 'bg-blue-500 text-white border border-blue-600 dark:bg-blue-600 dark:border-blue-700',
  },
  VALIDATING: {
    label: 'Đang xác thực',
    className: 'bg-cyan-500 text-white border border-cyan-600 dark:bg-cyan-600 dark:border-cyan-700',
  },
  VALIDATION_FAILED: {
    label: 'Lỗi xác thực',
    className: 'bg-orange-500 text-white border border-orange-600 dark:bg-orange-600 dark:border-orange-700',
  },
  PENDING_MATCH: {
    label: 'Chờ đối soát',
    className: 'bg-indigo-500 text-white border border-indigo-600 dark:bg-indigo-600 dark:border-indigo-700',
  },
  MATCHED: {
    label: 'Đã đối soát',
    className: 'bg-teal-500 text-white border border-teal-600 dark:bg-teal-600 dark:border-teal-700',
  },
  UNDER_REVIEW: {
    label: 'Đang xem xét',
    className: 'bg-amber-500 text-white border border-amber-600 dark:bg-amber-600 dark:border-amber-700',
  },
  APPROVED: {
    label: 'Đã duyệt',
    className: 'bg-emerald-600 text-white border border-emerald-700 dark:bg-emerald-500 dark:border-emerald-600',
  },
  PARTIALLY_APPROVED: {
    label: 'Duyệt 1 phần',
    className: 'bg-lime-600 text-white border border-lime-700 dark:bg-lime-500 dark:border-lime-600',
  },
  REJECTED: {
    label: 'Từ chối',
    className: 'bg-red-500 text-white border border-red-600 dark:bg-red-600 dark:border-red-700',
  },
  SETTLED: {
    label: 'Đã thanh toán',
    className: 'bg-violet-500 text-white border border-violet-600 dark:bg-violet-600 dark:border-violet-700',
  },
  PARTIALLY_SETTLED: {
    label: 'TT 1 phần',
    className: 'bg-purple-500 text-white border border-purple-600 dark:bg-purple-600 dark:border-purple-700',
  },
  CANCELLED: {
    label: 'Đã hủy',
    className: 'bg-slate-500 text-white border border-slate-600 dark:bg-slate-600 dark:border-slate-700',
  },
  // Backward compat
  PENDING: {
    label: 'Chờ xử lý',
    className: 'bg-yellow-500 text-white border border-yellow-600 dark:bg-yellow-600 dark:border-yellow-700',
  },
  DISPUTED: {
    label: 'Tranh chấp',
    className: 'bg-orange-500 text-white border border-orange-600 dark:bg-orange-600 dark:border-orange-700',
  },
  PAID: {
    label: 'Đã trả',
    className: 'bg-violet-500 text-white border border-violet-600 dark:bg-violet-600 dark:border-violet-700',
  },
};

export function ClaimStatusBadge({ status, className }: ClaimStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.DRAFT;

  return (
    <Badge className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
