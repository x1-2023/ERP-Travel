/**
 * Delivery Status Badge Component
 */

import { Badge } from '@/components/ui/badge';
import {
  Clock,
  CheckCircle,
  Truck,
  Package,
  XCircle,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { DELIVERY_STATUS_CONFIG, type DeliveryStatus } from '@/types/operations';

interface DeliveryStatusBadgeProps {
  status: DeliveryStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

const statusIcons: Record<DeliveryStatus, React.ReactNode> = {
  PENDING: <Clock className="h-3 w-3" />,
  CONFIRMED: <CheckCircle className="h-3 w-3" />,
  SCHEDULED: <Clock className="h-3 w-3" />,
  PICKING: <Package className="h-3 w-3" />,
  PACKED: <Package className="h-3 w-3" />,
  IN_TRANSIT: <Truck className="h-3 w-3" />,
  DELIVERED: <CheckCircle className="h-3 w-3" />,
  PARTIAL: <AlertCircle className="h-3 w-3" />,
  RETURNED: <RotateCcw className="h-3 w-3" />,
  CANCELLED: <XCircle className="h-3 w-3" />,
};

export function DeliveryStatusBadge({
  status,
  showIcon = true,
  size = 'md',
}: DeliveryStatusBadgeProps) {
  const config = DELIVERY_STATUS_CONFIG[status];

  return (
    <Badge
      variant="outline"
      className={`${config.bgColor} ${config.color} border-0 ${
        size === 'sm' ? 'text-xs px-2 py-0.5' : ''
      }`}
    >
      {showIcon && <span className="mr-1">{statusIcons[status]}</span>}
      {config.label}
    </Badge>
  );
}
