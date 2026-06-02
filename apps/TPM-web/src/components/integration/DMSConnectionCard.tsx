/**
 * DMS Connection Card Component
 */

import { Settings, RefreshCw, Clock, Upload } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConnectionStatusBadge, SyncStatusBadge } from './IntegrationStats';
import { formatRelativeTime } from '@/lib/utils';
import type { DMSConnection } from '@/types/integration';

interface DMSConnectionCardProps {
  connection: DMSConnection;
  onSync: () => void;
  onPush: () => void;
  onEdit: () => void;
  isSyncing?: boolean;
  isPushing?: boolean;
}

const DMS_LOGOS: Record<string, string> = {
  SALESFORCE: '☁️',
  CUSTOM: '⚙️',
};

export function DMSConnectionCard({
  connection,
  onSync,
  onPush,
  onEdit,
  isSyncing = false,
  isPushing = false,
}: DMSConnectionCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{DMS_LOGOS[connection.type] || '📊'}</div>
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
            <span className="text-muted-foreground">Distributor:</span>
            <span>{connection.distributor?.name || '-'}</span>
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
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Settings className="mr-1 h-4 w-4" />
          Configure
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onSync}
          disabled={connection.status !== 'ACTIVE' || isSyncing}
        >
          <RefreshCw className={`mr-1 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync'}
        </Button>
        <Button
          size="sm"
          onClick={onPush}
          disabled={connection.status !== 'ACTIVE' || isPushing}
        >
          <Upload className={`mr-1 h-4 w-4 ${isPushing ? 'animate-pulse' : ''}`} />
          {isPushing ? 'Pushing...' : 'Push'}
        </Button>
      </CardFooter>
    </Card>
  );
}
