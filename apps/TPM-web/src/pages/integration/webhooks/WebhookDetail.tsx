/**
 * Webhook Detail Page
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Settings,
  Send,
  Trash2,
  RotateCw,
  Copy,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
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
import { DeliveryStatusBadge } from '@/components/integration';
import {
  useWebhook,
  useUpdateWebhook,
  useDeleteWebhook,
  useTestWebhook,
  useWebhookDeliveries,
  useRetryDelivery,
} from '@/hooks/integration/useWebhooks';
import { useToast } from '@/hooks/useToast';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { WEBHOOK_EVENTS } from '@/types/integration';
import type { WebhookEvent } from '@/types/integration';

export default function WebhookDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    url: '',
    events: [] as WebhookEvent[],
    isActive: true,
  });

  const { data, isLoading, refetch } = useWebhook(id!);
  const { data: deliveriesData, isLoading: deliveriesLoading, refetch: refetchDeliveries } = useWebhookDeliveries(id!);
  const updateMutation = useUpdateWebhook();
  const deleteMutation = useDeleteWebhook();
  const testMutation = useTestWebhook();
  const retryMutation = useRetryDelivery();

  const webhook = data;
  const deliveries = deliveriesData?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!webhook) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Webhook not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/integration/webhooks')}>
          Back to Webhooks
        </Button>
      </div>
    );
  }

  const handleTest = async () => {
    try {
      const result = await testMutation.mutateAsync(id!);
      if (result.data.delivered) {
        toast({
          title: 'Test Successful',
          description: `Webhook responded with status ${result.data.responseStatus}`,
        });
      } else {
        toast({
          title: 'Test Failed',
          description: result.data.error || 'Webhook did not respond',
          variant: 'destructive',
        });
      }
      refetchDeliveries();
    } catch (error) {
      toast({
        title: 'Test Failed',
        description: 'Failed to send test webhook.',
        variant: 'destructive',
      });
    }
  };

  const handleRetry = async (deliveryId: string) => {
    try {
      await retryMutation.mutateAsync({ endpointId: id!, deliveryId });
      toast({
        title: 'Retry Queued',
        description: 'Delivery will be retried.',
      });
      refetchDeliveries();
    } catch (error) {
      toast({
        title: 'Retry Failed',
        description: 'Failed to retry delivery.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async () => {
    try {
      await updateMutation.mutateAsync({
        id: id!,
        data: {
          name: editForm.name,
          url: editForm.url,
          events: editForm.events,
          isActive: editForm.isActive,
        },
      });
      toast({
        title: 'Webhook Updated',
        description: 'Webhook has been updated.',
      });
      setIsEditing(false);
      refetch();
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Failed to update webhook.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id!);
      toast({
        title: 'Webhook Deleted',
        description: 'Webhook has been removed.',
      });
      navigate('/integration/webhooks');
    } catch (error) {
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete webhook.',
        variant: 'destructive',
      });
    }
  };

  const startEditing = () => {
    setEditForm({
      name: webhook.name,
      url: webhook.url,
      events: webhook.events as WebhookEvent[],
      isActive: webhook.isActive,
    });
    setIsEditing(true);
  };

  const toggleEvent = (event: WebhookEvent) => {
    setEditForm((prev) => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter((e) => e !== event)
        : [...prev.events, event],
    }));
  };

  const copySecret = () => {
    if (webhook.secret) {
      navigator.clipboard.writeText(webhook.secret);
      toast({
        title: 'Secret Copied',
        description: 'Webhook secret copied to clipboard.',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/integration/webhooks')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              {webhook.name}
              <Badge variant={webhook.isActive ? 'default' : 'secondary'}>
                {webhook.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </h1>
            <p className="text-muted-foreground text-sm">{webhook.url}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleTest}
            disabled={!webhook.isActive || testMutation.isPending}
          >
            <Send className={`mr-2 h-4 w-4 ${testMutation.isPending ? 'animate-pulse' : ''}`} />
            {testMutation.isPending ? 'Sending...' : 'Send Test'}
          </Button>
          <Button variant="outline" onClick={startEditing}>
            <Settings className="mr-2 h-4 w-4" />
            Configure
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Webhook Details */}
        <Card>
          <CardHeader>
            <CardTitle>Webhook Details</CardTitle>
            <CardDescription>Configuration and secret</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={webhook.isActive ? 'default' : 'secondary'}>
                {webhook.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>{formatDate(webhook.createdAt)}</span>
            </div>
            <div className="space-y-2">
              <span className="text-muted-foreground">Secret</span>
              <div className="flex items-center gap-2">
                <Input
                  type={showSecret ? 'text' : 'password'}
                  value={webhook.secret || '••••••••••••••••'}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button variant="ghost" size="icon" onClick={() => setShowSecret(!showSecret)}>
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={copySecret}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="pt-4 border-t">
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Webhook
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Subscribed Events */}
        <Card>
          <CardHeader>
            <CardTitle>Subscribed Events</CardTitle>
            <CardDescription>Events that trigger this webhook</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {webhook.events.map((event) => (
                <Badge key={event} variant="outline">
                  {event.replace('.', ' ')}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delivery History */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery History</CardTitle>
          <CardDescription>Recent webhook deliveries</CardDescription>
        </CardHeader>
        <CardContent>
          {deliveriesLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : deliveries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No deliveries yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Response</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell className="text-sm">
                      {formatRelativeTime(delivery.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{delivery.event}</Badge>
                    </TableCell>
                    <TableCell>
                      <DeliveryStatusBadge status={delivery.status} />
                    </TableCell>
                    <TableCell className="text-sm">
                      {delivery.responseStatus ? `${delivery.responseStatus}` : '-'}
                    </TableCell>
                    <TableCell>{delivery.attempts}</TableCell>
                    <TableCell>
                      {delivery.status === 'FAILED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRetry(delivery.id)}
                          disabled={retryMutation.isPending}
                        >
                          <RotateCw className="h-4 w-4" />
                        </Button>
                      )}
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Webhook</DialogTitle>
            <DialogDescription>Update webhook configuration</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="active">Active</Label>
              <Switch
                id="active"
                checked={editForm.isActive}
                onCheckedChange={(checked) => setEditForm({ ...editForm, isActive: checked })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-url">URL</Label>
              <Input
                id="edit-url"
                value={editForm.url}
                onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Events</Label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                {WEBHOOK_EVENTS.map((event) => (
                  <div key={event} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${event}`}
                      checked={editForm.events.includes(event)}
                      onCheckedChange={() => toggleEvent(event)}
                    />
                    <label htmlFor={`edit-${event}`} className="text-sm cursor-pointer">
                      {event.replace('.', ' ')}
                    </label>
                  </div>
                ))}
              </div>
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
            <DialogTitle>Delete Webhook</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this webhook? This action cannot be undone.
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
