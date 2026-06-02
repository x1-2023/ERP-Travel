"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, AlertCircle, Mail } from "lucide-react"

interface SendPayslipsModalProps {
  open: boolean
  onClose: () => void
  periodId: string
  month: number
  year: number
  totalWithEmail: number
  totalWithoutEmail: number
}

export function SendPayslipsModal({
  open,
  onClose,
  periodId,
  month,
  year,
  totalWithEmail,
  totalWithoutEmail,
}: SendPayslipsModalProps) {
  const { toast } = useToast()
  const [result, setResult] = useState<{
    sent: number
    failed: number
    skipped: number
    errors: { name: string; error: string }[]
  } | null>(null)

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/payroll/${periodId}/send-payslips`, {
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
      setResult(data)
    },
    onError: (err: Error) => {
      toast({ title: "Lỗi", description: err.message, variant: "destructive" })
    },
  })

  function handleClose() {
    setResult(null)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Gửi Phiếu Lương — {month}/{year}
          </DialogTitle>
        </DialogHeader>

        {!result ? (
          <div className="space-y-3">
            <p className="text-sm">
              Sẽ gửi email đến <strong>{totalWithEmail}</strong> nhân viên có địa chỉ email cá nhân.
            </p>
            {totalWithoutEmail > 0 && (
              <p className="text-sm text-amber-600">
                {totalWithoutEmail} nhân viên chưa có email — bỏ qua
              </p>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleClose}>Hủy</Button>
              <Button
                style={{ backgroundColor: "#1E3A5F" }}
                disabled={mutation.isPending}
                onClick={() => mutation.mutate()}
              >
                {mutation.isPending ? "Đang gửi..." : `Gửi ${totalWithEmail} Email`}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Đã gửi: <strong>{result.sent}</strong></span>
            </div>
            {result.skipped > 0 && (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span>Bỏ qua: <strong>{result.skipped}</strong></span>
              </div>
            )}
            {result.failed > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>Lỗi: <strong>{result.failed}</strong></span>
                </div>
                {result.errors.map((e, i) => (
                  <p key={i} className="text-xs text-red-500 ml-6">
                    {e.name}: {e.error}
                  </p>
                ))}
              </div>
            )}
            <div className="flex justify-end">
              <Button variant="outline" onClick={handleClose}>Đóng</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
