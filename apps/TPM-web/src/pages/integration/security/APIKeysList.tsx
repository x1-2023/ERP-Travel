/**
 * API Keys List Page
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Key, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { APIKeyCard, NewAPIKeyDisplay } from '@/components/integration/APIKeyCard';
import { useAPIKeys, useCreateAPIKey, useRevokeAPIKey } from '@/hooks/integration/useSecurity';
import { useToast } from '@/hooks/useToast';
import { API_PERMISSIONS } from '@/types/integration';
import type { APIPermission } from '@/types/integration';

export default function APIKeysList() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    permissions: [] as APIPermission[],
    expiresInDays: 90,
  });

  const { data, isLoading, refetch } = useAPIKeys();
  const createMutation = useCreateAPIKey();
  const revokeMutation = useRevokeAPIKey();

  const apiKeys = data?.data || [];

  const handleCreate = async () => {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + formData.expiresInDays);

      const result = await createMutation.mutateAsync({
        name: formData.name,
        permissions: formData.permissions,
        expiresAt: expiresAt.toISOString(),
      });

      if (result.data?.key) {
        setNewKeyValue(result.data.key);
      }

      toast({
        title: 'API Key Created',
        description: 'Make sure to copy your key now.',
      });

      setFormData({
        name: '',
        permissions: [],
        expiresInDays: 90,
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create API key.',
        variant: 'destructive',
      });
    }
  };

  const handleRevoke = async (keyId: string) => {
    setRevokingId(keyId);
    try {
      await revokeMutation.mutateAsync(keyId);
      toast({
        title: 'Key Revoked',
        description: 'API key has been revoked.',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to revoke API key.',
        variant: 'destructive',
      });
    } finally {
      setRevokingId(null);
    }
  };

  const togglePermission = (permission: APIPermission) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const copyKey = () => {
    if (newKeyValue) {
      navigator.clipboard.writeText(newKeyValue);
      toast({
        title: 'Copied',
        description: 'API key copied to clipboard.',
      });
    }
  };

  const closeNewDialog = () => {
    setShowNewDialog(false);
    setNewKeyValue(null);
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
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/integration/security')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">API Keys</h1>
            <p className="text-muted-foreground">
              Manage API keys for external access
            </p>
          </div>
        </div>
        <Button onClick={() => setShowNewDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Key
        </Button>
      </div>

      {/* Keys Grid */}
      {apiKeys.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No API Keys</h3>
              <p className="text-muted-foreground mb-4">
                Create an API key to enable external access
              </p>
              <Button onClick={() => setShowNewDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Key
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {apiKeys.map((apiKey) => (
            <APIKeyCard
              key={apiKey.id}
              apiKey={apiKey}
              onRevoke={() => handleRevoke(apiKey.id)}
              isRevoking={revokingId === apiKey.id}
            />
          ))}
        </div>
      )}

      {/* New Key Dialog */}
      <Dialog open={showNewDialog} onOpenChange={closeNewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>
              Generate a new API key for external access
            </DialogDescription>
          </DialogHeader>

          {newKeyValue ? (
            <div className="py-4">
              <NewAPIKeyDisplay keyValue={newKeyValue} onCopy={copyKey} />
              <p className="text-sm text-muted-foreground mt-4">
                This is the only time you'll see this key. Copy it now.
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Key Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Production API Key"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expires">Expires In (Days)</Label>
                <Input
                  id="expires"
                  type="number"
                  value={formData.expiresInDays}
                  onChange={(e) => setFormData({ ...formData, expiresInDays: parseInt(e.target.value) || 90 })}
                  min={1}
                  max={365}
                />
              </div>
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                  {API_PERMISSIONS.map((permission) => (
                    <div key={permission} className="flex items-center space-x-2">
                      <Checkbox
                        id={permission}
                        checked={formData.permissions.includes(permission)}
                        onCheckedChange={() => togglePermission(permission)}
                      />
                      <label
                        htmlFor={permission}
                        className="text-sm cursor-pointer"
                      >
                        {permission.replace(':', ' ')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {newKeyValue ? (
              <Button onClick={closeNewDialog}>Done</Button>
            ) : (
              <>
                <Button variant="outline" onClick={closeNewDialog}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={!formData.name || formData.permissions.length === 0 || createMutation.isPending}
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Key'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
