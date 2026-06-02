"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { BranchWithRelations } from "@/types"
import type { CreateBranchInput, UpdateBranchInput } from "@/lib/validations/branch"
import { toast } from "sonner"

async function fetchBranches(): Promise<BranchWithRelations[]> {
  const res = await fetch("/api/branches")
  if (!res.ok) {
    throw new Error("Không thể tải danh sách chi nhánh")
  }
  const json = await res.json()
  return json.data ?? json
}

async function createBranch(data: CreateBranchInput): Promise<BranchWithRelations> {
  const res = await fetch("/api/branches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Không thể tạo chi nhánh")
  }
  return res.json()
}

async function updateBranch(data: UpdateBranchInput): Promise<BranchWithRelations> {
  const res = await fetch(`/api/branches/${data.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Không thể cập nhật chi nhánh")
  }
  return res.json()
}

async function deleteBranch(id: string): Promise<void> {
  const res = await fetch(`/api/branches/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Không thể xóa chi nhánh")
  }
}

export function useBranches() {
  return useQuery({
    queryKey: ["branches"],
    queryFn: fetchBranches,
  })
}

export function useCreateBranch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] })
      toast.success("Đã tạo chi nhánh thành công")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateBranch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] })
      toast.success("Đã cập nhật chi nhánh thành công")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteBranch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] })
      toast.success("Đã xóa chi nhánh thành công")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
