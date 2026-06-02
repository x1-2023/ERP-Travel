"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { SearchInput } from "@/components/ui/input-terminal"
import { SelectTerminal } from "@/components/ui/select-terminal"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal, X, Download, Plus } from "lucide-react"

interface FilterOption {
  key: string
  label: string
  type: "select"
  options?: { value: string; label: string }[]
  value?: string
  onChange?: (value: string) => void
}

interface FilterBarProps {
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  filters?: FilterOption[]
  activeFiltersCount?: number
  onClearFilters?: () => void
  onExport?: () => void
  onAdd?: () => void
  addLabel?: string
  className?: string
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Tìm kiếm...",
  filters,
  activeFiltersCount = 0,
  onClearFilters,
  onExport,
  onAdd,
  addLabel = "Thêm mới",
  className,
}: FilterBarProps) {
  const [showFilters, setShowFilters] = React.useState(false)

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-md">
          <SearchInput
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            onClear={() => onSearchChange?.("")}
            placeholder={searchPlaceholder}
          />
        </div>

        <div className="flex items-center gap-2">
          {filters && filters.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(showFilters && "bg-primary/10 border-primary")}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Bộ lọc
              {activeFiltersCount > 0 && (
                <span className="ml-2 h-5 px-1.5 rounded-sm bg-primary/20 text-primary text-xs font-medium inline-flex items-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          )}

          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Xuất Excel</span>
            </Button>
          )}

          {onAdd && (
            <Button size="sm" onClick={onAdd}>
              <Plus className="w-4 h-4 mr-2" />
              {addLabel}
            </Button>
          )}
        </div>
      </div>

      {showFilters && filters && (
        <div className="flex flex-wrap items-center gap-3 p-3 bg-elevated rounded-lg border border-border animate-fade-in-down">
          {filters.map((filter) => (
            <div key={filter.key} className="min-w-[150px]">
              {filter.type === "select" && filter.options && (
                <SelectTerminal
                  options={filter.options}
                  value={filter.value}
                  onChange={filter.onChange}
                  placeholder={filter.label}
                  clearable
                />
              )}
            </div>
          ))}

          {activeFiltersCount > 0 && onClearFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-muted-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Xoá bộ lọc
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
