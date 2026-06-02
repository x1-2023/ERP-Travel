"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FileQuestion, Plus, Search, AlertCircle } from "lucide-react"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  variant?: "default" | "search" | "error"
  className?: string
}

const variantConfig = {
  default: { icon: FileQuestion, iconClassName: "text-muted-foreground" },
  search: { icon: Search, iconClassName: "text-muted-foreground" },
  error: { icon: AlertCircle, iconClassName: "text-destructive" },
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "default",
  className,
}: EmptyStateProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-elevated flex items-center justify-center mb-4 animate-fade-in">
        {React.isValidElement(icon) ? (
          icon
        ) : (
          <Icon className={cn("w-8 h-8", config.iconClassName)} />
        )}
      </div>
      <h3 className="text-lg font-semibold mb-1 animate-fade-in-up">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4 animate-fade-in-up">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} className="animate-fade-in-up">
          <Plus className="w-4 h-4 mr-2" />
          {action.label}
        </Button>
      )}
    </div>
  )
}
