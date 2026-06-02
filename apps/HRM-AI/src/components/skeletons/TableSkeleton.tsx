import { Skeleton } from "@/components/ui/skeleton"

interface TableSkeletonProps {
  rows?: number
  columns?: number
  showHeader?: boolean
  showFilters?: boolean
  showPagination?: boolean
}

export function TableSkeleton({
  rows = 10,
  columns = 5,
  showHeader = true,
  showFilters = true,
  showPagination = true,
}: TableSkeletonProps) {
  return (
    <div className="p-6 space-y-4">
      {/* Page Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48 bg-zinc-800" />
          <Skeleton className="h-10 w-32 bg-zinc-800" />
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-64 bg-zinc-800" />
          <Skeleton className="h-10 w-32 bg-zinc-800" />
          <Skeleton className="h-10 w-32 bg-zinc-800" />
          <div className="ml-auto">
            <Skeleton className="h-10 w-24 bg-zinc-800" />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center p-4 gap-4">
            <Skeleton className="h-4 w-4 bg-zinc-700" />
            {[...Array(columns)].map((_, i) => (
              <Skeleton
                key={i}
                className="h-4 bg-zinc-700"
                style={{ width: `${100 / columns}%` }}
              />
            ))}
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-zinc-800">
          {[...Array(rows)].map((_, rowIndex) => (
            <div key={rowIndex} className="flex items-center p-4 gap-4 hover:bg-zinc-800/30">
              <Skeleton className="h-4 w-4 bg-zinc-800" />
              {[...Array(columns)].map((_, colIndex) => (
                <Skeleton
                  key={colIndex}
                  className="h-4 bg-zinc-800"
                  style={{ width: `${100 / columns}%` }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32 bg-zinc-800" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 bg-zinc-800" />
            <Skeleton className="h-8 w-8 bg-zinc-800" />
            <Skeleton className="h-8 w-8 bg-zinc-800" />
            <Skeleton className="h-8 w-8 bg-zinc-800" />
          </div>
        </div>
      )}
    </div>
  )
}

export default TableSkeleton
