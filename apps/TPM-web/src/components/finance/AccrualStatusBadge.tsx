/**
 * Accrual Status Badge Component
 */

import { Badge } from '@/components/ui/badge';
import { AccrualStatus, ACCRUAL_STATUS_LABELS } from '@/types/finance';

interface AccrualStatusBadgeProps {
  status: AccrualStatus;
  className?: string;
}

const statusVariants: Record<AccrualStatus, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  [AccrualStatus.PENDING]: 'warning',
  [AccrualStatus.CALCULATED]: 'secondary',
  [AccrualStatus.POSTED]: 'success',
  [AccrualStatus.REVERSED]: 'destructive',
};

export function AccrualStatusBadge({ status, className }: AccrualStatusBadgeProps) {
  const variant = statusVariants[status] || 'default';
  const label = ACCRUAL_STATUS_LABELS[status] || status;

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}

export default AccrualStatusBadge;
