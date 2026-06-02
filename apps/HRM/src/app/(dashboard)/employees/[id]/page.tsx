"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { EmployeeDetail } from "@/components/employees/employee-detail"
import { Skeleton } from "@/components/ui/skeleton"

export default function EmployeeDetailPage() {
  const params = useParams()
  const id = params.id as string

  const { data: employee, isLoading, error } = useQuery({
    queryKey: ["employee", id],
    queryFn: async () => {
      const res = await fetch(`/api/employees/${id}`)
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to fetch")
      }
      return res.json()
    },
    enabled: !!id,
    retry: false,
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-96" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{(error as Error).message}</p>
      </div>
    )
  }

  if (!employee) return null

  return <EmployeeDetail employee={employee} />
}
