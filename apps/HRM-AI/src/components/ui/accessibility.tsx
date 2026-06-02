'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

// ═══════════════════════════════════════════════════════════════
// VISUALLY HIDDEN
// ═══════════════════════════════════════════════════════════════

interface VisuallyHiddenProps {
  children: React.ReactNode
  asChild?: boolean
}

export function VisuallyHidden({ children, asChild }: VisuallyHiddenProps) {
  const style: React.CSSProperties = {
    position: 'absolute',
    border: 0,
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    wordWrap: 'normal'
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, { style })
  }

  return <span style={style}>{children}</span>
}

// ═══════════════════════════════════════════════════════════════
// SKIP TO MAIN CONTENT
// ═══════════════════════════════════════════════════════════════

interface SkipToMainProps {
  mainId?: string
  className?: string
}

export function SkipToMain({ mainId = 'main-content', className }: SkipToMainProps) {
  return (
    <a
      href={`#${mainId}`}
      className={cn(
        'sr-only focus:not-sr-only',
        'focus:absolute focus:top-4 focus:left-4 focus:z-50',
        'focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground',
        'focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring',
        className
      )}
    >
      Chuyển đến nội dung chính
    </a>
  )
}

// ═══════════════════════════════════════════════════════════════
// FOCUS TRAP
// ═══════════════════════════════════════════════════════════════

interface FocusTrapProps {
  children: React.ReactNode
  active?: boolean
}

export function FocusTrap({ children, active = true }: FocusTrapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!active) return

    const container = containerRef.current
    if (!container) return

    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    firstElement?.focus()

    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [active])

  return <div ref={containerRef}>{children}</div>
}

// ═══════════════════════════════════════════════════════════════
// LIVE REGION (for screen reader announcements)
// ═══════════════════════════════════════════════════════════════

interface LiveRegionProps {
  message: string
  politeness?: 'polite' | 'assertive'
  className?: string
}

export function LiveRegion({ message, politeness = 'polite', className }: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className={cn('sr-only', className)}
    >
      {message}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// ANNOUNCE HOOK (for dynamic announcements)
// ═══════════════════════════════════════════════════════════════

export function useAnnounce() {
  const [message, setMessage] = React.useState('')

  const announce = React.useCallback((text: string, delay: number = 100) => {
    // Clear first to ensure re-announcement
    setMessage('')
    setTimeout(() => setMessage(text), delay)
  }, [])

  const Announcer = React.useCallback(
    () => <LiveRegion message={message} />,
    [message]
  )

  return { announce, Announcer }
}

// ═══════════════════════════════════════════════════════════════
// REDUCED MOTION HOOK
// ═══════════════════════════════════════════════════════════════

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', listener)
    return () => mediaQuery.removeEventListener('change', listener)
  }, [])

  return prefersReducedMotion
}

// ═══════════════════════════════════════════════════════════════
// KEYBOARD NAVIGATION HELPERS
// ═══════════════════════════════════════════════════════════════

export function useKeyboardNavigation<T extends HTMLElement>(
  items: T[],
  options: {
    orientation?: 'horizontal' | 'vertical' | 'both'
    loop?: boolean
  } = {}
) {
  const { orientation = 'vertical', loop = true } = options
  const [activeIndex, setActiveIndex] = React.useState(0)

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      const isVertical = orientation === 'vertical' || orientation === 'both'
      const isHorizontal = orientation === 'horizontal' || orientation === 'both'

      let newIndex = activeIndex

      switch (e.key) {
        case 'ArrowDown':
          if (isVertical) {
            e.preventDefault()
            newIndex = activeIndex + 1
          }
          break
        case 'ArrowUp':
          if (isVertical) {
            e.preventDefault()
            newIndex = activeIndex - 1
          }
          break
        case 'ArrowRight':
          if (isHorizontal) {
            e.preventDefault()
            newIndex = activeIndex + 1
          }
          break
        case 'ArrowLeft':
          if (isHorizontal) {
            e.preventDefault()
            newIndex = activeIndex - 1
          }
          break
        case 'Home':
          e.preventDefault()
          newIndex = 0
          break
        case 'End':
          e.preventDefault()
          newIndex = items.length - 1
          break
        default:
          return
      }

      // Handle boundaries
      if (loop) {
        if (newIndex < 0) newIndex = items.length - 1
        if (newIndex >= items.length) newIndex = 0
      } else {
        newIndex = Math.max(0, Math.min(items.length - 1, newIndex))
      }

      setActiveIndex(newIndex)
      items[newIndex]?.focus()
    },
    [activeIndex, items, loop, orientation]
  )

  return { activeIndex, setActiveIndex, handleKeyDown }
}
