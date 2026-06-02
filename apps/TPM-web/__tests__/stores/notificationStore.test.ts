/**
 * Notification Store Test Suite
 * Tests for notification state management
 */

import { describe, it, expect } from 'vitest';

// ══════════════════════════════════════════════════════════════════════════════
// Notification Store Mock Implementation
// ══════════════════════════════════════════════════════════════════════════════

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
  duration?: number;
  dismissible?: boolean;
}

const createNotificationStore = () => {
  let notifications: Notification[] = [];
  let idCounter = 0;

  return {
    getNotifications: () => notifications,

    add: (
      type: Notification['type'],
      message: string,
      options?: { title?: string; duration?: number; dismissible?: boolean }
    ) => {
      const notification: Notification = {
        id: `notif-${++idCounter}`,
        type,
        message,
        title: options?.title,
        duration: options?.duration ?? 5000,
        dismissible: options?.dismissible ?? true,
      };
      notifications = [...notifications, notification];
      return notification.id;
    },

    success: (message: string, options?: { title?: string }) => {
      return createNotificationStore().add('success', message, options);
    },

    error: (message: string, options?: { title?: string }) => {
      return createNotificationStore().add('error', message, options);
    },

    warning: (message: string, options?: { title?: string }) => {
      return createNotificationStore().add('warning', message, options);
    },

    info: (message: string, options?: { title?: string }) => {
      return createNotificationStore().add('info', message, options);
    },

    remove: (id: string) => {
      notifications = notifications.filter(n => n.id !== id);
    },

    clear: () => {
      notifications = [];
    },

    getById: (id: string) => {
      return notifications.find(n => n.id === id);
    },
  };
};

// ══════════════════════════════════════════════════════════════════════════════
// Tests
// ══════════════════════════════════════════════════════════════════════════════

describe('Notification Store', () => {
  describe('initialization', () => {
    it('should start with empty notifications', () => {
      const store = createNotificationStore();
      expect(store.getNotifications()).toHaveLength(0);
    });
  });

  describe('adding notifications', () => {
    it('should add success notification', () => {
      const store = createNotificationStore();
      store.add('success', 'Operation completed');

      const notifications = store.getNotifications();
      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe('success');
      expect(notifications[0].message).toBe('Operation completed');
    });

    it('should add error notification', () => {
      const store = createNotificationStore();
      store.add('error', 'Something went wrong');

      const notifications = store.getNotifications();
      expect(notifications[0].type).toBe('error');
    });

    it('should add warning notification', () => {
      const store = createNotificationStore();
      store.add('warning', 'Budget running low');

      const notifications = store.getNotifications();
      expect(notifications[0].type).toBe('warning');
    });

    it('should add info notification', () => {
      const store = createNotificationStore();
      store.add('info', 'New update available');

      const notifications = store.getNotifications();
      expect(notifications[0].type).toBe('info');
    });

    it('should add notification with title', () => {
      const store = createNotificationStore();
      store.add('success', 'Promotion saved', { title: 'Success!' });

      const notifications = store.getNotifications();
      expect(notifications[0].title).toBe('Success!');
    });

    it('should add notification with custom duration', () => {
      const store = createNotificationStore();
      store.add('info', 'Quick message', { duration: 2000 });

      const notifications = store.getNotifications();
      expect(notifications[0].duration).toBe(2000);
    });

    it('should default duration to 5000ms', () => {
      const store = createNotificationStore();
      store.add('info', 'Default duration');

      const notifications = store.getNotifications();
      expect(notifications[0].duration).toBe(5000);
    });

    it('should default dismissible to true', () => {
      const store = createNotificationStore();
      store.add('info', 'Dismissible message');

      const notifications = store.getNotifications();
      expect(notifications[0].dismissible).toBe(true);
    });

    it('should allow non-dismissible notifications', () => {
      const store = createNotificationStore();
      store.add('error', 'Critical error', { dismissible: false });

      const notifications = store.getNotifications();
      expect(notifications[0].dismissible).toBe(false);
    });

    it('should return notification id', () => {
      const store = createNotificationStore();
      const id = store.add('success', 'Test');

      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
    });
  });

  describe('removing notifications', () => {
    it('should remove notification by id', () => {
      const store = createNotificationStore();
      const id = store.add('info', 'Test');

      store.remove(id);

      expect(store.getNotifications()).toHaveLength(0);
    });

    it('should only remove specified notification', () => {
      const store = createNotificationStore();
      const id1 = store.add('success', 'Message 1');
      store.add('error', 'Message 2');
      store.add('warning', 'Message 3');

      store.remove(id1);

      const notifications = store.getNotifications();
      expect(notifications).toHaveLength(2);
      expect(notifications.find(n => n.message === 'Message 1')).toBeUndefined();
    });

    it('should handle removing non-existent notification', () => {
      const store = createNotificationStore();
      store.add('info', 'Test');

      // Should not throw
      store.remove('non-existent-id');

      expect(store.getNotifications()).toHaveLength(1);
    });
  });

  describe('clearing notifications', () => {
    it('should clear all notifications', () => {
      const store = createNotificationStore();
      store.add('success', 'Message 1');
      store.add('error', 'Message 2');
      store.add('warning', 'Message 3');

      store.clear();

      expect(store.getNotifications()).toHaveLength(0);
    });

    it('should handle clearing empty store', () => {
      const store = createNotificationStore();

      // Should not throw
      store.clear();

      expect(store.getNotifications()).toHaveLength(0);
    });
  });

  describe('unique ids', () => {
    it('should generate unique ids', () => {
      const store = createNotificationStore();
      const id1 = store.add('info', 'Message 1');
      const id2 = store.add('info', 'Message 2');
      const id3 = store.add('info', 'Message 3');

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it('should generate unique ids across many notifications', () => {
      const store = createNotificationStore();
      const ids = new Set<string>();

      for (let i = 0; i < 100; i++) {
        ids.add(store.add('info', `Message ${i}`));
      }

      expect(ids.size).toBe(100);
    });
  });

  describe('getById', () => {
    it('should get notification by id', () => {
      const store = createNotificationStore();
      const id = store.add('success', 'Find me');

      const notification = store.getById(id);

      expect(notification).toBeDefined();
      expect(notification?.message).toBe('Find me');
    });

    it('should return undefined for non-existent id', () => {
      const store = createNotificationStore();

      const notification = store.getById('non-existent');

      expect(notification).toBeUndefined();
    });
  });
});
