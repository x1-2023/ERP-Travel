/**
 * Deduction Status Badge Component
 */

import { Badge } from '@/components/ui/badge';
import { DeductionStatus, DEDUCTION_STATUS_LABELS } from '@/types/finance';

interface DeductionStatusBadgeProps {
  status: DeductionStatus;
  className?: string;
}

const statusVariants: Record<DeductionStatus, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  [DeductionStatus.OPEN]: 'warning',
  [DeductionStatus.MATCHED]: 'success',
  [DeductionStatus.DISPUTED]: 'destructive',
  [DeductionStatus.RESOLVED]: 'secondary',
  [DeductionStatus.WRITTEN_OFF]: 'default',
};

export function DeductionStatusBadge({ status, className }: DeductionStatusBadgeProps) {
  const variant = statusVariants[status] || 'default';
  const label = DEDUCTION_STATUS_LABELS[status] || status;

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}

export default DeductionStatusBadge;
