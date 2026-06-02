/**
 * ERP Connection Detail Page
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Settings,
  RefreshCw,
  Trash2,
  Play,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ConnectionStatusBadge, SyncStatusBadge } from '@/components/integration';
import {
  useERPConnection,
  useUpdateERPConnection,
  useDeleteERPConnection,
  useTestERPConnection,
  useTriggerERPSync,
  useERPSyncLogs,
} from '@/hooks/integration/useERP';
import { useToast } from '@/hooks/useToast';
import { formatDate, formatRelativeTime } from '@/lib/utils';

export default function ERPDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', syncSchedule: '' });

  const { data, isLoading, refetch } = useERPConnection(id!);
  const { data: logsData, isLoading: logsLoading } = useERPSyncLogs(id!);
  const updateMutation = useUpdateERPConnection();
  const deleteMutation = useDeleteERPConnection();
  const testMutation = useTestERPConnection();
  const syncMutation = useTriggerERPSync();

  const connection = data;
  const syncLogs = logsData?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!connection) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Connection not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/integration/erp')}>
          Back to ERP Connections
        </Button>
      </div>
    );
  }

  const handleTest = async () => {
    try {
      const response = await testMutation.mutateAsync(id!);
      const result = response.data;
      if (result.success) {
        toast({
          title: 'Connection Successful',
          description: `Response time: ${result.latency}ms`,
        });
      } else {
        toast({
          title: 'Connection Failed',
          description: result.error || 'Unable to connect to ERP',
          variant: 'destructive',
        });
      }
      refetch();
    } catch (error) {
      toast({
        title: 'Test Failed',
        description: 'An error occurred while testing the connection.',
        variant: 'destructive',
      });
    }
  };

  const handleSync = async () => {
    try {
      await syncMutation.mutateAsync({ id: id!, data: { entityType: 'ALL' } });
      toast({
        title: 'Sync Started',
        description: 'ERP sync has been initiated.',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Sync Failed',
        description: 'Failed to start ERP sync.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async () => {
    try {
      await updateMutation.mutateAsync({
        id: id!,
        data: {
          name: editForm.name || connection.name,
          syncSchedule: editForm.syncSchedule || undefined,
        },
      });
      toast({
        title: 'Connection Updated',
        description: 'ERP connection has been updated.',
      });
      setIsEditing(false);
      refetch();
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Failed to update connection.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id!);
      toast({
        title: 'Connection Deleted',
        description: 'ERP connection has been removed.',
      });
      navigate('/integration/erp');
    } catch (error) {
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete connection.',
        variant: 'destructive',
      });
    }
  };

  const startEditing = () => {
    setEditForm({
      name: connection.name,
      syncSchedule: connection.syncSchedule || '',
    });
    setIsEditing(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/integration/erp')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              {connection.name}
              <ConnectionStatusBadge status={connection.status} />
            </h1>
            <p className="text-muted-foreground">{connection.type} Connection</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleTest} disabled={testMutation.isPending}>
            <Play className={`mr-2 h-4 w-4 ${testMutation.isPending ? 'animate-pulse' : ''}`} />
            {testMutation.isPending ? 'Testing...' : 'Test Connection'}
          </Button>
          <Button
            onClick={handleSync}
            disabled={connection.status !== 'ACTIVE' || syncMutation.isPending}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            {syncMutation.isPending ? 'Syncing...' : 'Sync Now'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Connection Details */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Connection Details</CardTitle>
              <CardDescription>Configuration and settings</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={startEditing}>
              <Settings className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium">{connection.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <ConnectionStatusBadge status={connection.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Sync</span>
              <span>{connection.lastSyncAt ? formatRelativeTime(connection.lastSyncAt) : 'Never'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Schedule</span>
              <span>{connection.syncSchedule || 'Manual'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>{formatDate(connection.createdAt)}</span>
            </div>
            <div className="pt-4 border-t">
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Connection
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Last Sync Status */}
        <Card>
          <CardHeader>
            <CardTitle>Last Sync Status</CardTitle>
            <CardDescription>Details from the most recent sync</CardDescription>
          </CardHeader>
          <CardContent>
            {connection.lastSyncStatus ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <SyncStatusBadge status={connection.lastSyncStatus} />
                  <span className="text-sm text-muted-foreground">
                    {connection.lastSyncAt && formatRelativeTime(connection.lastSyncAt)}
                  </span>
                </div>
                {syncLogs.length > 0 && syncLogs[0] && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Records Synced</span>
                      <span className="font-medium">{syncLogs[0].recordsSuccess || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Errors</span>
                      <span className={syncLogs[0].recordsFailed > 0 ? 'text-red-600 font-medium' : ''}>
                        {syncLogs[0].recordsFailed || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span>
                        {syncLogs[0].completedAt && syncLogs[0].startedAt
                          ? `${Math.round((new Date(syncLogs[0].completedAt).getTime() - new Date(syncLogs[0].startedAt).getTime()) / 1000)}s`
                          : '-'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No sync has been run yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sync History */}
      <Card>
        <CardHeader>
          <CardTitle>Sync History</CardTitle>
          <CardDescription>Recent synchronization logs</CardDescription>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : syncLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No sync history available
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Started</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Errors</TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {syncLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{formatRelativeTime(log.startedAt)}</TableCell>
                    <TableCell>
                      <SyncStatusBadge status={log.status} />
                    </TableCell>
                    <TableCell>{log.recordsSuccess || 0}</TableCell>
                    <TableCell className={log.recordsFailed > 0 ? 'text-red-600' : ''}>
                      {log.recordsFailed || 0}
                    </TableCell>
                    <TableCell>
                      {log.completedAt
                        ? `${Math.round((new Date(log.completedAt).getTime() - new Date(log.startedAt).getTime()) / 1000)}s`
                        : 'Running...'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Connection</DialogTitle>
            <DialogDescription>Update connection settings</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Connection Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-schedule">Sync Schedule (Cron)</Label>
              <Input
                id="edit-schedule"
                value={editForm.syncSchedule}
                onChange={(e) => setEditForm({ ...editForm, syncSchedule: e.target.value })}
                placeholder="0 * * * * (hourly)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Connection</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this ERP connection? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
