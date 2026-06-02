"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { DepartmentWithRelations } from "@/types"
import type { CreateDepartmentInput, UpdateDepartmentInput } from "@/lib/validations/department"
import { toast } from "sonner"

async function fetchDepartments(): Promise<DepartmentWithRelations[]> {
  const res = await fetch("/api/departments")
  if (!res.ok) {
    throw new Error("Không thể tải danh sách phòng ban")
  }
  const json = await res.json()
  return json.data ?? json
}

async function createDepartment(data: CreateDepartmentInput): Promise<DepartmentWithRelations> {
  const res = await fetch("/api/departments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Không thể tạo phòng ban")
  }
  return res.json()
}

async function updateDepartment(data: UpdateDepartmentInput): Promise<DepartmentWithRelations> {
  const res = await fetch(`/api/departments/${data.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Không thể cập nhật phòng ban")
  }
  return res.json()
}

async function deleteDepartment(id: string): Promise<void> {
  const res = await fetch(`/api/departments/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Không thể xóa phòng ban")
  }
}

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
  })
}

export function useCreateDepartment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] })
      toast.success("Đã tạo phòng ban thành công")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] })
      toast.success("Đã cập nhật phòng ban thành công")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] })
      toast.success("Đã xóa phòng ban thành công")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
