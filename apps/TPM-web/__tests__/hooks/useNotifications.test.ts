/**
 * useNotifications Hook Tests
 * Tests for src/hooks/useNotifications.ts
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  notificationKeys,
} from '@/hooks/useNotifications';
import { createWrapper } from '../test-utils';

// Mock notifications
const mockNotifications = [
  {
    id: 'notif-1',
    type: 'PROMOTION_APPROVED',
    title: 'Promotion Approved',
    message: 'Summer Sale has been approved',
    link: '/promotions/1',
    read: false,
    createdAt: '2024-02-01T10:00:00Z',
  },
  {
    id: 'notif-2',
    type: 'CLAIM_SUBMITTED',
    title: 'New Claim',
    message: 'A new claim has been submitted',
    link: '/claims/1',
    read: true,
    createdAt: '2024-02-01T09:00:00Z',
  },
  {
    id: 'notif-3',
    type: 'BUDGET_WARNING',
    title: 'Budget Alert',
    message: 'Budget utilization exceeded 80%',
    read: false,
    createdAt: '2024-01-31T15:00:00Z',
  },
];

const server = setupServer(
  http.get('*/api/notifications/unread-count', () => {
    return HttpResponse.json({
      success: true,
      data: { count: 2 },
    });
  }),

  http.get('*/api/notifications', () => {
    return HttpResponse.json({
      success: true,
      data: mockNotifications,
    });
  }),

  http.patch('*/api/notifications/mark-all-read', () => {
    return HttpResponse.json({
      success: true,
      data: { updatedCount: 2 },
    });
  }),

  http.patch('*/api/notifications/:id/read', ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: { id: params.id, read: true },
    });
  }),

  http.delete('*/api/notifications/:id', ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: { id: params.id },
    });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('notificationKeys', () => {
  it('should define all query key factory functions', () => {
    expect(notificationKeys.all).toEqual(['notifications']);
    expect(notificationKeys.list()).toEqual(['notifications', 'list']);
    expect(notificationKeys.unreadCount()).toEqual(['notifications', 'unread-count']);
  });

  it('should nest keys correctly', () => {
    const listKeys = notificationKeys.list();
    expect(listKeys[0]).toBe('notifications');
    expect(listKeys[1]).toBe('list');
  });
});

describe('useNotifications', () => {
  it('should fetch notifications successfully', async () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(3);
    expect(result.current.data![0].id).toBe('notif-1');
    expect(result.current.data![0].type).toBe('PROMOTION_APPROVED');
    expect(result.current.data![0].title).toBe('Promotion Approved');
  });

  it('should select data correctly from nested response', async () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // The select function extracts response.data as Notification[]
    expect(Array.isArray(result.current.data)).toBe(true);
    expect(result.current.data![0]).toHaveProperty('id');
    expect(result.current.data![0]).toHaveProperty('type');
    expect(result.current.data![0]).toHaveProperty('title');
    expect(result.current.data![0]).toHaveProperty('message');
    expect(result.current.data![0]).toHaveProperty('read');
    expect(result.current.data![0]).toHaveProperty('createdAt');
  });

  it('should handle API errors', async () => {
    server.use(
      http.get('*/api/notifications', () => {
        return HttpResponse.json(
          { success: false, error: { code: 'SERVER_ERROR', message: 'Internal error' } },
          { status: 500 },
        );
      }),
    );

    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useUnreadCount', () => {
  it('should fetch unread count successfully', async () => {
    const { result } = renderHook(() => useUnreadCount(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBe(2);
  });

  it('should handle API errors', async () => {
    server.use(
      http.get('*/api/notifications/unread-count', () => {
        return HttpResponse.json(
          { success: false, error: { code: 'SERVER_ERROR', message: 'Internal error' } },
          { status: 500 },
        );
      }),
    );

    const { result } = renderHook(() => useUnreadCount(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useMarkAsRead', () => {
  it('should mark a notification as read', async () => {
    const { result } = renderHook(() => useMarkAsRead(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync('notif-1');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('should handle mark as read errors', async () => {
    server.use(
      http.patch('*/api/notifications/:id/read', () => {
        return HttpResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Notification not found' } },
          { status: 404 },
        );
      }),
    );

    const { result } = renderHook(() => useMarkAsRead(), {
      wrapper: createWrapper(),
    });

    try {
      await act(async () => {
        await result.current.mutateAsync('nonexistent');
      });
    } catch {
      // Expected to throw
    }

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useMarkAllAsRead', () => {
  it('should mark all notifications as read', async () => {
    const { result } = renderHook(() => useMarkAllAsRead(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync();
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useDeleteNotification', () => {
  it('should delete a notification', async () => {
    const { result } = renderHook(() => useDeleteNotification(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync('notif-1');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('should handle delete errors', async () => {
    server.use(
      http.delete('*/api/notifications/:id', () => {
        return HttpResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Notification not found' } },
          { status: 404 },
        );
      }),
    );

    const { result } = renderHook(() => useDeleteNotification(), {
      wrapper: createWrapper(),
    });

    try {
      await act(async () => {
        await result.current.mutateAsync('nonexistent');
      });
    } catch {
      // Expected to throw
    }

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
