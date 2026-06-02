/**
 * Integration Stats Components
 */

import { Link, Database, Webhook, Key, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatCard, StatCardGroup } from '@/components/ui/stat-card';

export { StatCard } from '@/components/ui/stat-card';

interface IntegrationSummaryProps {
  erpConnections: number;
  erpActive: number;
  dmsConnections: number;
  dmsActive: number;
  webhookEndpoints: number;
  webhookActive: number;
  apiKeys: number;
  apiKeysActive: number;
}

export function IntegrationSummary({
  erpConnections,
  erpActive,
  dmsConnections,
  dmsActive,
  webhookEndpoints,
  webhookActive,
  apiKeys,
  apiKeysActive,
}: IntegrationSummaryProps) {
  return (
    <StatCardGroup cols={4}>
      <StatCard
        title="ERP Connections"
        value={erpConnections}
        subtitle={`${erpActive} active`}
        icon={Database}
        color={erpActive > 0 ? 'success' : 'default'}
      />
      <StatCard
        title="DMS Connections"
        value={dmsConnections}
        subtitle={`${dmsActive} active`}
        icon={Link}
        color={dmsActive > 0 ? 'success' : 'default'}
      />
      <StatCard
        title="Webhook Endpoints"
        value={webhookEndpoints}
        subtitle={`${webhookActive} active`}
        icon={Webhook}
        color={webhookActive > 0 ? 'success' : 'default'}
      />
      <StatCard
        title="API Keys"
        value={apiKeys}
        subtitle={`${apiKeysActive} active`}
        icon={Key}
        color={apiKeysActive > 0 ? 'success' : 'default'}
      />
    </StatCardGroup>
  );
}

interface ConnectionStatusBadgeProps {
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
}

export function ConnectionStatusBadge({ status }: ConnectionStatusBadgeProps) {
  const config = {
    ACTIVE: { label: 'Active', className: 'bg-emerald-600 text-white dark:bg-emerald-500', icon: CheckCircle },
    INACTIVE: { label: 'Inactive', className: 'bg-slate-500 text-white dark:bg-slate-600', icon: Activity },
    ERROR: { label: 'Error', className: 'bg-red-500 text-white dark:bg-red-600', icon: AlertTriangle },
  };

  const { label, className, icon: Icon } = config[status];

  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', className)}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

interface SyncStatusBadgeProps {
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'COMPLETED_WITH_ERRORS' | 'FAILED';
}

export function SyncStatusBadge({ status }: SyncStatusBadgeProps) {
  const config = {
    PENDING: { label: 'Pending', className: 'bg-slate-500 text-white dark:bg-slate-600' },
    RUNNING: { label: 'Running', className: 'bg-blue-500 text-white dark:bg-blue-600' },
    COMPLETED: { label: 'Completed', className: 'bg-emerald-600 text-white dark:bg-emerald-500' },
    COMPLETED_WITH_ERRORS: { label: 'With Errors', className: 'bg-amber-500 text-white dark:bg-amber-600' },
    FAILED: { label: 'Failed', className: 'bg-red-500 text-white dark:bg-red-600' },
  };

  const { label, className } = config[status];

  return (
    <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', className)}>
      {label}
    </span>
  );
}
