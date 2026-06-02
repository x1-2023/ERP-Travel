import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  [
    "inline-flex items-center gap-1.5",
    "px-2 py-0.5",
    "text-2xs font-semibold uppercase tracking-wide",
    "rounded border",
    "transition-colors",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-surface text-foreground border-surface-border",

        // Status variants - Solid colors for better readability
        draft: "bg-slate-500 text-white border-slate-600 dark:bg-slate-600 dark:border-slate-700",
        pending: "bg-amber-500 text-white border-amber-600 dark:bg-amber-600 dark:border-amber-700",
        approved: "bg-blue-500 text-white border-blue-600 dark:bg-blue-600 dark:border-blue-700",
        active: "bg-emerald-600 text-white border-emerald-700 dark:bg-emerald-500 dark:border-emerald-600",
        completed: "bg-violet-500 text-white border-violet-600 dark:bg-violet-600 dark:border-violet-700",
        cancelled: "bg-red-500 text-white border-red-600 dark:bg-red-600 dark:border-red-700",
        rejected: "bg-red-500 text-white border-red-600 dark:bg-red-600 dark:border-red-700",
        paid: "bg-emerald-600 text-white border-emerald-700 dark:bg-emerald-500 dark:border-emerald-600",

        // Semantic variants - Solid colors for better readability
        success: "bg-emerald-600 text-white border-emerald-700 dark:bg-emerald-500 dark:border-emerald-600",
        warning: "bg-amber-500 text-white border-amber-600 dark:bg-amber-600 dark:border-amber-700",
        danger: "bg-red-500 text-white border-red-600 dark:bg-red-600 dark:border-red-700",
        info: "bg-blue-500 text-white border-blue-600 dark:bg-blue-600 dark:border-blue-700",

        // Legacy variants for compatibility - Solid colors
        secondary: "bg-slate-500 text-white border-slate-600 dark:bg-slate-600 dark:border-slate-700",
        destructive: "bg-red-500 text-white border-red-600 dark:bg-red-600 dark:border-red-700",
        error: "bg-red-500 text-white border-red-600 dark:bg-red-600 dark:border-red-700",

        // Outline variants
        outline: "bg-transparent text-foreground border-surface-border",
        "outline-primary": "bg-transparent text-primary border-primary/50",
        "outline-success": "bg-transparent text-success border-success/50",
        "outline-warning": "bg-transparent text-warning border-warning/50",
        "outline-danger": "bg-transparent text-danger border-danger/50",
      },
      size: {
        default: "px-2 py-0.5 text-2xs",
        sm: "px-1.5 py-0 text-2xs",
        lg: "px-2.5 py-1 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
