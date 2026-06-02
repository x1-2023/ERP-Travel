'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'

// ═══════════════════════════════════════════════════════════════
// Touch Button - Larger hit area for mobile
// ═══════════════════════════════════════════════════════════════

interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const TouchButton = React.forwardRef<HTMLButtonElement, TouchButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all touch-manipulation active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none'

    const variants = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80',
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70',
      outline: 'border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    }

    const sizes = {
      sm: 'h-10 px-4 text-sm min-w-[80px]',
      md: 'h-12 px-6 text-base min-w-[100px]',
      lg: 'h-14 px-8 text-lg min-w-[120px]',
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </button>
    )
  }
)
TouchButton.displayName = 'TouchButton'

// ═══════════════════════════════════════════════════════════════
// Touch Card - Tappable card for lists
// ═══════════════════════════════════════════════════════════════

interface TouchCardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: 'div' | 'button' | 'a'
  href?: string
  showArrow?: boolean
  isPressed?: boolean
  variant?: 'default' | 'elevated' | 'outlined'
}

export function TouchCard({
  className,
  as = 'div',
  href,
  showArrow = false,
  isPressed = false,
  variant = 'default',
  children,
  ...props
}: TouchCardProps) {
  const baseStyles =
    'relative block w-full text-left rounded-xl transition-all touch-manipulation'

  const variants = {
    default: 'bg-card border hover:bg-accent/50 active:bg-accent',
    elevated: 'bg-card shadow-md hover:shadow-lg active:shadow-sm',
    outlined: 'border-2 hover:border-primary/50 active:border-primary',
  }

  const content = (
    <>
      {children}
      {showArrow && (
        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      )}
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        className={cn(
          baseStyles,
          variants[variant],
          isPressed && 'scale-[0.98] bg-accent',
          className
        )}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </a>
    )
  }

  if (as === 'button') {
    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          isPressed && 'scale-[0.98] bg-accent',
          className
        )}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    )
  }

  return (
    <div
      className={cn(
        baseStyles,
        variants[variant],
        isPressed && 'scale-[0.98] bg-accent',
        className
      )}
      {...(props as React.HTMLAttributes<HTMLDivElement>)}
    >
      {content}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Touch List Item - For navigation lists
// ═══════════════════════════════════════════════════════════════

interface TouchListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  title: string
  subtitle?: string
  trailing?: React.ReactNode
  showArrow?: boolean
  href?: string
  destructive?: boolean
}

export function TouchListItem({
  className,
  icon,
  title,
  subtitle,
  trailing,
  showArrow = true,
  href,
  destructive = false,
  onClick,
  ...props
}: TouchListItemProps) {
  const content = (
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-xl transition-all touch-manipulation',
        'hover:bg-accent/50 active:bg-accent active:scale-[0.99]',
        destructive && 'text-destructive',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {icon && (
        <div
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
            destructive ? 'bg-destructive/10' : 'bg-muted'
          )}
        >
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{title}</p>
        {subtitle && (
          <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
        )}
      </div>
      {trailing}
      {showArrow && !trailing && (
        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
      )}
    </div>
  )

  if (href) {
    return <a href={href}>{content}</a>
  }

  return content
}

// ═══════════════════════════════════════════════════════════════
// Touch Fab - Floating Action Button
// ═══════════════════════════════════════════════════════════════

interface TouchFabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  label?: string
  position?: 'bottom-right' | 'bottom-center' | 'bottom-left'
  extended?: boolean
}

export function TouchFab({
  className,
  icon,
  label,
  position = 'bottom-right',
  extended = false,
  ...props
}: TouchFabProps) {
  const positions = {
    'bottom-right': 'right-4 bottom-20',
    'bottom-center': 'left-1/2 -translate-x-1/2 bottom-20',
    'bottom-left': 'left-4 bottom-20',
  }

  return (
    <button
      className={cn(
        'fixed z-40 flex items-center justify-center gap-2',
        'bg-primary text-primary-foreground shadow-lg',
        'rounded-full transition-all touch-manipulation',
        'hover:shadow-xl active:scale-95',
        extended ? 'h-14 px-6' : 'h-14 w-14',
        positions[position],
        'md:hidden', // Only show on mobile
        className
      )}
      {...props}
    >
      {icon}
      {extended && label && <span className="font-semibold">{label}</span>}
    </button>
  )
}

