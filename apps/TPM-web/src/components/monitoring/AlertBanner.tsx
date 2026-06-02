import { AlertTriangle, Info, AlertCircle, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface AlertBannerProps {
  alerts: Array<{
    id: string;
    message: string;
    severity?: string;
    rule?: { name: string; severity: string; entityType?: string | null };
    createdAt: string;
  }>;
  maxVisible?: number;
}

const severityConfig: Record<string, { icon: typeof Info; bg: string; border: string; text: string }> = {
  INFO: { icon: Info, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
  WARNING: { icon: AlertTriangle, bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800' },
  CRITICAL: { icon: AlertCircle, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' },
  URGENT: { icon: XCircle, bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-900' },
};

export default function AlertBanner({ alerts, maxVisible = 3 }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visibleAlerts = alerts
    .filter(a => !dismissed.has(a.id))
    .slice(0, maxVisible);

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {visibleAlerts.map((alert) => {
        const severity = alert.severity || alert.rule?.severity || 'INFO';
        const config = severityConfig[severity] || severityConfig.INFO;
        const Icon = config.icon;

        return (
          <div
            key={alert.id}
            className={cn('flex items-start gap-3 rounded-lg border p-3', config.bg, config.border)}
          >
            <Icon className={cn('h-4 w-4 flex-shrink-0 mt-0.5', config.text)} />
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm font-medium', config.text)}>
                {alert.rule?.name || 'Alert'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {alert.message}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-muted-foreground">
                {new Date(alert.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <button
                onClick={() => setDismissed(prev => new Set(prev).add(alert.id))}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}
      {alerts.filter(a => !dismissed.has(a.id)).length > maxVisible && (
        <p className="text-xs text-muted-foreground text-center">
          +{alerts.filter(a => !dismissed.has(a.id)).length - maxVisible} more alerts
        </p>
      )}
    </div>
  );
}
