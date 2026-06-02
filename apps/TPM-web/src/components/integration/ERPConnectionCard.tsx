/**
 * ERP Connection Card Component
 */

import { Settings, RefreshCw, Clock } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConnectionStatusBadge, SyncStatusBadge } from './IntegrationStats';
import { formatRelativeTime } from '@/lib/utils';
import type { ERPConnection } from '@/types/integration';

interface ERPConnectionCardProps {
  connection: ERPConnection;
  onSync: () => void;
  onEdit: () => void;
  isSyncing?: boolean;
}

const ERP_LOGOS: Record<string, string> = {
  SAP: '🔷',
  ORACLE: '🔴',
  DYNAMICS: '🔵',
  CUSTOM: '⚙️',
};

export function ERPConnectionCard({
  connection,
  onSync,
  onEdit,
  isSyncing = false,
}: ERPConnectionCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{ERP_LOGOS[connection.type] || '📦'}</div>
            <div>
              <CardTitle className="text-lg">{connection.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{connection.type}</p>
            </div>
          </div>
          <ConnectionStatusBadge status={connection.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last Sync:
            </span>
            <span>
              {connection.lastSyncAt ? formatRelativeTime(connection.lastSyncAt) : 'Never'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Schedule:</span>
            <span>{connection.syncSchedule ? describeCron(connection.syncSchedule) : 'Manual'}</span>
          </div>
          {connection.lastSyncStatus && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status:</span>
              <SyncStatusBadge status={connection.lastSyncStatus} />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onEdit}>
          <Settings className="mr-2 h-4 w-4" />
          Configure
        </Button>
        <Button
          className="flex-1"
          onClick={onSync}
          disabled={connection.status !== 'ACTIVE' || isSyncing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </Button>
      </CardFooter>
    </Card>
  );
}

function describeCron(cron: string): string {
  // Simple cron description
  if (cron === '0 * * * *') return 'Every hour';
  if (cron === '0 0 * * *') return 'Daily at midnight';
  if (cron === '0 */6 * * *') return 'Every 6 hours';
  if (cron === '0 0 * * 0') return 'Weekly on Sunday';
  return cron;
}
