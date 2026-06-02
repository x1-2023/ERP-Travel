/**
 * Webhook Card Component
 */

import { Settings, Send, Webhook, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils';
import type { WebhookEndpoint } from '@/types/integration';

interface WebhookCardProps {
  webhook: WebhookEndpoint;
  onTest: () => void;
  onEdit: () => void;
  isTesting?: boolean;
}

export function WebhookCard({ webhook, onTest, onEdit, isTesting = false }: WebhookCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Webhook className="h-8 w-8 text-muted-foreground" />
            <div>
              <CardTitle className="text-lg">{webhook.name}</CardTitle>
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">{webhook.url}</p>
            </div>
          </div>
          <Badge variant={webhook.isActive ? 'default' : 'secondary'}>
            {webhook.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <span className="text-sm text-muted-foreground">Events:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {webhook.events.slice(0, 3).map((event) => (
                <Badge key={event} variant="outline" className="text-xs">
                  {event}
                </Badge>
              ))}
              {webhook.events.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{webhook.events.length - 3} more
                </Badge>
              )}
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Created:</span>
            <span>{formatRelativeTime(webhook.createdAt)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onEdit}>
          <Settings className="mr-2 h-4 w-4" />
          Configure
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={onTest}
          disabled={!webhook.isActive || isTesting}
        >
          <Send className={`mr-2 h-4 w-4 ${isTesting ? 'animate-pulse' : ''}`} />
          {isTesting ? 'Sending...' : 'Test'}
        </Button>
      </CardFooter>
    </Card>
  );
}

interface DeliveryStatusBadgeProps {
  status: 'PENDING' | 'DELIVERED' | 'FAILED';
}

export function DeliveryStatusBadge({ status }: DeliveryStatusBadgeProps) {
  const config = {
    PENDING: { label: 'Pending', className: 'bg-slate-500 text-white dark:bg-slate-600', icon: Clock },
    DELIVERED: { label: 'Delivered', className: 'bg-emerald-600 text-white dark:bg-emerald-500', icon: CheckCircle },
    FAILED: { label: 'Failed', className: 'bg-red-500 text-white dark:bg-red-600', icon: XCircle },
  };

  const { label, className, icon: Icon } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${className}`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
