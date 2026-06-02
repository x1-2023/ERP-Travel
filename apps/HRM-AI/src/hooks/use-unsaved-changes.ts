// src/hooks/use-unsaved-changes.ts
// Warn users before navigating away from forms with unsaved changes

'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface UseUnsavedChangesOptions {
  /** Whether the form has unsaved changes */
  hasChanges: boolean
  /** Custom warning message */
  message?: string
  /** Whether the warning is enabled (default: true) */
  enabled?: boolean
}

const DEFAULT_MESSAGE = 'Bạn có thay đổi chưa lưu. Bạn có chắc muốn rời trang?'

/**
 * Hook to warn users before navigating away from a page with unsaved changes.
 * Handles both browser navigation (back/forward/close) and Next.js client navigation.
 *
 * Usage:
 * ```tsx
 * const [isDirty, setIsDirty] = useState(false)
 * useUnsavedChanges({ hasChanges: isDirty })
 *
 * // Mark as dirty when form changes
 * const handleChange = (value) => {
 *   setFormData(value)
 *   setIsDirty(true)
 * }
 *
 * // Clear dirty state after save
 * const handleSave = async () => {
 *   await save()
 *   setIsDirty(false)
 * }
 * ```
 */
export function useUnsavedChanges({
  hasChanges,
  message = DEFAULT_MESSAGE,
  enabled = true,
}: UseUnsavedChangesOptions): void {
  const hasChangesRef = useRef(hasChanges)
  hasChangesRef.current = hasChanges

  // Browser beforeunload event (handles tab close, refresh, browser back)
  useEffect(() => {
    if (!enabled) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasChangesRef.current) return
      e.preventDefault()
      // Modern browsers show their own message, but returnValue is required
      e.returnValue = message
      return message
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [enabled, message])

  // Next.js popstate event (handles browser back/forward within SPA)
  useEffect(() => {
    if (!enabled) return

    const handlePopState = () => {
      if (hasChangesRef.current) {
        if (!window.confirm(message)) {
          // Push the current URL back to prevent navigation
          window.history.pushState(null, '', window.location.href)
        }
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [enabled, message])
}

/**
 * Hook that returns a navigation guard function.
 * Use this when you need programmatic control over when to show the warning.
 *
 * Usage:
 * ```tsx
 * const guardNavigation = useNavigationGuard(isDirty)
 *
 * const handleNavigate = (path: string) => {
 *   if (guardNavigation()) {
 *     router.push(path)
 *   }
 * }
 * ```
 */
export function useNavigationGuard(
  hasChanges: boolean,
  message: string = DEFAULT_MESSAGE
): () => boolean {
  const hasChangesRef = useRef(hasChanges)
  hasChangesRef.current = hasChanges

  return useCallback(() => {
    if (!hasChangesRef.current) return true
    return window.confirm(message)
  }, [message])
}
