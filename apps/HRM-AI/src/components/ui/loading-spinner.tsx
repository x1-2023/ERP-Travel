'use client'

import { cn } from '@/lib/utils'

// ═══════════════════════════════════════════════════════════════
// LOADING SPINNER
// ═══════════════════════════════════════════════════════════════

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  color?: 'primary' | 'secondary' | 'white'
}

const sizeClasses = {
  xs: 'h-3 w-3 border',
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3',
  xl: 'h-16 w-16 border-4'
}

const colorClasses = {
  primary: 'border-primary border-t-transparent',
  secondary: 'border-muted-foreground border-t-transparent',
  white: 'border-white border-t-transparent'
}

export function LoadingSpinner({
  size = 'md',
  className,
  color = 'primary'
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// PAGE LOADING
// ═══════════════════════════════════════════════════════════════

interface PageLoadingProps {
  text?: string
  fullScreen?: boolean
}

export function PageLoading({ text = 'Đang tải...', fullScreen = true }: PageLoadingProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-background/80 backdrop-blur-sm z-50',
        fullScreen ? 'fixed inset-0' : 'absolute inset-0 min-h-[200px]'
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// BUTTON LOADING STATE
// ═══════════════════════════════════════════════════════════════

interface ButtonLoadingProps {
  text?: string
  className?: string
}

export function ButtonLoading({ text = 'Đang xử lý...', className }: ButtonLoadingProps) {
  return (
    <span className={cn('flex items-center gap-2', className)}>
      <LoadingSpinner size="sm" color="white" />
      {text}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════
// INLINE LOADING
// ═══════════════════════════════════════════════════════════════

interface InlineLoadingProps {
  text?: string
  className?: string
}

export function InlineLoading({ text, className }: InlineLoadingProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LoadingSpinner size="xs" />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════
// LOADING DOTS
// ═══════════════════════════════════════════════════════════════

interface LoadingDotsProps {
  className?: string
}

export function LoadingDots({ className }: LoadingDotsProps) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
      <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
      <span className="h-2 w-2 rounded-full bg-primary animate-bounce" />
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════
// SHIMMER LOADING (for content placeholders)
// ═══════════════════════════════════════════════════════════════

interface ShimmerProps {
  className?: string
  children?: React.ReactNode
}

export function Shimmer({ className, children }: ShimmerProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-muted rounded',
        'before:absolute before:inset-0',
        'before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
        'before:animate-[shimmer_2s_infinite]',
        className
      )}
    >
      {children}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// DATA LOADING STATE
// ═══════════════════════════════════════════════════════════════

interface DataLoadingProps {
  rows?: number
  className?: string
}

export function DataLoading({ rows = 5, className }: DataLoadingProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Shimmer className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Shimmer className="h-4 w-3/4" />
            <Shimmer className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
