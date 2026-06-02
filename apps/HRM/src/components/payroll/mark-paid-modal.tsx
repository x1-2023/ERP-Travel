"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface MarkPaidModalProps {
  open: boolean
  onClose: () => void
  periodId: string
  month: number
  year: number
  totalNet: number
  employeeCount: number
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(Math.round(n)) + "đ"
}

export function MarkPaidModal({
  open,
  onClose,
  periodId,
  month,
  year,
  totalNet,
  employeeCount,
}: MarkPaidModalProps) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/payroll/${periodId}/mark-paid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error)
      }
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["payroll-period", periodId] })
      queryClient.invalidateQueries({ queryKey: ["payroll-employees", periodId] })
      queryClient.invalidateQueries({ queryKey: ["payroll-periods"] })
      toast({
        title: "Đã đánh dấu thanh toán",
        description: data.advancesDeducted > 0
          ? `${data.advancesDeducted} khoản tạm ứng đã chuyển sang DEDUCTED`
          : undefined,
      })
      onClose()
    },
    onError: (err: Error) => {
      toast({ title: "Lỗi", description: err.message, variant: "destructive" })
    },
  })

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận đã thanh toán lương?</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="text-sm space-y-1">
            <p>Tháng: <strong>{month}/{year}</strong></p>
            <p>Tổng thực lĩnh: <strong style={{ color: "#1E3A5F" }}>{formatCurrency(totalNet)}</strong></p>
            <p>Số nhân viên: <strong>{employeeCount}</strong></p>
          </div>
          <p className="text-sm text-amber-600 font-medium">
            Hành động này không thể hoàn tác.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>Hủy</Button>
            <Button
              style={{ backgroundColor: "#1E3A5F" }}
              disabled={mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending ? "Đang xử lý..." : "Xác Nhận Đã Trả"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
