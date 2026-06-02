"use client"

import { TableHead } from "@/components/ui/table"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SortableTableHeadProps {
  column: string
  label: string
  currentSort: string | null
  currentOrder: "asc" | "desc" | null
  onSort: (column: string) => void
  className?: string
}

export function SortableTableHead({
  column,
  label,
  currentSort,
  currentOrder,
  onSort,
  className,
}: SortableTableHeadProps) {
  const isActive = currentSort === column

  const Icon = isActive
    ? currentOrder === "asc"
      ? ArrowUp
      : ArrowDown
    : ArrowUpDown

  return (
    <TableHead
      className={cn("cursor-pointer select-none hover:bg-muted/50", className)}
      onClick={() => onSort(column)}
    >
      <div className="flex items-center gap-1">
        {label}
        <Icon className={cn("h-3.5 w-3.5", isActive ? "text-foreground" : "text-muted-foreground/50")} />
      </div>
    </TableHead>
  )
}
