import { Skeleton } from "@/components/ui/skeleton"

interface FormSkeletonProps {
  sections?: number
  fieldsPerSection?: number
  showHeader?: boolean
}

export function FormSkeleton({
  sections = 2,
  fieldsPerSection = 4,
  showHeader = true,
}: FormSkeletonProps) {
  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Page Header */}
      {showHeader && (
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg bg-zinc-800" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48 bg-zinc-800" />
            <Skeleton className="h-4 w-64 bg-zinc-800" />
          </div>
        </div>
      )}

      {/* Form Sections */}
      {[...Array(sections)].map((_, sectionIndex) => (
        <div
          key={sectionIndex}
          className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-6"
        >
          {/* Section Title */}
          <div className="pb-4 border-b border-zinc-800">
            <Skeleton className="h-5 w-40 bg-zinc-800" />
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(fieldsPerSection)].map((_, fieldIndex) => (
              <div key={fieldIndex} className="space-y-2">
                <Skeleton className="h-4 w-24 bg-zinc-800" />
                <Skeleton className="h-10 w-full bg-zinc-800" />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4">
        <Skeleton className="h-10 w-32 bg-amber-500/20" />
        <Skeleton className="h-10 w-24 bg-zinc-800" />
      </div>
    </div>
  )
}

export default FormSkeleton
