'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { WidgetContainer } from './widget-container';
import { cn } from '@/lib/utils';

type AlertSeverity = 'critical' | 'warning' | 'info';

interface AlertItem {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  timestamp: string;
}

interface AlertsWidgetProps {
  id?: string;
  onRemove?: (id: string) => void;
  isDragging?: boolean;
  className?: string;
}

const severityConfig: Record<AlertSeverity, {
  icon: typeof AlertTriangle;
  badgeClass: string;
  label: string;
}> = {
  critical: {
    icon: AlertCircle,
    badgeClass: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    label: 'Nghiêm trọng',
  },
  warning: {
    icon: AlertTriangle,
    badgeClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    label: 'Cảnh báo',
  },
  info: {
    icon: Info,
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    label: 'Thông tin',
  },
};

export function AlertsWidget({
  id = 'alerts',
  onRemove,
  isDragging,
  className,
}: AlertsWidgetProps) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/analytics/alerts');
        if (response.ok) {
          const result = await response.json();
          setAlerts(result);
        }
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <WidgetContainer
      id={id}
      title="Cảnh báo"
      onRemove={onRemove}
      isDragging={isDragging}
      className={className}
    >
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-muted" />
          ))}
        </div>
      ) : alerts.length > 0 ? (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {alerts.map((alert) => {
            const config = severityConfig[alert.severity];
            const Icon = config.icon;

            return (
              <div
                key={alert.id}
                className="flex items-start gap-2 rounded-md border p-2 text-sm"
              >
                <Icon className={cn(
                  'h-4 w-4 mt-0.5 shrink-0',
                  alert.severity === 'critical' && 'text-red-500',
                  alert.severity === 'warning' && 'text-yellow-500',
                  alert.severity === 'info' && 'text-blue-500'
                )} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate text-xs">{alert.title}</p>
                    <Badge variant="secondary" className={cn('text-[10px] px-1.5 py-0', config.badgeClass)}>
                      {config.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{alert.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          Không có cảnh báo nào
        </p>
      )}
    </WidgetContainer>
  );
}
