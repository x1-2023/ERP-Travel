"use client"

import * as React from "react"

/**
 * Stagger delay calculator for list animations
 */
export function staggerDelay(index: number, baseDelay = 50, maxDelay = 500): number {
  return Math.min(index * baseDelay, maxDelay)
}

/**
 * Generate stagger animation style
 */
export function staggerStyle(index: number, baseDelay = 50): React.CSSProperties {
  return {
    animationDelay: `${staggerDelay(index, baseDelay)}ms`,
    animationFillMode: "both",
  }
}

/**
 * Intersection Observer hook for scroll animations
 */
export function useInView(
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit
): boolean {
  const [isInView, setIsInView] = React.useState(false)

  React.useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        threshold: 0.1,
        ...options,
      }
    )

    observer.observe(ref.current)

    return () => observer.disconnect()
  }, [ref, options])

  return isInView
}

/**
 * Animated counter hook
 */
export function useAnimatedCounter(
  end: number,
  duration = 1000,
  start = 0
): number {
  const [count, setCount] = React.useState(start)
  const frameRef = React.useRef<number>()

  React.useEffect(() => {
    const startTime = performance.now()
    const diff = end - start

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)

      setCount(Math.floor(start + diff * eased))

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [end, duration, start])

  return count
}

/**
 * Format number with Vietnamese locale
 */
export function formatNumber(value: number): string {
  return value.toLocaleString("vi-VN")
}

/**
 * Format currency (VND)
 */
export function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1).replace(".", ",")} tỷ ₫`
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(0)} triệu ₫`
  }
  return value.toLocaleString("vi-VN") + " ₫"
}
