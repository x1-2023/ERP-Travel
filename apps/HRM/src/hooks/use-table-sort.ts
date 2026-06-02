import { useState, useMemo } from "react"

type SortOrder = "asc" | "desc" | null

export function useTableSort<T>(
  data: T[],
  defaultSort?: keyof T & string,
  defaultOrder?: SortOrder
) {
  const [sortColumn, setSortColumn] = useState<string | null>(defaultSort ?? null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(defaultOrder ?? null)

  const onSort = (column: string) => {
    if (sortColumn !== column) {
      setSortColumn(column)
      setSortOrder("asc")
    } else if (sortOrder === "asc") {
      setSortOrder("desc")
    } else {
      setSortColumn(null)
      setSortOrder(null)
    }
  }

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortOrder) return data

    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortColumn]
      const bVal = (b as Record<string, unknown>)[sortColumn]

      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1

      let cmp = 0
      if (typeof aVal === "number" && typeof bVal === "number") {
        cmp = aVal - bVal
      } else {
        cmp = String(aVal).localeCompare(String(bVal), "vi")
      }

      return sortOrder === "desc" ? -cmp : cmp
    })
  }, [data, sortColumn, sortOrder])

  return { sortedData, sortColumn, sortOrder, onSort }
}
