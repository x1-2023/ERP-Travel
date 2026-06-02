"use client"

import * as React from "react"

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const

type Breakpoint = keyof typeof BREAKPOINTS

/**
 * Hook to detect current breakpoint
 */
export function useBreakpoint(): Breakpoint | null {
  const [breakpoint, setBreakpoint] = React.useState<Breakpoint | null>(null)

  React.useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth
      if (width >= BREAKPOINTS["2xl"]) setBreakpoint("2xl")
      else if (width >= BREAKPOINTS.xl) setBreakpoint("xl")
      else if (width >= BREAKPOINTS.lg) setBreakpoint("lg")
      else if (width >= BREAKPOINTS.md) setBreakpoint("md")
      else if (width >= BREAKPOINTS.sm) setBreakpoint("sm")
      else setBreakpoint(null)
    }

    checkBreakpoint()
    window.addEventListener("resize", checkBreakpoint)
    return () => window.removeEventListener("resize", checkBreakpoint)
  }, [])

  return breakpoint
}

/**
 * Hook to check if screen matches a media query
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false)

  React.useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = () => setMatches(media.matches)
    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [query, matches])

  return matches
}

/**
 * Hook for mobile detection (< 768px)
 */
export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width: ${BREAKPOINTS.md - 1}px)`)
}

/**
 * Hook for tablet detection (768px - 1024px)
 */
export function useIsTablet(): boolean {
  return useMediaQuery(
    `(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`
  )
}

/**
 * Hook for desktop detection (> 1024px)
 */
export function useIsDesktop(): boolean {
  return useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`)
}
