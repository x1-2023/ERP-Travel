"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function formatVND(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value)
}

function parseVND(text: string): number {
  return parseInt(text.replace(/\D/g, ""), 10) || 0
}

interface CurrencyInputProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  className?: string
  placeholder?: string
  id?: string
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, disabled, className, placeholder = "0", id }, ref) => {
    const [displayValue, setDisplayValue] = React.useState(() =>
      value > 0 ? formatVND(value) : ""
    )

    React.useEffect(() => {
      const parsed = parseVND(displayValue)
      if (parsed !== value) {
        setDisplayValue(value > 0 ? formatVND(value) : "")
      }
      // Only sync when external value changes, not on every displayValue change
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const raw = e.target.value
      const num = parseVND(raw)
      setDisplayValue(num > 0 ? formatVND(num) : "")
      onChange(num)
    }

    return (
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pr-8 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
          đ
        </span>
      </div>
    )
  }
)
CurrencyInput.displayName = "CurrencyInput"

export { CurrencyInput, formatVND, parseVND }
