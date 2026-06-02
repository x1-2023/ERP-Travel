/**
 * DMS Connections List Page
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { DMSConnectionCard } from '@/components/integration';
import { useDMSConnections, useCreateDMSConnection, useTriggerDMSSync, usePushToDMS } from '@/hooks/integration/useDMS';
import { useToast } from '@/hooks/useToast';
import { DMS_TYPES } from '@/types/integration';
import type { DMSType } from '@/types/integration';

export default function DMSList() {
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [pushingId, setPushingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'MISA' as DMSType,
    distributorId: '',
    apiUrl: '',
    apiKey: '',
  });

  const { toast } = useToast();
  const { data, isLoading, refetch } = useDMSConnections();
  const createMutation = useCreateDMSConnection();
  const syncMutation = useTriggerDMSSync();
  const pushMutation = usePushToDMS();

  const connections = data?.data || [];

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync({
        name: formData.name,
        type: formData.type,
        distributorId: formData.distributorId,
        config: {
          baseUrl: formData.apiUrl,
          apiKey: formData.apiKey,
        },
      });
      toast({
        title: 'Connection Created',
        description: 'DMS connection has been created successfully.',
      });
      setShowNewDialog(false);
      setFormData({
        name: '',
        type: 'MISA',
        distributorId: '',
        apiUrl: '',
        apiKey: '',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create DMS connection.',
        variant: 'destructive',
      });
    }
  };

  const handleSync = async (connectionId: string) => {
    setSyncingId(connectionId);
    try {
      await syncMutation.mutateAsync({ id: connectionId, data: { dataType: 'ALL' } });
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
    } finally {
      setSyncingId(null);
    }
  };

  const handlePush = async (connectionId: string) => {
    setPushingId(connectionId);
    try {
      await pushMutation.mutateAsync({ id: connectionId, data: { dataType: 'PROMOTIONS' } });
      toast({
        title: 'Push Started',
        description: 'Data push to DMS has been initiated.',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Push Failed',
        description: 'Failed to push data to DMS.',
        variant: 'destructive',
      });
    } finally {
      setPushingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">DMS Connections</h1>
          <p className="text-muted-foreground">
            Manage connections to Distributor Management Systems
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setShowNewDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Connection
          </Button>
        </div>
      </div>

      {/* Connections Grid */}
      {connections.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <LinkIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No DMS Connections</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first DMS connection
              </p>
              <Button onClick={() => setShowNewDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Connection
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {connections.map((connection) => (
            <Link key={connection.id} to={`/integration/dms/${connection.id}`}>
              <DMSConnectionCard
                connection={connection}
                onSync={() => handleSync(connection.id)}
                onPush={() => handlePush(connection.id)}
                onEdit={() => {}}
                isSyncing={syncingId === connection.id}
                isPushing={pushingId === connection.id}
              />
            </Link>
          ))}
        </div>
      )}

      {/* New Connection Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add DMS Connection</DialogTitle>
            <DialogDescription>
              Configure a new connection to your DMS
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Connection Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Distributor A"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">DMS Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: DMSType) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DMS_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="distributorId">Distributor ID</Label>
              <Input
                id="distributorId"
                value={formData.distributorId}
                onChange={(e) => setFormData({ ...formData, distributorId: e.target.value })}
                placeholder="Enter distributor ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiUrl">API URL</Label>
              <Input
                id="apiUrl"
                value={formData.apiUrl}
                onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
                placeholder="https://api.distributor.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formData.name || !formData.apiUrl || createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Connection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
