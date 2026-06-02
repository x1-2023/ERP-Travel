"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MoreHorizontal } from "lucide-react"

interface PageHeaderAction {
  label: string
  onClick: () => void
  icon?: React.ReactNode
  variant?: "default" | "outline" | "ghost" | "destructive"
}

interface PageHeaderProps {
  title: string
  description?: string
  backHref?: string
  actions?: PageHeaderAction[]
  moreActions?: PageHeaderAction[]
  className?: string
  children?: React.ReactNode
}

export function PageHeader({
  title,
  description,
  backHref,
  actions,
  moreActions,
  className,
  children,
}: PageHeaderProps) {
  const [showMore, setShowMore] = React.useState(false)
  const moreRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setShowMore(false)
      }
    }
    if (showMore) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showMore])

  return (
    <div className={cn("flex flex-col gap-1 mb-6", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {backHref && (
            <Link
              href={backHref}
              className="shrink-0 p-1.5 -ml-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-elevated transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
          )}
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight truncate">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5 truncate">
                {description}
              </p>
            )}
          </div>
        </div>

        {(actions || moreActions) && (
          <div className="flex items-center gap-2 shrink-0">
            {actions?.map((action) => (
              <Button
                key={action.label}
                variant={action.variant || "default"}
                size="sm"
                onClick={action.onClick}
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                <span className="hidden sm:inline">{action.label}</span>
              </Button>
            ))}

            {moreActions && moreActions.length > 0 && (
              <div className="relative" ref={moreRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMore(!showMore)}
                  className="px-2"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>

                {showMore && (
                  <div className="absolute right-0 top-full mt-1 w-48 py-1 bg-card border border-border rounded-lg shadow-elevated z-50 animate-fade-in-up-fast">
                    {moreActions.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => {
                          action.onClick()
                          setShowMore(false)
                        }}
                        className={cn(
                          "w-full px-3 py-2 text-sm text-left hover:bg-elevated transition-colors flex items-center gap-2",
                          action.variant === "destructive" && "text-destructive"
                        )}
                      >
                        {action.icon}
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      {children}
    </div>
  )
}
