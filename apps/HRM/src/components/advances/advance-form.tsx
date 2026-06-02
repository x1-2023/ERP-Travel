"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface AdvanceFormProps {
  open: boolean
  onClose: () => void
  baseSalary: number | null
}

export function AdvanceForm({ open, onClose, baseSalary }: AdvanceFormProps) {
  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("")
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const maxAdvance = baseSalary ? Math.floor(baseSalary * 0.5) : 0

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/advances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount.replace(/[,.]/g, "")),
          reason,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advances"] })
      toast({ title: "Đã gửi yêu cầu tạm ứng" })
      setAmount("")
      setReason("")
      onClose()
    },
    onError: (err) => {
      toast({ title: "Lỗi", description: err.message, variant: "destructive" })
    },
  })

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xin Tạm Ứng Lương</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Số tiền tạm ứng (VNĐ)</Label>
            <Input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="VD: 3000000"
            />
            {baseSalary && (
              <p className="text-xs text-muted-foreground mt-1">
                Tối đa: {maxAdvance.toLocaleString("vi-VN")}đ (50% lương cơ bản)
              </p>
            )}
          </div>
          <div>
            <Label>Lý do</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Cần điền rõ lý do để HR xét duyệt"
              rows={3}
            />
          </div>
          <Button
            className="w-full"
            style={{ backgroundColor: "#1E3A5F" }}
            disabled={!amount || !reason.trim() || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Đang gửi..." : "Gửi Yêu Cầu"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
