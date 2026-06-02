import { Skeleton } from "@/components/ui/skeleton"

export function ProfileSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Profile Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <Skeleton className="h-24 w-24 rounded-full bg-zinc-800" />

          {/* Basic Info */}
          <div className="flex-1 space-y-3">
            <Skeleton className="h-7 w-48 bg-zinc-800" />
            <Skeleton className="h-4 w-32 bg-zinc-800" />
            <div className="flex items-center gap-4 mt-4">
              <Skeleton className="h-6 w-24 rounded-full bg-zinc-800" />
              <Skeleton className="h-6 w-24 rounded-full bg-zinc-800" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 bg-zinc-800" />
            <Skeleton className="h-9 w-24 bg-zinc-800" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <Skeleton className="h-4 w-24 mb-2 bg-zinc-800" />
            <Skeleton className="h-7 w-16 bg-zinc-800" />
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
        {/* Tab Headers */}
        <div className="border-b border-zinc-800 p-4">
          <div className="flex items-center gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 bg-zinc-800" />
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24 bg-zinc-800" />
                <Skeleton className="h-5 w-full bg-zinc-800" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <Skeleton className="h-5 w-40 mb-4 bg-zinc-800" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-start gap-4">
              <Skeleton className="h-8 w-8 rounded-full bg-zinc-800" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 bg-zinc-800" />
                <Skeleton className="h-3 w-24 bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProfileSkeleton
