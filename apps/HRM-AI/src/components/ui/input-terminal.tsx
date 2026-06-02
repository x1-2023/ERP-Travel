"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { AlertCircle, Check, Eye, EyeOff, Search, X } from "lucide-react"

interface InputTerminalProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  success?: boolean
  hint?: string
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
  clearable?: boolean
  onClear?: () => void
  showPasswordToggle?: boolean
  containerClassName?: string
}

export const InputTerminal = React.forwardRef<HTMLInputElement, InputTerminalProps>(
  (
    {
      className,
      containerClassName,
      type,
      label,
      error,
      success,
      hint,
      icon,
      iconPosition = "left",
      clearable,
      onClear,
      showPasswordToggle,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    const inputType = type === "password" && showPassword ? "text" : type

    const hasValue = props.value !== undefined && props.value !== ""

    return (
      <div className={cn("space-y-1.5", containerClassName)}>
        {label && (
          <label className="block text-sm font-medium text-foreground">
            {label}
            {props.required && <span className="text-destructive ml-0.5">*</span>}
          </label>
        )}

        <div className="relative">
          {/* Left Icon */}
          {icon && iconPosition === "left" && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              {icon}
            </div>
          )}

          {/* Input */}
          <input
            type={inputType}
            ref={ref}
            disabled={disabled}
            className={cn(
              "w-full h-10 px-3 text-sm rounded-md font-sans",
              "bg-elevated border transition-all duration-200",
              "placeholder:text-muted-foreground/60",
              "focus:outline-none focus:ring-2 focus:ring-offset-0",
              error
                ? "border-destructive focus:ring-destructive/30 focus:border-destructive"
                : success
                  ? "border-success focus:ring-success/30 focus:border-success"
                  : "border-border hover:border-border/80 focus:ring-primary/30 focus:border-primary",
              disabled && "opacity-50 cursor-not-allowed bg-muted",
              icon && iconPosition === "left" && "pl-10",
              icon && iconPosition === "right" && "pr-10",
              (clearable || showPasswordToggle) && "pr-10",
              clearable && showPasswordToggle && "pr-16",
              className
            )}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            {...props}
          />

          {/* Right Icon */}
          {icon && iconPosition === "right" && !clearable && !showPasswordToggle && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              {icon}
            </div>
          )}

          {/* Status Icon */}
          {(error || success) && !clearable && !showPasswordToggle && (
            <div
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2",
                error ? "text-destructive" : "text-success"
              )}
            >
              {error ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            </div>
          )}

          {/* Clear Button */}
          {clearable && hasValue && !disabled && (
            <button
              type="button"
              onClick={onClear}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 p-1 rounded",
                "text-muted-foreground hover:text-foreground",
                "transition-colors duration-150",
                showPasswordToggle ? "right-9" : "right-2"
              )}
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Password Toggle */}
          {showPasswordToggle && type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded",
                "text-muted-foreground hover:text-foreground",
                "transition-colors duration-150"
              )}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}

          {/* Focus ring animation */}
          {isFocused && !error && (
            <div className="absolute inset-0 rounded-md pointer-events-none ring-2 ring-primary/20 animate-fade-in-fast" />
          )}
        </div>

        {/* Hint/Error message */}
        {(hint || error) && (
          <p
            className={cn(
              "text-xs transition-colors duration-150",
              error ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {error || hint}
          </p>
        )}
      </div>
    )
  }
)

InputTerminal.displayName = "InputTerminal"

// ═══════════════════════════════════════════════════════════════
// SEARCH INPUT VARIANT
// ═══════════════════════════════════════════════════════════════

interface SearchInputProps extends Omit<InputTerminalProps, "icon" | "iconPosition"> {
  onSearch?: (value: string) => void
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, onKeyDown, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && onSearch) {
        onSearch((e.target as HTMLInputElement).value)
      }
      onKeyDown?.(e)
    }

    return (
      <InputTerminal
        ref={ref}
        type="search"
        icon={<Search className="w-4 h-4" />}
        iconPosition="left"
        placeholder="Tìm kiếm..."
        clearable
        onKeyDown={handleKeyDown}
        {...props}
      />
    )
  }
)

SearchInput.displayName = "SearchInput"
