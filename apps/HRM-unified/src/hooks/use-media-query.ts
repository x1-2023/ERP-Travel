'use client'

import { useState, useEffect, useCallback } from 'react'

// ═══════════════════════════════════════════════════════════════
// MEDIA QUERY HOOK
// ═══════════════════════════════════════════════════════════════

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)

    // Set initial value
    setMatches(media.matches)

    // Create listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add listener
    media.addEventListener('change', listener)

    // Cleanup
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

// ═══════════════════════════════════════════════════════════════
// BREAKPOINT HOOKS
// ═══════════════════════════════════════════════════════════════

// Tailwind default breakpoints
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
}

export function useBreakpoint() {
  const isMobile = useMediaQuery('(max-width: 639px)')
  const isTablet = useMediaQuery('(min-width: 640px) and (max-width: 1023px)')
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const isLargeDesktop = useMediaQuery('(min-width: 1280px)')

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    // Utility checks
    isMobileOrTablet: isMobile || isTablet,
    isDesktopOrLarger: isDesktop || isLargeDesktop
  }
}

// Individual breakpoint hooks
export function useIsMobile() {
  return useMediaQuery(`(max-width: ${breakpoints.sm})`)
}

export function useIsTablet() {
  return useMediaQuery(`(min-width: ${breakpoints.sm}) and (max-width: ${breakpoints.lg})`)
}

export function useIsDesktop() {
  return useMediaQuery(`(min-width: ${breakpoints.lg})`)
}

// ═══════════════════════════════════════════════════════════════
// OTHER MEDIA QUERIES
// ═══════════════════════════════════════════════════════════════

export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)')
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

export function useIsTouch(): boolean {
  return useMediaQuery('(hover: none) and (pointer: coarse)')
}

// ═══════════════════════════════════════════════════════════════
// WINDOW SIZE HOOK
// ═══════════════════════════════════════════════════════════════

interface WindowSize {
  width: number
  height: number
}

export function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  })

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}

// ═══════════════════════════════════════════════════════════════
// RESPONSIVE VALUE HOOK
// ═══════════════════════════════════════════════════════════════

interface ResponsiveValues<T> {
  mobile: T
  tablet?: T
  desktop?: T
}

export function useResponsiveValue<T>(values: ResponsiveValues<T>): T {
  const { isMobile, isTablet } = useBreakpoint()

  if (isMobile) return values.mobile
  if (isTablet) return values.tablet ?? values.mobile
  return values.desktop ?? values.tablet ?? values.mobile
}
