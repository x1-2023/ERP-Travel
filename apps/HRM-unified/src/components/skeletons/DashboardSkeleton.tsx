import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48 bg-zinc-800" />
        <Skeleton className="h-10 w-32 bg-zinc-800" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-4 w-24 bg-zinc-800" />
              <Skeleton className="h-8 w-8 rounded-full bg-zinc-800" />
            </div>
            <Skeleton className="h-8 w-20 mb-2 bg-zinc-800" />
            <Skeleton className="h-3 w-16 bg-zinc-800" />
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-5 w-40 bg-zinc-800" />
            <Skeleton className="h-8 w-24 bg-zinc-800" />
          </div>
          <Skeleton className="h-64 w-full bg-zinc-800" />
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-5 w-40 bg-zinc-800" />
            <Skeleton className="h-8 w-24 bg-zinc-800" />
          </div>
          <Skeleton className="h-64 w-full bg-zinc-800" />
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-48 bg-zinc-800" />
          <Skeleton className="h-8 w-20 bg-zinc-800" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 bg-zinc-800/50 rounded-lg">
              <Skeleton className="h-10 w-10 rounded-full bg-zinc-700" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 bg-zinc-700" />
                <Skeleton className="h-3 w-1/2 bg-zinc-700" />
              </div>
              <Skeleton className="h-6 w-20 bg-zinc-700" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DashboardSkeleton