// ═══════════════════════════════════════════════════════════════
// Touch Swipe Actions - For swipeable list items
// ═══════════════════════════════════════════════════════════════

interface SwipeAction {
  icon: React.ReactNode
  label: string
  color: string
  onClick: () => void
}

interface TouchSwipeActionsProps {
  children: React.ReactNode
  leftActions?: SwipeAction[]
  rightActions?: SwipeAction[]
}

export function TouchSwipeActions({
  children,
  leftActions = [],
  rightActions = [],
}: TouchSwipeActionsProps) {
  const [translateX, setTranslateX] = React.useState(0)
  const [startX, setStartX] = React.useState(0)
  const [isSwiping, setIsSwiping] = React.useState(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX)
    setIsSwiping(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return

    const currentX = e.touches[0].clientX
    const diff = currentX - startX

    // Limit swipe distance
    const maxSwipe = 100
    const limitedDiff = Math.max(-maxSwipe, Math.min(maxSwipe, diff))

    // Only allow swipe if we have actions in that direction
    if ((diff > 0 && leftActions.length === 0) || (diff < 0 && rightActions.length === 0)) {
      return
    }

    setTranslateX(limitedDiff)
  }

  const handleTouchEnd = () => {
    setIsSwiping(false)
    // Snap back or trigger action
    if (Math.abs(translateX) > 60) {
      // Trigger action
      const action = translateX > 0 ? leftActions[0] : rightActions[0]
      action?.onClick()
    }
    setTranslateX(0)
  }

  return (
    <div className="relative overflow-hidden">
      {/* Left actions background */}
      {leftActions.length > 0 && translateX > 0 && (
        <div
          className="absolute inset-y-0 left-0 flex items-center px-4"
          style={{ backgroundColor: leftActions[0]?.color }}
        >
          {leftActions[0]?.icon}
        </div>
      )}

      {/* Right actions background */}
      {rightActions.length > 0 && translateX < 0 && (
        <div
          className="absolute inset-y-0 right-0 flex items-center px-4"
          style={{ backgroundColor: rightActions[0]?.color }}
        >
          {rightActions[0]?.icon}
        </div>
      )}

      {/* Content */}
      <div
        className="relative bg-background transition-transform"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.2s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Touch Pull To Refresh
// ═══════════════════════════════════════════════════════════════

interface TouchPullToRefreshProps {
  children: React.ReactNode
  onRefresh: () => Promise<void>
  threshold?: number
}

export function TouchPullToRefresh({
  children,
  onRefresh,
  threshold = 80,
}: TouchPullToRefreshProps) {
  const [pullDistance, setPullDistance] = React.useState(0)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [startY, setStartY] = React.useState(0)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      setStartY(e.touches[0].clientY)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === 0 || isRefreshing) return

    const currentY = e.touches[0].clientY
    const diff = currentY - startY

    if (diff > 0 && containerRef.current?.scrollTop === 0) {
      setPullDistance(Math.min(diff * 0.5, threshold * 1.5))
    }
  }

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      setPullDistance(threshold)
      await onRefresh()
      setIsRefreshing(false)
    }
    setPullDistance(0)
    setStartY(0)
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full overflow-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center transition-opacity"
        style={{
          top: pullDistance - 40,
          opacity: pullDistance / threshold,
        }}
      >
        <div
          className={cn(
            'h-8 w-8 rounded-full border-2 border-primary',
            isRefreshing ? 'animate-spin border-t-transparent' : ''
          )}
        />
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance === 0 ? 'transform 0.2s ease-out' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  )
}
