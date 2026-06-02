// src/lib/animations.ts
// Animation utilities for UI polish

import { useState, useEffect, useCallback } from 'react'

// ═══════════════════════════════════════════════════════════════
// CSS ANIMATION KEYFRAMES (for use with Tailwind)
// ═══════════════════════════════════════════════════════════════

// These can be added to tailwind.config.js
export const animationConfig = {
  keyframes: {
    'fade-in': {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' }
    },
    'fade-out': {
      '0%': { opacity: '1' },
      '100%': { opacity: '0' }
    },
    'slide-in-right': {
      '0%': { transform: 'translateX(100%)', opacity: '0' },
      '100%': { transform: 'translateX(0)', opacity: '1' }
    },
    'slide-in-left': {
      '0%': { transform: 'translateX(-100%)', opacity: '0' },
      '100%': { transform: 'translateX(0)', opacity: '1' }
    },
    'slide-in-up': {
      '0%': { transform: 'translateY(100%)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' }
    },
    'slide-in-down': {
      '0%': { transform: 'translateY(-100%)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' }
    },
    'scale-in': {
      '0%': { transform: 'scale(0.9)', opacity: '0' },
      '100%': { transform: 'scale(1)', opacity: '1' }
    },
    'scale-out': {
      '0%': { transform: 'scale(1)', opacity: '1' },
      '100%': { transform: 'scale(0.9)', opacity: '0' }
    },
    'bounce-in': {
      '0%': { transform: 'scale(0.3)', opacity: '0' },
      '50%': { transform: 'scale(1.05)' },
      '70%': { transform: 'scale(0.9)' },
      '100%': { transform: 'scale(1)', opacity: '1' }
    },
    shimmer: {
      '0%': { backgroundPosition: '-200% 0' },
      '100%': { backgroundPosition: '200% 0' }
    }
  },
  animation: {
    'fade-in': 'fade-in 0.3s ease-out',
    'fade-out': 'fade-out 0.2s ease-in',
    'slide-in-right': 'slide-in-right 0.3s ease-out',
    'slide-in-left': 'slide-in-left 0.3s ease-out',
    'slide-in-up': 'slide-in-up 0.3s ease-out',
    'slide-in-down': 'slide-in-down 0.3s ease-out',
    'scale-in': 'scale-in 0.2s ease-out',
    'scale-out': 'scale-out 0.2s ease-in',
    'bounce-in': 'bounce-in 0.5s ease-out',
    shimmer: 'shimmer 2s linear infinite'
  }
}

// ═══════════════════════════════════════════════════════════════
// ANIMATION CLASSES
// ═══════════════════════════════════════════════════════════════

// Page transition classes
export const pageTransition = {
  initial: 'opacity-0 translate-y-4',
  animate: 'opacity-100 translate-y-0 transition-all duration-300 ease-out',
  exit: 'opacity-0 -translate-y-4 transition-all duration-200 ease-in'
}

// Card hover effect classes
export const cardHover = {
  base: 'transition-all duration-200 ease-out',
  hover: 'hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10'
}

// List item stagger animation
export const staggerItem = {
  base: 'opacity-0 translate-y-4',
  visible: 'opacity-100 translate-y-0 transition-all duration-300 ease-out'
}

// ═══════════════════════════════════════════════════════════════
// ANIMATION HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Number counter animation hook
 */
export function useCountUp(
  end: number,
  options: {
    duration?: number
    startOnMount?: boolean
    decimals?: number
  } = {}
) {
  const { duration = 1000, startOnMount = true, decimals = 0 } = options
  const [count, setCount] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const animate = useCallback(() => {
    setIsAnimating(true)
    const startTime = performance.now()

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentValue = easeOut * end

      setCount(decimals > 0 ? parseFloat(currentValue.toFixed(decimals)) : Math.floor(currentValue))

      if (progress < 1) {
        requestAnimationFrame(step)
      } else {
        setIsAnimating(false)
      }
    }

    requestAnimationFrame(step)
  }, [end, duration, decimals])

  useEffect(() => {
    if (startOnMount) {
      animate()
    }
  }, [startOnMount, animate])

  return { count, isAnimating, animate }
}

/**
 * Stagger animation hook for lists
 */
export function useStaggerAnimation(itemCount: number, delay: number = 100) {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())

  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    for (let i = 0; i < itemCount; i++) {
      const timer = setTimeout(() => {
        setVisibleItems(prev => new Set(Array.from(prev).concat(i)))
      }, i * delay)
      timers.push(timer)
    }

    return () => timers.forEach(clearTimeout)
  }, [itemCount, delay])

  const isVisible = (index: number) => visibleItems.has(index)
  const getDelay = (index: number) => `${index * delay}ms`

  return { isVisible, getDelay }
}

/**
 * Intersection observer hook for scroll animations
 */
export function useInView(
  options: IntersectionObserverInit = { threshold: 0.1, triggerOnce: true } as any
) {
  const [ref, setRef] = useState<HTMLElement | null>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    if (!ref) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true)
        if ((options as any).triggerOnce) {
          observer.disconnect()
        }
      } else if (!(options as any).triggerOnce) {
        setIsInView(false)
      }
    }, options)

    observer.observe(ref)

    return () => observer.disconnect()
  }, [ref, options])

  return { ref: setRef, isInView }
}

/**
 * Typing animation hook
 */
export function useTypewriter(
  text: string,
  options: { speed?: number; delay?: number } = {}
) {
  const { speed = 50, delay = 0 } = options
  const [displayText, setDisplayText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    let timeout: NodeJS.Timeout
    let currentIndex = 0

    const startTyping = () => {
      setIsTyping(true)
      const type = () => {
        if (currentIndex < text.length) {
          setDisplayText(text.slice(0, currentIndex + 1))
          currentIndex++
          timeout = setTimeout(type, speed)
        } else {
          setIsTyping(false)
        }
      }
      type()
    }

    timeout = setTimeout(startTyping, delay)

    return () => clearTimeout(timeout)
  }, [text, speed, delay])

  return { displayText, isTyping }
}

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Get stagger delay style for an item
 */
export function getStaggerDelay(index: number, baseDelay: number = 50): string {
  return `${index * baseDelay}ms`
}

/**
 * Create transition style object
 */
export function createTransition(
  properties: string[],
  duration: number = 300,
  easing: string = 'ease-out'
): React.CSSProperties {
  return {
    transitionProperty: properties.join(', '),
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: easing
  }
}
