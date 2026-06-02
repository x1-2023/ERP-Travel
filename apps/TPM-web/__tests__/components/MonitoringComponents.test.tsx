/**
 * Monitoring Components Tests
 * Tests for AlertBanner and NotificationDropdown
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';

// Fix ResizeObserver constructor for floating-ui used by Popover
global.ResizeObserver = class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

// ============================================================================
// AlertBanner
// ============================================================================
import AlertBanner from '@/components/monitoring/AlertBanner';

describe('AlertBanner', () => {
  const mockAlerts = [
    {
      id: 'alert-1',
      message: 'Budget exceeded threshold',
      severity: 'WARNING',
      rule: { name: 'Budget Alert', severity: 'WARNING', entityType: null },
      createdAt: '2026-01-15T10:00:00Z',
    },
    {
      id: 'alert-2',
      message: 'Critical spending anomaly detected',
      severity: 'CRITICAL',
      rule: { name: 'Anomaly Detection', severity: 'CRITICAL', entityType: null },
      createdAt: '2026-01-15T11:00:00Z',
    },
    {
      id: 'alert-3',
      message: 'New report available',
      severity: 'INFO',
      rule: { name: 'Report Ready', severity: 'INFO', entityType: null },
      createdAt: '2026-01-15T12:00:00Z',
    },
  ];

  it('renders nothing when no alerts', () => {
    const { container } = render(<AlertBanner alerts={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders alert messages', () => {
    render(<AlertBanner alerts={mockAlerts} />);
    expect(screen.getByText('Budget exceeded threshold')).toBeInTheDocument();
    expect(screen.getByText('Critical spending anomaly detected')).toBeInTheDocument();
    expect(screen.getByText('New report available')).toBeInTheDocument();
  });

  it('renders alert rule names', () => {
    render(<AlertBanner alerts={mockAlerts} />);
    expect(screen.getByText('Budget Alert')).toBeInTheDocument();
    expect(screen.getByText('Anomaly Detection')).toBeInTheDocument();
    expect(screen.getByText('Report Ready')).toBeInTheDocument();
  });

  it('limits visible alerts based on maxVisible', () => {
    render(<AlertBanner alerts={mockAlerts} maxVisible={2} />);
    expect(screen.getByText('Budget exceeded threshold')).toBeInTheDocument();
    expect(screen.getByText('Critical spending anomaly detected')).toBeInTheDocument();
    // Third alert should not be visible
    expect(screen.queryByText('New report available')).not.toBeInTheDocument();
    // Shows "+1 more alerts" text
    expect(screen.getByText('+1 more alerts')).toBeInTheDocument();
  });

  it('dismisses alert when close button clicked', () => {
    render(<AlertBanner alerts={[mockAlerts[0]]} />);
    expect(screen.getByText('Budget exceeded threshold')).toBeInTheDocument();

    // Find and click the dismiss button (X icon)
    const dismissButtons = screen.getAllByRole('button');
    fireEvent.click(dismissButtons[0]);

    expect(screen.queryByText('Budget exceeded threshold')).not.toBeInTheDocument();
  });

  it('renders with default severity when none specified', () => {
    const alertWithoutSeverity = [
      {
        id: 'alert-4',
        message: 'Some info message',
        createdAt: '2026-01-15T13:00:00Z',
      },
    ];
    render(<AlertBanner alerts={alertWithoutSeverity} />);
    expect(screen.getByText('Some info message')).toBeInTheDocument();
    expect(screen.getByText('Alert')).toBeInTheDocument();
  });
});

// ============================================================================
// NotificationDropdown
// ============================================================================

// Mock the notification hooks
vi.mock('@/hooks/useNotifications', () => ({
  useNotifications: () => ({
    data: [],
    isLoading: false,
  }),
  useUnreadCount: () => ({
    data: 2,
  }),
  useMarkAsRead: () => ({
    mutate: vi.fn(),
  }),
  useMarkAllAsRead: () => ({
    mutate: vi.fn(),
  }),
  useDeleteNotification: () => ({
    mutate: vi.fn(),
  }),
}));

import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';

describe('NotificationDropdown', () => {
  it('renders notification bell button', () => {
    render(<NotificationDropdown />);
    expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
  });

  it('shows unread count badge', () => {
    render(<NotificationDropdown />);
    // The demo notifications have 2 unread items
    const badge = screen.getByText('2');
    expect(badge).toBeInTheDocument();
  });

  it('opens dropdown on click', () => {
    render(<NotificationDropdown />);
    const bell = screen.getByTestId('notification-bell');
    fireEvent.click(bell);
    expect(screen.getByTestId('notification-dropdown')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('renders demo notifications when API returns empty', () => {
    render(<NotificationDropdown />);
    fireEvent.click(screen.getByTestId('notification-bell'));
    // Demo notifications should be shown
    expect(screen.getByText('Promotion Approved')).toBeInTheDocument();
    expect(screen.getByText('New Claim Submitted')).toBeInTheDocument();
    expect(screen.getByText('Budget Alert')).toBeInTheDocument();
  });

  it('renders View all notifications link', () => {
    render(<NotificationDropdown />);
    fireEvent.click(screen.getByTestId('notification-bell'));
    expect(screen.getByText('View all notifications')).toBeInTheDocument();
  });

  it('renders Mark all button when unread', () => {
    render(<NotificationDropdown />);
    fireEvent.click(screen.getByTestId('notification-bell'));
    expect(screen.getByText('Mark all')).toBeInTheDocument();
  });
});
