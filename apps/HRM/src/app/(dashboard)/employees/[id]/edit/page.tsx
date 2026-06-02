"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { EmployeeForm } from "@/components/employees/employee-form"
import { Skeleton } from "@/components/ui/skeleton"

export default function EditEmployeePage() {
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
        <Skeleton className="h-96" />
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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#1E3A5F" }}>
        Chỉnh Sửa: {employee.fullName}
      </h1>
      <EmployeeForm mode="edit" employeeId={id} initialData={employee} />
    </div>
  )
}
