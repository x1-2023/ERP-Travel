import { Loader2 } from "lucide-react"
import { Skeleton } from "./skeleton"

interface LoadingStateProps {
  /** "spinner" for inline loading, "skeleton" for content placeholder */
  variant?: "spinner" | "skeleton"
  /** Number of skeleton rows to show */
  rows?: number
  /** Message to display below spinner */
  message?: string
  className?: string
}

export function LoadingState({
  variant = "spinner",
  rows = 3,
  message = "Đang tải...",
  className,
}: LoadingStateProps) {
  if (variant === "skeleton") {
    return (
      <div className={`space-y-3 ${className || ""}`}>
        {Array.from({ length: rows }, (_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center justify-center py-8 ${className || ""}`}>
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      {message && (
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  )
}

/** Card-shaped loading skeleton for dashboard widgets */
export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-lg" />
      ))}
    </div>
  )
}

/** Table-shaped loading skeleton */
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex gap-2">
          {Array.from({ length: cols }, (_, j) => (
            <Skeleton key={j} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}
