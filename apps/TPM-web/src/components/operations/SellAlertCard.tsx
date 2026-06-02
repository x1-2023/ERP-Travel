/**
 * Sell Alert Card Component
 * Displays sell tracking alerts with severity indicators
 */

import { AlertTriangle, TrendingDown, Package, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type AlertType = 'LOW_SELL_THROUGH' | 'HIGH_STOCK' | 'NEGATIVE_TREND' | 'STOCKOUT_RISK';
type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

interface SellAlert {
  type: AlertType;
  severity: AlertSeverity;
  customerId: string;
  customerName: string;
  productId?: string;
  productName?: string;
  message: string;
  metric: number;
  threshold: number;
  period: string;
}

interface SellAlertCardProps {
  alert: SellAlert;
  onClick?: () => void;
}

const ALERT_CONFIG: Record<
  AlertType,
  { icon: React.ElementType; label: string; color: string }
> = {
  LOW_SELL_THROUGH: {
    icon: TrendingDown,
    label: 'Low Sell-Through',
    color: 'text-orange-500',
  },
  HIGH_STOCK: {
    icon: Package,
    label: 'High Stock',
    color: 'text-blue-500',
  },
  NEGATIVE_TREND: {
    icon: TrendingDown,
    label: 'Negative Trend',
    color: 'text-red-500',
  },
  STOCKOUT_RISK: {
    icon: AlertTriangle,
    label: 'Stockout Risk',
    color: 'text-red-500',
  },
};

const SEVERITY_CONFIG: Record<AlertSeverity, { bgColor: string; textColor: string }> = {
  INFO: { bgColor: 'bg-blue-50 dark:bg-blue-950/30', textColor: 'text-blue-700 dark:text-blue-300' },
  WARNING: { bgColor: 'bg-amber-50 dark:bg-amber-950/30', textColor: 'text-amber-700 dark:text-amber-300' },
  CRITICAL: { bgColor: 'bg-red-50 dark:bg-red-950/30', textColor: 'text-red-700 dark:text-red-300' },
};

export function SellAlertCard({ alert, onClick }: SellAlertCardProps) {
  const config = ALERT_CONFIG[alert.type];
  const severityConfig = SEVERITY_CONFIG[alert.severity];
  const Icon = config.icon;

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md',
        onClick && 'cursor-pointer',
        severityConfig.bgColor
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'p-2 rounded-full',
              alert.severity === 'CRITICAL' ? 'bg-red-100 dark:bg-red-900/50' : 'bg-surface-hover'
            )}
          >
            <Icon className={cn('h-5 w-5', config.color)} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <Badge variant="outline" className={severityConfig.textColor}>
                {alert.severity}
              </Badge>
              <span className="text-xs text-muted-foreground">{alert.period}</span>
            </div>

            <h4 className="font-medium mt-1 truncate">{alert.customerName}</h4>
            {alert.productName && (
              <p className="text-sm text-muted-foreground truncate">{alert.productName}</p>
            )}

            <p className={cn('text-sm mt-2', severityConfig.textColor)}>{alert.message}</p>

            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>Metric: {alert.metric}</span>
              <span>Threshold: {alert.threshold}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SellAlertListProps {
  alerts: SellAlert[];
  onAlertClick?: (alert: SellAlert) => void;
  maxDisplay?: number;
}

export function SellAlertList({ alerts, onAlertClick, maxDisplay = 5 }: SellAlertListProps) {
  const displayAlerts = alerts.slice(0, maxDisplay);
  const remaining = alerts.length - maxDisplay;

  if (alerts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p>No alerts at this time</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayAlerts.map((alert, index) => (
        <SellAlertCard
          key={`${alert.customerId}-${alert.productId}-${index}`}
          alert={alert}
          onClick={() => onAlertClick?.(alert)}
        />
      ))}
      {remaining > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          +{remaining} more alerts
        </p>
      )}
    </div>
  );
}
