/**
 * useToast Hook Tests
 */

import { describe, it, expect } from 'vitest';
import { reducer } from '@/hooks/useToast';

describe('toast reducer', () => {
  const createToast = (overrides = {}) => ({
    id: 'test-id',
    title: 'Test Title',
    description: 'Test Description',
    open: true,
    onOpenChange: () => {},
    ...overrides,
  });

  describe('ADD_TOAST', () => {
    it('should add a toast to the beginning of the list', () => {
      const initialState = { toasts: [] };
      const newToast = createToast();

      const result = reducer(initialState, {
        type: 'ADD_TOAST',
        toast: newToast,
      });

      expect(result.toasts).toHaveLength(1);
      expect(result.toasts[0]).toEqual(newToast);
    });

    it('should limit toasts to TOAST_LIMIT (1)', () => {
      const existingToast = createToast({ id: 'existing' });
      const initialState = { toasts: [existingToast] };
      const newToast = createToast({ id: 'new' });

      const result = reducer(initialState, {
        type: 'ADD_TOAST',
        toast: newToast,
      });

      // Only the newest toast should remain due to TOAST_LIMIT = 1
      expect(result.toasts).toHaveLength(1);
      expect(result.toasts[0].id).toBe('new');
    });
  });

  describe('UPDATE_TOAST', () => {
    it('should update an existing toast', () => {
      const toast = createToast();
      const initialState = { toasts: [toast] };

      const result = reducer(initialState, {
        type: 'UPDATE_TOAST',
        toast: { id: 'test-id', title: 'Updated Title' },
      });

      expect(result.toasts[0].title).toBe('Updated Title');
      expect(result.toasts[0].description).toBe('Test Description');
    });

    it('should not update non-matching toasts', () => {
      const toast = createToast();
      const initialState = { toasts: [toast] };

      const result = reducer(initialState, {
        type: 'UPDATE_TOAST',
        toast: { id: 'different-id', title: 'Updated Title' },
      });

      expect(result.toasts[0].title).toBe('Test Title');
    });
  });

  describe('DISMISS_TOAST', () => {
    it('should set open to false for specific toast', () => {
      const toast = createToast();
      const initialState = { toasts: [toast] };

      const result = reducer(initialState, {
        type: 'DISMISS_TOAST',
        toastId: 'test-id',
      });

      expect(result.toasts[0].open).toBe(false);
    });

    it('should dismiss all toasts when no toastId provided', () => {
      const toast1 = createToast({ id: 'toast-1' });
      const toast2 = createToast({ id: 'toast-2' });
      const initialState = { toasts: [toast1, toast2] };

      const result = reducer(initialState, {
        type: 'DISMISS_TOAST',
        toastId: undefined,
      });

      expect(result.toasts.every(t => t.open === false)).toBe(true);
    });
  });

  describe('REMOVE_TOAST', () => {
    it('should remove a specific toast', () => {
      const toast = createToast();
      const initialState = { toasts: [toast] };

      const result = reducer(initialState, {
        type: 'REMOVE_TOAST',
        toastId: 'test-id',
      });

      expect(result.toasts).toHaveLength(0);
    });

    it('should remove all toasts when no toastId provided', () => {
      const toast1 = createToast({ id: 'toast-1' });
      const toast2 = createToast({ id: 'toast-2' });
      const initialState = { toasts: [toast1, toast2] };

      const result = reducer(initialState, {
        type: 'REMOVE_TOAST',
        toastId: undefined,
      });

      expect(result.toasts).toHaveLength(0);
    });

    it('should not remove non-matching toasts', () => {
      const toast = createToast();
      const initialState = { toasts: [toast] };

      const result = reducer(initialState, {
        type: 'REMOVE_TOAST',
        toastId: 'different-id',
      });

      expect(result.toasts).toHaveLength(1);
    });
  });
});
