"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AdvanceForm } from "./advance-form"

interface Advance {
  id: string
  amount: string | number
  reason: string
  status: string
  requestedAt: string
  deductMonth: number | null
  deductYear: number | null
  rejectionReason: string | null
  employee: { fullName: string; employeeCode: string }
  approver: { name: string } | null
}

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING: { label: "Chờ duyệt", variant: "secondary" },
  APPROVED: { label: "Đã duyệt", variant: "default" },
  REJECTED: { label: "Từ chối", variant: "destructive" },
  DEDUCTED: { label: "Đã trừ lương", variant: "outline" },
}

function fmtMoney(v: string | number): string {
  return Number(v).toLocaleString("vi-VN") + "đ"
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
}

interface AdvanceListProps {
  isHR: boolean
  baseSalary: number | null
}

export function AdvanceList({ isHR, baseSalary }: AdvanceListProps) {
  const [showForm, setShowForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState("ALL")
  const [approveId, setApproveId] = useState<string | null>(null)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [deductMonth, setDeductMonth] = useState("")
  const [deductYear, setDeductYear] = useState("")
  const [rejectReason, setRejectReason] = useState("")
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const { data, isLoading } = useQuery({
    queryKey: ["advances"],
    queryFn: async () => {
      const res = await fetch("/api/advances")
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  const approveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/advances/${approveId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deductMonth: Number(deductMonth),
          deductYear: Number(deductYear),
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
      toast({ title: "Đã duyệt tạm ứng" })
      setApproveId(null)
    },
    onError: (err) => toast({ title: "Lỗi", description: err.message, variant: "destructive" }),
  })

  const rejectMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/advances/${rejectId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectionReason: rejectReason }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advances"] })
      toast({ title: "Đã từ chối tạm ứng" })
      setRejectId(null)
      setRejectReason("")
    },
    onError: (err) => toast({ title: "Lỗi", description: err.message, variant: "destructive" }),
  })

  const allAdvances: Advance[] = data?.data || []
  const advances = filterStatus === "ALL" ? allAdvances : allAdvances.filter((a) => a.status === filterStatus)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1E3A5F" }}>Tạm Ứng Lương</h1>
          {baseSalary && !isHR && (
            <p className="text-sm text-muted-foreground">
              Lương cơ bản: {baseSalary.toLocaleString("vi-VN")}đ | Tối đa xin: {Math.floor(baseSalary * 0.5).toLocaleString("vi-VN")}đ
            </p>
          )}
        </div>
        {!isHR && (
          <Button
            style={{ backgroundColor: "#1E3A5F" }}
            onClick={() => setShowForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Xin Tạm Ứng
          </Button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {[{ value: "ALL", label: "Tất cả" }, { value: "PENDING", label: "Chờ duyệt" }, { value: "APPROVED", label: "Đã duyệt" }, { value: "REJECTED", label: "Từ chối" }, { value: "DEDUCTED", label: "Đã trừ lương" }].map((s) => (
          <Button
            key={s.value}
            variant={filterStatus === s.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus(s.value)}
            style={filterStatus === s.value ? { backgroundColor: "#1E3A5F" } : {}}
          >
            {s.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">Đang tải...</div>
      ) : advances.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Chưa có yêu cầu tạm ứng nào
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Danh Sách Tạm Ứng</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-background">
                  <tr className="border-b bg-muted/50">
                    {isHR && <th className="text-left py-2 px-3">Nhân Viên</th>}
                    <th className="text-right py-2 px-3">Số Tiền</th>
                    <th className="text-left py-2 px-3">Lý Do</th>
                    <th className="text-center py-2 px-3">Trạng Thái</th>
                    <th className="text-center py-2 px-3">Trừ Vào</th>
                    <th className="text-left py-2 px-3">Ngày Yêu Cầu</th>
                    {isHR && <th className="text-center py-2 px-3">Thao Tác</th>}
                  </tr>
                </thead>
                <tbody>
                  {advances.map((a) => {
                    const st = STATUS_MAP[a.status] || { label: a.status, variant: "secondary" as const }
                    return (
                      <tr key={a.id} className="border-b hover:bg-muted/30">
                        {isHR && (
                          <td className="py-2 px-3">
                            <div className="font-medium">{a.employee.fullName}</div>
                            <div className="text-xs text-muted-foreground">{a.employee.employeeCode}</div>
                          </td>
                        )}
                        <td className="py-2 px-3 text-right font-medium">{fmtMoney(a.amount)}</td>
                        <td className="py-2 px-3 max-w-[200px] truncate">{a.reason}</td>
                        <td className="py-2 px-3 text-center">
                          <Badge variant={st.variant}>{st.label}</Badge>
                          {a.rejectionReason && (
                            <p className="text-xs text-red-500 mt-1">{a.rejectionReason}</p>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {a.deductMonth && a.deductYear
                            ? `${String(a.deductMonth).padStart(2, "0")}/${a.deductYear}`
                            : "—"}
                        </td>
                        <td className="py-2 px-3">{fmtDate(a.requestedAt)}</td>
                        {isHR && (
                          <td className="py-2 px-3 text-center">
                            {a.status === "PENDING" && (
                              <div className="flex gap-1 justify-center">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 border-green-300"
                                  onClick={() => {
                                    setApproveId(a.id)
                                    setDeductMonth(String(currentMonth))
                                    setDeductYear(String(currentYear))
                                  }}
                                >
                                  Duyệt
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-300"
                                  onClick={() => setRejectId(a.id)}
                                >
                                  Từ chối
                                </Button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <AdvanceForm open={showForm} onClose={() => setShowForm(false)} baseSalary={baseSalary} />

      {/* Approve Dialog */}
      <Dialog open={!!approveId} onOpenChange={(o) => !o && setApproveId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duyệt Tạm Ứng</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Trừ vào tháng</Label>
              <div className="flex gap-2">
                <Select value={deductMonth} onValueChange={setDeductMonth}>
                  <SelectTrigger><SelectValue placeholder="Tháng" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={String(currentMonth)}>
                      Tháng {currentMonth}
                    </SelectItem>
                    <SelectItem value={String(currentMonth === 12 ? 1 : currentMonth + 1)}>
                      Tháng {currentMonth === 12 ? 1 : currentMonth + 1}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={deductYear}
                  onChange={(e) => setDeductYear(e.target.value)}
                  placeholder="Năm"
                  className="w-24"
                />
              </div>
            </div>
            <Button
              className="w-full"
              style={{ backgroundColor: "#1E3A5F" }}
              disabled={!deductMonth || !deductYear || approveMutation.isPending}
              onClick={() => approveMutation.mutate()}
            >
              {approveMutation.isPending ? "Đang duyệt..." : "Xác Nhận Duyệt"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejectId} onOpenChange={(o) => !o && setRejectId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ Chối Tạm Ứng</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Lý do từ chối (bắt buộc)</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="VD: Đã tạm ứng tháng trước"
                rows={3}
              />
            </div>
            <Button
              variant="destructive"
              className="w-full"
              disabled={!rejectReason.trim() || rejectMutation.isPending}
              onClick={() => rejectMutation.mutate()}
            >
              {rejectMutation.isPending ? "Đang xử lý..." : "Xác Nhận Từ Chối"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
