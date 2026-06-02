/**
 * Scenario Status Badge Component
 */

import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface ScenarioStatusBadgeProps {
  status: 'DRAFT' | 'RUNNING' | 'COMPLETED' | 'FAILED' | string;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  DRAFT: { label: 'Draft', variant: 'secondary' },
  RUNNING: { label: 'Running', variant: 'default' },
  COMPLETED: { label: 'Completed', variant: 'default' },
  FAILED: { label: 'Failed', variant: 'destructive' },
};

export function ScenarioStatusBadge({ status }: ScenarioStatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: 'outline' as const };

  return (
    <Badge variant={config.variant} className="gap-1">
      {status === 'RUNNING' && <Loader2 className="h-3 w-3 animate-spin" />}
      {config.label}
    </Badge>
  );
}
