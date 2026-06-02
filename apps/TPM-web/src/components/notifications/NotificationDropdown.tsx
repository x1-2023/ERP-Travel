import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  ExternalLink,
  ClipboardList,
  CheckCircle,
  XCircle,
  FileText,
  Banknote,
  AlertTriangle,
  Settings,
  type LucideIcon
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  type Notification,
} from '@/hooks/useNotifications';

// Notification type icons and colors
const notificationConfig: Record<string, { icon: LucideIcon; color: string }> = {
  PROMOTION_CREATED: { icon: ClipboardList, color: 'text-primary' },
  PROMOTION_APPROVED: { icon: CheckCircle, color: 'text-success' },
  PROMOTION_REJECTED: { icon: XCircle, color: 'text-danger' },
  CLAIM_SUBMITTED: { icon: FileText, color: 'text-warning' },
  CLAIM_APPROVED: { icon: CheckCircle, color: 'text-success' },
  CLAIM_REJECTED: { icon: XCircle, color: 'text-danger' },
  CLAIM_PAID: { icon: Banknote, color: 'text-success' },
  BUDGET_ALERT: { icon: AlertTriangle, color: 'text-warning' },
  SYSTEM: { icon: Settings, color: 'text-foreground-muted' },
};

// Demo notifications for when API returns empty
const demoNotifications: Notification[] = [
  {
    id: '1',
    type: 'PROMOTION_APPROVED',
    title: 'Promotion Approved',
    message: 'Your promotion "Q1 Trade Discount" has been approved',
    link: '/promotions/1',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: '2',
    type: 'CLAIM_SUBMITTED',
    title: 'New Claim Submitted',
    message: 'A new claim CLM-2026-001 requires your review',
    link: '/claims/1',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: '3',
    type: 'BUDGET_ALERT',
    title: 'Budget Alert',
    message: 'Q1 Trade Budget has reached 80% utilization',
    link: '/budgets',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
];

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);

  const { data: notificationsData, isLoading } = useNotifications();
  const { data: unreadData } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();

  // Use demo data when API returns empty
  const notifications = notificationsData?.length ? notificationsData : demoNotifications;
  const unreadCount = notificationsData?.length
    ? (unreadData ?? 0)
    : demoNotifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    if (notificationsData?.length) {
      markAsRead.mutate(id);
    }
  };

  const handleMarkAllAsRead = () => {
    if (notificationsData?.length) {
      markAllAsRead.mutate();
    }
  };

  const handleDelete = (id: string) => {
    if (notificationsData?.length) {
      deleteNotification.mutate(id);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative text-foreground-muted hover:text-foreground"
          data-testid="notification-bell"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-1 text-2xs font-bold text-danger-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0 bg-card border-surface-border"
        data-testid="notification-dropdown"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Notifications
            </span>
            {unreadCount > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded bg-danger px-1 text-[10px] font-semibold text-danger-foreground">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1 text-[10px] text-foreground-muted hover:text-foreground transition-colors"
            >
              <CheckCheck className="h-3 w-3" />
              Mark all
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-8 w-8 text-foreground-subtle mx-auto mb-2" />
              <p className="text-sm text-foreground-muted">No notifications</p>
            </div>
          ) : (
            <ul className="divide-y divide-surface-border">
              {notifications.map((notification) => {
                const config = notificationConfig[notification.type] || notificationConfig.SYSTEM;
                const IconComponent = config.icon;
                return (
                  <li
                    key={notification.id}
                    className={cn(
                      'flex gap-3 p-3 hover:bg-surface-hover transition-colors',
                      !notification.read && 'bg-primary-muted/30'
                    )}
                    data-testid="notification-item"
                  >
                    {/* Icon */}
                    <div className={cn('flex-shrink-0', config.color)}>
                      <IconComponent className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {notification.title}
                      </p>
                      <p className="text-2xs text-foreground-muted mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-2xs text-foreground-subtle mt-1 font-mono">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-start gap-1 shrink-0">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="h-6 w-6 text-foreground-subtle hover:text-primary"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      {notification.link && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          asChild
                          className="h-6 w-6 text-foreground-subtle hover:text-foreground"
                        >
                          <Link to={notification.link}>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(notification.id)}
                        className="h-6 w-6 text-foreground-subtle hover:text-danger"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-surface-border p-2">
          <Button
            variant="ghost"
            className="w-full justify-center text-xs text-foreground-muted"
            asChild
          >
            <Link to="/notifications" onClick={() => setOpen(false)}>
              View all notifications
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
