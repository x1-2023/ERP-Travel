// src/hooks/use-bulk-selection.ts
// Hook for managing multi-row selection in data tables

'use client'

import { useState, useCallback, useMemo } from 'react'

interface UseBulkSelectionOptions<T> {
  /** All items available for selection */
  items: T[]
  /** Function to get unique ID from an item */
  getItemId: (item: T) => string
}

interface UseBulkSelectionReturn {
  /** Set of currently selected item IDs */
  selectedIds: Set<string>
  /** Whether all current items are selected */
  isAllSelected: boolean
  /** Whether some but not all items are selected */
  isIndeterminate: boolean
  /** Number of selected items */
  selectedCount: number
  /** Whether a specific item is selected */
  isSelected: (id: string) => boolean
  /** Toggle selection of a single item */
  toggle: (id: string) => void
  /** Toggle select all / deselect all */
  toggleAll: () => void
  /** Clear all selections */
  clearSelection: () => void
  /** Select specific IDs */
  select: (ids: string[]) => void
}

/**
 * Hook for managing bulk selection state.
 *
 * Usage:
 * ```tsx
 * const { selectedIds, isAllSelected, isIndeterminate, isSelected, toggle, toggleAll, clearSelection, selectedCount } =
 *   useBulkSelection({ items: employees, getItemId: (e) => e.id })
 *
 * // In table header
 * <Checkbox checked={isAllSelected} indeterminate={isIndeterminate} onChange={toggleAll} />
 *
 * // In table row
 * <Checkbox checked={isSelected(employee.id)} onChange={() => toggle(employee.id)} />
 *
 * // Bulk action bar
 * {selectedCount > 0 && (
 *   <div>
 *     {selectedCount} items selected
 *     <Button onClick={() => handleBulkDelete([...selectedIds])}>Delete</Button>
 *     <Button onClick={clearSelection}>Cancel</Button>
 *   </div>
 * )}
 * ```
 */
export function useBulkSelection<T>({
  items,
  getItemId,
}: UseBulkSelectionOptions<T>): UseBulkSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const currentIds = useMemo(
    () => new Set(items.map(getItemId)),
    [items, getItemId]
  )

  const isAllSelected = useMemo(
    () => currentIds.size > 0 && [...currentIds].every((id) => selectedIds.has(id)),
    [currentIds, selectedIds]
  )

  const isIndeterminate = useMemo(
    () => !isAllSelected && [...currentIds].some((id) => selectedIds.has(id)),
    [currentIds, selectedIds, isAllSelected]
  )

  const selectedCount = selectedIds.size

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  )

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const toggleAll = useCallback(() => {
    if (isAllSelected) {
      // Deselect all current page items
      setSelectedIds((prev) => {
        const next = new Set(prev)
        for (const id of currentIds) {
          next.delete(id)
        }
        return next
      })
    } else {
      // Select all current page items
      setSelectedIds((prev) => {
        const next = new Set(prev)
        for (const id of currentIds) {
          next.add(id)
        }
        return next
      })
    }
  }, [isAllSelected, currentIds])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const select = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids))
  }, [])

  return {
    selectedIds,
    isAllSelected,
    isIndeterminate,
    selectedCount,
    isSelected,
    toggle,
    toggleAll,
    clearSelection,
    select,
  }
}
