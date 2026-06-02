"use client"

import { EmployeeForm } from "@/components/employees/employee-form"

export default function NewEmployeePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#1E3A5F" }}>
        Thêm Nhân Viên Mới
      </h1>
      <EmployeeForm mode="create" />
    </div>
  )
}
