/**
 * Delivery Timeline Component
 * Visual tracking history
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle,
  Clock,
  Truck,
  Package,
  MapPin,
  User,
} from 'lucide-react';
import { DeliveryStatusBadge } from './DeliveryStatusBadge';
import { formatDate } from '@/lib/utils';
import type { DeliveryStatus, DeliveryTracking } from '@/types/operations';

interface DeliveryTimelineProps {
  timeline: Array<DeliveryTracking & { duration: string | null }>;
  currentStatus: DeliveryStatus;
}

const statusIcons: Record<DeliveryStatus, React.ReactNode> = {
  PENDING: <Clock className="h-4 w-4" />,
  CONFIRMED: <CheckCircle className="h-4 w-4" />,
  SCHEDULED: <Clock className="h-4 w-4" />,
  PICKING: <Package className="h-4 w-4" />,
  PACKED: <Package className="h-4 w-4" />,
  IN_TRANSIT: <Truck className="h-4 w-4" />,
  DELIVERED: <CheckCircle className="h-4 w-4" />,
  PARTIAL: <Package className="h-4 w-4" />,
  RETURNED: <Truck className="h-4 w-4" />,
  CANCELLED: <Clock className="h-4 w-4" />,
};

const statusColors: Record<DeliveryStatus, string> = {
  PENDING: 'bg-slate-500 text-white dark:bg-slate-600',
  CONFIRMED: 'bg-blue-500 text-white dark:bg-blue-600',
  SCHEDULED: 'bg-blue-500 text-white dark:bg-blue-600',
  PICKING: 'bg-amber-500 text-white dark:bg-amber-600',
  PACKED: 'bg-amber-500 text-white dark:bg-amber-600',
  IN_TRANSIT: 'bg-amber-500 text-white dark:bg-amber-600',
  DELIVERED: 'bg-emerald-600 text-white dark:bg-emerald-500',
  PARTIAL: 'bg-amber-500 text-white dark:bg-amber-600',
  RETURNED: 'bg-red-500 text-white dark:bg-red-600',
  CANCELLED: 'bg-slate-500 text-white dark:bg-slate-600',
};

export function DeliveryTimeline({ timeline, currentStatus }: DeliveryTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Delivery Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />

          {/* Timeline entries */}
          <div className="space-y-6">
            {timeline.map((entry, index) => {
              const isLast = index === timeline.length - 1;
              const isCurrent = entry.status === currentStatus && isLast;

              return (
                <div key={entry.id} className="relative flex gap-4">
                  {/* Icon */}
                  <div
                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                      isCurrent
                        ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                        : statusColors[entry.status]
                    }`}
                  >
                    {statusIcons[entry.status]}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2">
                      <DeliveryStatusBadge status={entry.status} showIcon={false} />
                      {isCurrent && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          Current
                        </span>
                      )}
                    </div>

                    <div className="mt-1 text-sm text-muted-foreground">
                      <p>{formatDate(entry.timestamp, 'MMM d, yyyy HH:mm')}</p>
                      {entry.duration && (
                        <p className="text-xs">Duration: {entry.duration}</p>
                      )}
                    </div>

                    {entry.notes && (
                      <p className="mt-2 text-sm bg-muted p-2 rounded">
                        {entry.notes}
                      </p>
                    )}

                    {entry.user && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        {entry.user.name}
                      </div>
                    )}

                    {entry.location && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {entry.location.address}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
