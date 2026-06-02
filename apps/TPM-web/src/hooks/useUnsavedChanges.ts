/**
 * Sprint 1 Fix 6: Unsaved Changes Warning
 * Prevents accidental data loss when navigating away from dirty forms.
 */

import { useEffect, useCallback } from 'react';
import { useBlocker } from 'react-router-dom';

interface UseUnsavedChangesOptions {
  enabled?: boolean;
  message?: string;
}

export function useUnsavedChanges(
  isDirty: boolean,
  options: UseUnsavedChangesOptions = {}
) {
  const {
    enabled = true,
    message = 'Bạn có thay đổi chưa lưu. Bạn có chắc muốn rời khỏi trang này?',
  } = options;

  // Block navigation within React Router
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      enabled && isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  // Handle browser back/refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (enabled && isDirty) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled, isDirty, message]);

  const confirmNavigation = useCallback(() => {
    if (blocker.state === 'blocked') {
      blocker.proceed();
    }
  }, [blocker]);

  const cancelNavigation = useCallback(() => {
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
  }, [blocker]);

  return {
    isBlocked: blocker.state === 'blocked',
    confirmNavigation,
    cancelNavigation,
    message,
  };
}
