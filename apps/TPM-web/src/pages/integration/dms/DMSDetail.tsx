/**
 * DMS Connection Detail Page
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Settings,
  RefreshCw,
  Trash2,
  Upload,
  Clock,
  TrendingDown,
  Package,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ConnectionStatusBadge, SyncStatusBadge } from '@/components/integration';
import {
  useDMSConnection,
  useUpdateDMSConnection,
  useDeleteDMSConnection,
  useTriggerDMSSync,
  usePushToDMS,
} from '@/hooks/integration/useDMS';
import { useToast } from '@/hooks/useToast';
import { formatDate, formatRelativeTime } from '@/lib/utils';

export default function DMSDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPushDialog, setShowPushDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '' });
  const [pushType, setPushType] = useState<'PROMOTIONS' | 'PRODUCTS'>('PROMOTIONS');

  const { data, isLoading, refetch } = useDMSConnection(id!);
  const updateMutation = useUpdateDMSConnection();
  const deleteMutation = useDeleteDMSConnection();
  const syncMutation = useTriggerDMSSync();
  const pushMutation = usePushToDMS();

  const connection = data;

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
        <Button variant="outline" className="mt-4" onClick={() => navigate('/integration/dms')}>
          Back to DMS Connections
        </Button>
      </div>
    );
  }

  const handleSync = async () => {
    try {
      await syncMutation.mutateAsync({ id: id!, data: { dataType: 'ALL' } });
      toast({
        title: 'Sync Started',
        description: 'DMS sync has been initiated.',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Sync Failed',
        description: 'Failed to start DMS sync.',
        variant: 'destructive',
      });
    }
  };

  const handlePush = async () => {
    try {
      await pushMutation.mutateAsync({ id: id!, data: { dataType: pushType } });
      toast({
        title: 'Push Started',
        description: `${pushType} data push has been initiated.`,
      });
      setShowPushDialog(false);
      refetch();
    } catch (error) {
      toast({
        title: 'Push Failed',
        description: 'Failed to push data to DMS.',
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
        },
      });
      toast({
        title: 'Connection Updated',
        description: 'DMS connection has been updated.',
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
        description: 'DMS connection has been removed.',
      });
      navigate('/integration/dms');
    } catch (error) {
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete connection.',
        variant: 'destructive',
      });
    }
  };

  const startEditing = () => {
    setEditForm({ name: connection.name });
    setIsEditing(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/integration/dms')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              {connection.name}
              <ConnectionStatusBadge status={connection.status} />
            </h1>
            <p className="text-muted-foreground">
              {connection.type} - {connection.distributor?.name || 'Unknown Distributor'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSync}
            disabled={connection.status !== 'ACTIVE' || syncMutation.isPending}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            {syncMutation.isPending ? 'Syncing...' : 'Sync Data'}
          </Button>
          <Button
            onClick={() => setShowPushDialog(true)}
            disabled={connection.status !== 'ACTIVE'}
          >
            <Upload className="mr-2 h-4 w-4" />
            Push Data
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
              <span className="text-muted-foreground">Distributor</span>
              <span className="font-medium">{connection.distributor?.name || '-'}</span>
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

        {/* Sync Status */}
        <Card>
          <CardHeader>
            <CardTitle>Sync Status</CardTitle>
            <CardDescription>Last synchronization details</CardDescription>
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

      {/* Data Types */}
      <Card>
        <CardHeader>
          <CardTitle>Data Synchronization</CardTitle>
          <CardDescription>Types of data synced with this DMS</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <TrendingDown className="h-8 w-8 text-blue-600" />
              <div>
                <h4 className="font-medium">Sell-Out Data</h4>
                <p className="text-sm text-muted-foreground">
                  Customer sales data from distributor
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Package className="h-8 w-8 text-green-600" />
              <div>
                <h4 className="font-medium">Stock Data</h4>
                <p className="text-sm text-muted-foreground">
                  Inventory levels at distributor
                </p>
              </div>
            </div>
          </div>
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

      {/* Push Dialog */}
      <Dialog open={showPushDialog} onOpenChange={setShowPushDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Push Data to DMS</DialogTitle>
            <DialogDescription>Select what data to push to the distributor</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Data Type</Label>
              <Select value={pushType} onValueChange={(v: 'PROMOTIONS' | 'PRODUCTS') => setPushType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROMOTIONS">Promotions</SelectItem>
                  <SelectItem value="PRODUCTS">Products</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPushDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePush} disabled={pushMutation.isPending}>
              {pushMutation.isPending ? 'Pushing...' : 'Push Data'}
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
              Are you sure you want to delete this DMS connection? This action cannot be undone.
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
