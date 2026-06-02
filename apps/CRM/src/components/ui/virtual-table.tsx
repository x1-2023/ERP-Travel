'use client'

import { useRef, type ReactNode } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface VirtualTableProps<T> {
  data: T[]
  columns: {
    key: string
    header: string
    width?: string
    align?: 'left' | 'right' | 'center'
    render: (item: T, index: number) => ReactNode
  }[]
  rowHeight?: number
  maxHeight?: number
  onRowClick?: (item: T) => void
  emptyMessage?: string
}

export function VirtualTable<T extends { id: string }>({
  data,
  columns,
  rowHeight = 48,
  maxHeight = 600,
  onRowClick,
  emptyMessage = 'Không có dữ liệu',
}: VirtualTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 10,
  })

  if (data.length === 0) {
    return (
      <div className="glass-card-static py-16 flex items-center justify-center">
        <p className="text-sm text-[var(--crm-text-muted)]">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="glass-card-static overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-[var(--crm-border)] hover:bg-transparent">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className="text-[var(--crm-text-secondary)] text-[11px] font-semibold uppercase tracking-wide"
                style={{ width: col.width, textAlign: col.align }}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
      </Table>
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ maxHeight: `${maxHeight}px` }}
      >
        <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const item = data[virtualRow.index]
            return (
              <div
                key={item.id}
                className="absolute w-full flex items-center border-b border-[var(--crm-border)] hover:bg-[var(--glass-bg)] transition-colors"
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  cursor: onRowClick ? 'pointer' : undefined,
                }}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((col) => (
                  <div
                    key={col.key}
                    className="px-4 text-sm truncate"
                    style={{ width: col.width || 'auto', flex: col.width ? 'none' : 1, textAlign: col.align }}
                  >
                    {col.render(item, virtualRow.index)}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
