/**
 * Clash Status Badge Component
 */

import { Badge } from '@/components/ui/badge';

interface ClashStatusBadgeProps {
  status: 'DETECTED' | 'REVIEWING' | 'RESOLVED' | 'DISMISSED' | string;
}

const statusConfig: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  DETECTED: { label: 'Detected', variant: 'destructive' },
  REVIEWING: { label: 'Reviewing', variant: 'default' },
  RESOLVED: { label: 'Resolved', variant: 'secondary' },
  DISMISSED: { label: 'Dismissed', variant: 'outline' },
};

export function ClashStatusBadge({ status }: ClashStatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    variant: 'outline' as const,
  };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

interface ClashSeverityBadgeProps {
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | string;
}

const severityConfig: Record<
  string,
  { label: string; className: string }
> = {
  HIGH: { label: 'High', className: 'bg-red-500 text-white border-red-600 dark:bg-red-600 dark:border-red-700' },
  MEDIUM: { label: 'Medium', className: 'bg-amber-500 text-white border-amber-600 dark:bg-amber-600 dark:border-amber-700' },
  LOW: { label: 'Low', className: 'bg-blue-500 text-white border-blue-600 dark:bg-blue-600 dark:border-blue-700' },
};

export function ClashSeverityBadge({ severity }: ClashSeverityBadgeProps) {
  const config = severityConfig[severity] || {
    label: severity,
    className: 'bg-surface-hover text-foreground-muted',
  };

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
