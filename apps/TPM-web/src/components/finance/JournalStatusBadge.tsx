/**
 * Journal Status Badge Component
 */

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface JournalStatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { label: string; variant: string }> = {
  DRAFT: { label: 'Draft', variant: 'secondary' },
  POSTED: { label: 'Posted', variant: 'success' },
  REVERSED: { label: 'Reversed', variant: 'destructive' },
};

export function JournalStatusBadge({ status, className }: JournalStatusBadgeProps) {
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

export default JournalStatusBadge;
