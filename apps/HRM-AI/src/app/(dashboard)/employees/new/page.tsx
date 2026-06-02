"use client"

import { useRouter } from "next/navigation"
import { useCreateEmployee } from "@/hooks/use-employees"
import { PageHeader } from "@/components/shared/page-header"
import { EmployeeForm } from "@/components/employees/employee-form"
import type { CreateEmployeeInput } from "@/lib/validations/employee"

export default function NewEmployeePage() {
  const router = useRouter()
  const createEmployee = useCreateEmployee()

  const handleSubmit = async (data: CreateEmployeeInput) => {
    await createEmployee.mutateAsync(data)
    router.push("/employees")
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thêm nhân viên mới"
        description="Nhập thông tin nhân viên"
      />
      <EmployeeForm onSubmit={handleSubmit} isLoading={createEmployee.isPending} />
    </div>
  )
}
