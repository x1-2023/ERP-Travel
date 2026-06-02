"use client"

import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface CancelOffboardingModalProps {
  instanceId: string
  employeeName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CancelOffboardingModal({
  instanceId,
  employeeName,
  open,
  onOpenChange,
  onSuccess,
}: CancelOffboardingModalProps) {
  const [reason, setReason] = useState("")
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/offboarding/${instanceId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Lỗi khi hủy offboarding")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offboarding-detail", instanceId] })
      toast({ title: "Đã hủy quy trình offboarding" })
      setReason("")
      onOpenChange(false)
      onSuccess()
    },
    onError: (err: Error) => {
      toast({ title: "Lỗi", description: err.message, variant: "destructive" })
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hủy Quy Trình Offboarding</DialogTitle>
          <DialogDescription>
            Hủy offboarding cho <strong>{employeeName}</strong>. Nhân viên sẽ tiếp tục
            làm việc bình thường.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-2">
            <Label>Lý do hủy *</Label>
            <Textarea
              placeholder="Nhập lý do hủy offboarding..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
          {mutation.isError && (
            <p className="text-sm text-red-600">{mutation.error.message}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button
            variant="destructive"
            disabled={!reason.trim() || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Đang hủy..." : "Xác Nhận Hủy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
