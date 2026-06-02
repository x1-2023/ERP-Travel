"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { PositionWithRelations } from "@/types"
import type { CreatePositionInput, UpdatePositionInput } from "@/lib/validations/position"
import { toast } from "sonner"

async function fetchPositions(): Promise<PositionWithRelations[]> {
  const res = await fetch("/api/positions")
  if (!res.ok) {
    throw new Error("Không thể tải danh sách chức danh")
  }
  const json = await res.json()
  return json.data ?? json
}

async function createPosition(data: CreatePositionInput): Promise<PositionWithRelations> {
  const res = await fetch("/api/positions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Không thể tạo chức danh")
  }
  return res.json()
}

async function updatePosition(data: UpdatePositionInput): Promise<PositionWithRelations> {
  const res = await fetch(`/api/positions/${data.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Không thể cập nhật chức danh")
  }
  return res.json()
}

async function deletePosition(id: string): Promise<void> {
  const res = await fetch(`/api/positions/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Không thể xóa chức danh")
  }
}

export function usePositions() {
  return useQuery({
    queryKey: ["positions"],
    queryFn: fetchPositions,
  })
}

export function useCreatePosition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPosition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] })
      toast.success("Đã tạo chức danh thành công")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdatePosition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updatePosition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] })
      toast.success("Đã cập nhật chức danh thành công")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeletePosition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePosition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] })
      toast.success("Đã xóa chức danh thành công")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
