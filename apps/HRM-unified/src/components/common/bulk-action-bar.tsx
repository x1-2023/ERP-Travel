'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BulkAction {
  label: string
  icon?: React.ReactNode
  onClick: (selectedIds: string[]) => void
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost'
  disabled?: boolean
}

interface BulkActionBarProps {
  /** Number of selected items */
  selectedCount: number
  /** Selected item IDs */
  selectedIds: Set<string>
  /** Available bulk actions */
  actions: BulkAction[]
  /** Callback to clear selection */
  onClearSelection: () => void
}

/**
 * Floating bar shown when items are selected in a data table.
 *
 * Usage:
 * ```tsx
 * <BulkActionBar
 *   selectedCount={selectedCount}
 *   selectedIds={selectedIds}
 *   onClearSelection={clearSelection}
 *   actions={[
 *     { label: 'Xuất Excel', icon: <Download />, onClick: handleExport },
 *     { label: 'Xóa', icon: <Trash2 />, onClick: handleDelete, variant: 'destructive' },
 *   ]}
 * />
 * ```
 */
export function BulkActionBar({
  selectedCount,
  selectedIds,
  actions,
  onClearSelection,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-lg border bg-background px-4 py-3 shadow-lg">
      <span className="text-sm font-medium">
        Đã chọn <strong>{selectedCount}</strong> mục
      </span>

      <div className="h-4 w-px bg-border" />

      {actions.map((action, i) => (
        <Button
          key={i}
          variant={action.variant || 'outline'}
          size="sm"
          disabled={action.disabled}
          onClick={() => action.onClick([...selectedIds])}
        >
          {action.icon && <span className="mr-1.5">{action.icon}</span>}
          {action.label}
        </Button>
      ))}

      <Button variant="ghost" size="sm" onClick={onClearSelection}>
        <X className="h-4 w-4 mr-1" />
        Bỏ chọn
      </Button>
    </div>
  )
}
