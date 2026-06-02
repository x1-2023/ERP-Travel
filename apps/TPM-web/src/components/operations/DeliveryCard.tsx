/**
 * Delivery Card Component
 */

import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreVertical,
  Calendar,
  MapPin,
  Package,
  User,
  ArrowRight,
} from 'lucide-react';
import { DeliveryStatusBadge } from './DeliveryStatusBadge';
import { formatDate } from '@/lib/utils';
import type { DeliveryOrder } from '@/types/operations';
import { DELIVERY_STATUS_TRANSITIONS } from '@/types/operations';

interface DeliveryCardProps {
  order: DeliveryOrder;
  onStatusUpdate?: (id: string, status: string) => void;
  onDelete?: (id: string) => void;
}

export function DeliveryCard({ order, onStatusUpdate, onDelete }: DeliveryCardProps) {
  const nextStatuses = DELIVERY_STATUS_TRANSITIONS[order.status] || [];
  const canUpdateStatus = nextStatuses.length > 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <Link to={`/operations/delivery/${order.id}`}>
              <CardTitle className="text-lg hover:text-primary transition-colors">
                {order.orderNumber}
              </CardTitle>
            </Link>
            {order.customer && (
              <p className="text-sm text-muted-foreground mt-1">
                {order.customer.name}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <DeliveryStatusBadge status={order.status} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={`/operations/delivery/${order.id}`}>
                    View Details
                  </Link>
                </DropdownMenuItem>
                {canUpdateStatus && (
                  <>
                    <DropdownMenuSeparator />
                    {nextStatuses.map((status) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => onStatusUpdate?.(order.id, status)}
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Move to {status.replace('_', ' ')}
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
                {order.status === 'PENDING' && onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(order.id)}
                      className="text-destructive"
                    >
                      Delete Order
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Scheduled: {formatDate(order.scheduledDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>{order.totalItems || (order as { _count?: { lines?: number } })._count?.lines || 0} items</span>
          </div>
          {order.deliveryAddress && (
            <div className="flex items-center gap-2 text-muted-foreground col-span-2">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{order.deliveryAddress}</span>
            </div>
          )}
          {order.contactPerson && (
            <div className="flex items-center gap-2 text-muted-foreground col-span-2">
              <User className="h-4 w-4" />
              <span>
                {order.contactPerson}
                {order.contactPhone && ` - ${order.contactPhone}`}
              </span>
            </div>
          )}
        </div>

        {order.promotion && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm text-muted-foreground">
              Promotion: <span className="font-medium">{order.promotion.name}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
