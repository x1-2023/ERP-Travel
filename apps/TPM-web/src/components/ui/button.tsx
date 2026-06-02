import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base styles - Industrial
  [
    "inline-flex items-center justify-center gap-2",
    "text-xs font-semibold uppercase tracking-wide",
    "whitespace-nowrap rounded transition-all duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.98]",
  ].join(" "),
  {
    variants: {
      variant: {
        // Primary - High emphasis action
        default: [
          "bg-primary text-primary-foreground",
          "border border-primary",
          "hover:bg-primary-hover",
          "shadow-sm hover:shadow-glow-primary",
        ].join(" "),

        // Destructive - Danger action
        destructive: [
          "bg-danger text-danger-foreground",
          "border border-danger",
          "hover:bg-danger-hover",
          "shadow-sm hover:shadow-glow-danger",
        ].join(" "),

        // Outline - Secondary action
        outline: [
          "bg-transparent text-foreground",
          "border border-surface-border",
          "hover:bg-surface-hover hover:border-foreground-subtle",
        ].join(" "),

        // Secondary - Muted action
        secondary: [
          "bg-surface text-foreground",
          "border border-surface-border",
          "hover:bg-surface-hover",
        ].join(" "),

        // Ghost - Minimal action
        ghost: [
          "bg-transparent text-foreground-muted",
          "hover:bg-surface-hover hover:text-foreground",
        ].join(" "),

        // Link - Text action
        link: [
          "bg-transparent text-primary underline-offset-4",
          "hover:underline",
        ].join(" "),

        // Success - Confirm action
        success: [
          "bg-success text-success-foreground",
          "border border-success",
          "hover:bg-success-hover",
          "shadow-sm hover:shadow-glow-success",
        ].join(" "),

        // Warning - Caution action
        warning: [
          "bg-warning text-warning-foreground",
          "border border-warning",
          "hover:bg-warning-hover",
          "shadow-sm hover:shadow-glow-warning",
        ].join(" "),
      },
      size: {
        default: "h-8 px-4 py-2",
        sm: "h-7 px-3 text-2xs",
        lg: "h-10 px-6",
        xl: "h-12 px-8 text-sm",
        icon: "h-8 w-8",
        "icon-sm": "h-7 w-7",
        "icon-lg": "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
