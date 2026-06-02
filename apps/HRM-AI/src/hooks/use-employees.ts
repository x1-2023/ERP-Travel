"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { EmployeeFilters, EmployeeWithRelations, PaginatedResponse } from "@/types"
import type { CreateEmployeeInput, UpdateEmployeeInput } from "@/lib/validations/employee"
import { toast } from "sonner"

async function fetchEmployees(filters: EmployeeFilters): Promise<PaginatedResponse<EmployeeWithRelations>> {
  const params = new URLSearchParams()
  if (filters.search) params.set("search", filters.search)
  if (filters.departmentId) params.set("departmentId", filters.departmentId)
  if (filters.positionId) params.set("positionId", filters.positionId)
  if (filters.branchId) params.set("branchId", filters.branchId)
  if (filters.status) params.set("status", filters.status)
  if (filters.page) params.set("page", String(filters.page))
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize))

  const res = await fetch(`/api/employees?${params}`)
  if (!res.ok) {
    throw new Error("Không thể tải danh sách nhân viên")
  }
  const json = await res.json()
  // API returns { success, data, meta } — map to PaginatedResponse shape
  if (json.meta) {
    return {
      data: json.data,
      pagination: {
        page: json.meta.page,
        pageSize: json.meta.pageSize ?? json.meta.limit,
        total: json.meta.total,
        totalPages: json.meta.totalPages,
      },
    }
  }
  return json
}

async function fetchEmployee(id: string): Promise<EmployeeWithRelations> {
  const res = await fetch(`/api/employees/${id}`)
  if (!res.ok) {
    throw new Error("Không tìm thấy nhân viên")
  }
  const json = await res.json()
  return json.data ?? json
}

async function createEmployee(data: CreateEmployeeInput): Promise<EmployeeWithRelations> {
  const res = await fetch("/api/employees", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Không thể tạo nhân viên")
  }
  return res.json()
}

async function updateEmployee(data: UpdateEmployeeInput): Promise<EmployeeWithRelations> {
  const res = await fetch(`/api/employees/${data.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Không thể cập nhật nhân viên")
  }
  return res.json()
}

async function deleteEmployee(id: string): Promise<void> {
  const res = await fetch(`/api/employees/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Không thể xóa nhân viên")
  }
}

export function useEmployees(filters: EmployeeFilters = {}) {
  return useQuery({
    queryKey: ["employees", filters],
    queryFn: () => fetchEmployees(filters),
  })
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ["employee", id],
    queryFn: () => fetchEmployee(id),
    enabled: !!id,
  })
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] })
      toast.success("Đã tạo nhân viên thành công")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateEmployee,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] })
      queryClient.invalidateQueries({ queryKey: ["employee", data.id] })
      toast.success("Đã cập nhật nhân viên thành công")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] })
      toast.success("Đã xóa nhân viên thành công")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
