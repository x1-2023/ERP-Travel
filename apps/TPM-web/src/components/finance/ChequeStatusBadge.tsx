/**
 * Cheque Status Badge Component
 */

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ChequeStatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { label: string; variant: string }> = {
  PENDING: { label: 'Pending', variant: 'secondary' },
  ISSUED: { label: 'Issued', variant: 'default' },
  CLEARED: { label: 'Cleared', variant: 'success' },
  VOIDED: { label: 'Voided', variant: 'destructive' },
  STALE: { label: 'Stale', variant: 'outline' },
};

export function ChequeStatusBadge({ status, className }: ChequeStatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: 'default' };

  return (
    <Badge
      variant={config.variant as any}
      className={cn(className)}
    >
      {config.label}
    </Badge>
  );
}

export default ChequeStatusBadge;
