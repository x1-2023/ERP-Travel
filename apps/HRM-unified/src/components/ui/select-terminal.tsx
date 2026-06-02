"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check, ChevronDown, X } from "lucide-react"

interface Option {
  value: string
  label: string
  disabled?: boolean
}

interface SelectTerminalProps {
  options: Option[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  label?: string
  error?: string
  hint?: string
  disabled?: boolean
  clearable?: boolean
  searchable?: boolean
  className?: string
  containerClassName?: string
}

export function SelectTerminal({
  options,
  value,
  onChange,
  placeholder = "Chọn...",
  label,
  error,
  hint,
  disabled,
  clearable,
  searchable,
  className,
  containerClassName,
}: SelectTerminalProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  const filteredOptions = searchable
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options

  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearchQuery("")
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Focus search input when opened
  React.useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, searchable])

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue)
    setIsOpen(false)
    setSearchQuery("")
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.("")
  }

  return (
    <div className={cn("space-y-1.5", containerClassName)} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-foreground">{label}</label>
      )}

      <div className="relative">
        {/* Trigger */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            "w-full h-10 px-3 text-sm rounded-md text-left",
            "bg-elevated border transition-all duration-200",
            "flex items-center justify-between gap-2",
            "focus:outline-none focus:ring-2 focus:ring-offset-0",
            error
              ? "border-destructive focus:ring-destructive/30"
              : "border-border hover:border-border/80 focus:ring-primary/30 focus:border-primary",
            disabled && "opacity-50 cursor-not-allowed",
            isOpen && "ring-2 ring-primary/30 border-primary",
            className
          )}
        >
          <span className={cn(!selectedOption && "text-muted-foreground")}>
            {selectedOption?.label || placeholder}
          </span>

          <div className="flex items-center gap-1">
            {clearable && value && (
              <span
                onClick={handleClear}
                className="p-0.5 hover:bg-muted rounded transition-colors"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </span>
            )}
            <ChevronDown
              className={cn(
                "w-4 h-4 text-muted-foreground transition-transform duration-200",
                isOpen && "rotate-180"
              )}
            />
          </div>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div
            className={cn(
              "absolute z-50 w-full mt-1 py-1",
              "bg-popover border border-border rounded-md shadow-elevated",
              "animate-fade-in-up-fast",
              "max-h-60 overflow-auto scrollbar-terminal"
            )}
          >
            {/* Search */}
            {searchable && (
              <div className="px-2 pb-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm..."
                  className={cn(
                    "w-full h-8 px-2 text-sm rounded",
                    "bg-elevated border border-border",
                    "focus:outline-none focus:border-primary"
                  )}
                />
              </div>
            )}

            {/* Options */}
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                Không tìm thấy kết quả
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  disabled={option.disabled}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "w-full px-3 py-2 text-sm text-left",
                    "flex items-center justify-between gap-2",
                    "transition-colors duration-100",
                    option.disabled
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-elevated cursor-pointer",
                    option.value === value && "bg-primary/10 text-primary"
                  )}
                >
                  {option.label}
                  {option.value === value && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Hint/Error */}
      {(hint || error) && (
        <p className={cn("text-xs", error ? "text-destructive" : "text-muted-foreground")}>
          {error || hint}
        </p>
      )}
    </div>
  )
}
