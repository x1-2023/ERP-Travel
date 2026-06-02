"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface BatchCloseModalProps {
  periodId: string
  month: number
  year: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BatchCloseModal({
  periodId,
  month,
  year,
  open,
  onOpenChange,
}: BatchCloseModalProps) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/reports/batch-close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ periodId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Lỗi khi đóng đơn")
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reports"] })
      queryClient.invalidateQueries({ queryKey: ["payroll-period", periodId] })
      toast({ title: `Đã đóng ${data.data.closedCount} đơn thành công` })
      onOpenChange(false)
    },
    onError: (err: Error) => {
      toast({ title: "Lỗi", description: err.message, variant: "destructive" })
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Đóng Đơn Hàng Loạt</DialogTitle>
          <DialogDescription>
            Đóng tất cả đơn đã duyệt (APPROVED_FINAL) thuộc bảng lương{" "}
            <strong>tháng {month}/{year}</strong>. Đơn đã đóng sẽ không thể
            chỉnh sửa.
          </DialogDescription>
        </DialogHeader>

        {mutation.isError && (
          <p className="text-sm text-red-600">{mutation.error.message}</p>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            style={{ backgroundColor: "#1E3A5F" }}
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Đang đóng..." : "Xác Nhận Đóng"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
