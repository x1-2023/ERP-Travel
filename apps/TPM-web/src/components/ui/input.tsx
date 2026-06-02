import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base
          "flex h-8 w-full rounded border px-3 py-1.5",
          "text-sm font-mono text-foreground placeholder:text-foreground-subtle",
          "bg-background border-surface-border",
          // Focus
          "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
          // Disabled
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface",
          // File input
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          // Transitions
          "transition-colors duration-150",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
