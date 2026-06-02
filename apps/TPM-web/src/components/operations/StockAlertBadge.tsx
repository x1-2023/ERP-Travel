/**
 * Stock Alert Badge Component
 * Displays stock status with appropriate styling
 */

import { AlertTriangle, CheckCircle, XCircle, Package, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { StockStatus, AlertSeverity } from '@/types/operations';
import { STOCK_STATUS_CONFIG } from '@/types/operations';

interface StockAlertBadgeProps {
  status: StockStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function StockAlertBadge({
  status,
  size = 'md',
  showIcon = true,
}: StockAlertBadgeProps) {
  const config = STOCK_STATUS_CONFIG[status];

  const Icon = {
    OK: CheckCircle,
    LOW: AlertTriangle,
    OUT_OF_STOCK: XCircle,
    OVERSTOCK: Package,
  }[status];

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <Badge
      variant="default"
      className={cn(config.bgColor, config.color, sizeClasses[size])}
    >
      {showIcon && <Icon className={cn(iconSizes[size], 'mr-1')} />}
      {config.label}
    </Badge>
  );
}

interface InventoryAlertBadgeProps {
  type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK' | 'NEAR_EXPIRY' | 'EXPIRED';
  severity: AlertSeverity;
  size?: 'sm' | 'md' | 'lg';
}

const ALERT_TYPE_CONFIG: Record<
  InventoryAlertBadgeProps['type'],
  { icon: React.ElementType; label: string }
> = {
  LOW_STOCK: { icon: AlertTriangle, label: 'Low Stock' },
  OUT_OF_STOCK: { icon: XCircle, label: 'Out of Stock' },
  OVERSTOCK: { icon: Package, label: 'Overstock' },
  NEAR_EXPIRY: { icon: Clock, label: 'Near Expiry' },
  EXPIRED: { icon: XCircle, label: 'Expired' },
};

const SEVERITY_COLORS: Record<AlertSeverity, { bgColor: string; color: string }> = {
  INFO: { bgColor: 'bg-blue-100', color: 'text-blue-700' },
  WARNING: { bgColor: 'bg-yellow-100', color: 'text-yellow-700' },
  CRITICAL: { bgColor: 'bg-red-100', color: 'text-red-700' },
};

export function InventoryAlertBadge({
  type,
  severity,
  size = 'md',
}: InventoryAlertBadgeProps) {
  const typeConfig = ALERT_TYPE_CONFIG[type];
  const severityConfig = SEVERITY_COLORS[severity];
  const Icon = typeConfig.icon;

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <Badge
      variant="default"
      className={cn(severityConfig.bgColor, severityConfig.color, sizeClasses[size])}
    >
      <Icon className={cn(iconSizes[size], 'mr-1')} />
      {typeConfig.label}
    </Badge>
  );
}

interface ExpiryBadgeProps {
  expiryDate: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ExpiryBadge({ expiryDate, size = 'md' }: ExpiryBadgeProps) {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.floor(
    (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiry <= 0) {
    return <InventoryAlertBadge type="EXPIRED" severity="CRITICAL" size={size} />;
  } else if (daysUntilExpiry <= 7) {
    return <InventoryAlertBadge type="NEAR_EXPIRY" severity="CRITICAL" size={size} />;
  } else if (daysUntilExpiry <= 30) {
    return <InventoryAlertBadge type="NEAR_EXPIRY" severity="WARNING" size={size} />;
  }

  return null;
}
