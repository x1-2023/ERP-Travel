/**
 * Webhooks List Page
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Webhook, RefreshCw } from 'lucide-react';
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
import { WebhookCard } from '@/components/integration';
import { useWebhooks, useCreateWebhook, useTestWebhook } from '@/hooks/integration/useWebhooks';
import { useToast } from '@/hooks/useToast';
import { WEBHOOK_EVENTS } from '@/types/integration';
import type { WebhookEvent } from '@/types/integration';

export default function WebhookList() {
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    events: [] as WebhookEvent[],
  });

  const { toast } = useToast();
  const { data, isLoading, refetch } = useWebhooks();
  const createMutation = useCreateWebhook();
  const testMutation = useTestWebhook();

  const webhooks = data?.data || [];

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync({
        name: formData.name,
        url: formData.url,
        events: formData.events,
      });
      toast({
        title: 'Webhook Created',
        description: 'Save your webhook secret securely.',
      });
      setShowNewDialog(false);
      setFormData({ name: '', url: '', events: [] });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create webhook.',
        variant: 'destructive',
      });
    }
  };

  const handleTest = async (webhookId: string) => {
    setTestingId(webhookId);
    try {
      const result = await testMutation.mutateAsync(webhookId);
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
    } catch (error) {
      toast({
        title: 'Test Failed',
        description: 'Failed to send test webhook.',
        variant: 'destructive',
      });
    } finally {
      setTestingId(null);
    }
  };

  const toggleEvent = (event: WebhookEvent) => {
    setFormData((prev) => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter((e) => e !== event)
        : [...prev.events, event],
    }));
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
          <h1 className="text-2xl font-bold">Webhooks</h1>
          <p className="text-muted-foreground">
            Receive real-time notifications for system events
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setShowNewDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Webhook
          </Button>
        </div>
      </div>

      {/* Webhooks Grid */}
      {webhooks.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Webhook className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Webhooks</h3>
              <p className="text-muted-foreground mb-4">
                Create a webhook to receive event notifications
              </p>
              <Button onClick={() => setShowNewDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Webhook
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {webhooks.map((webhook) => (
            <Link key={webhook.id} to={`/integration/webhooks/${webhook.id}`}>
              <WebhookCard
                webhook={webhook}
                onTest={() => handleTest(webhook.id)}
                onEdit={() => {}}
                isTesting={testingId === webhook.id}
              />
            </Link>
          ))}
        </div>
      )}

      {/* New Webhook Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Webhook</DialogTitle>
            <DialogDescription>
              Configure a new webhook endpoint
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Webhook Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Order notifications"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">Endpoint URL</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://your-server.com/webhook"
              />
            </div>
            <div className="space-y-2">
              <Label>Events</Label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                {WEBHOOK_EVENTS.map((event) => (
                  <div key={event} className="flex items-center space-x-2">
                    <Checkbox
                      id={event}
                      checked={formData.events.includes(event)}
                      onCheckedChange={() => toggleEvent(event)}
                    />
                    <label
                      htmlFor={event}
                      className="text-sm cursor-pointer"
                    >
                      {event.replace('.', ' ')}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formData.name || !formData.url || formData.events.length === 0 || createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Webhook'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
