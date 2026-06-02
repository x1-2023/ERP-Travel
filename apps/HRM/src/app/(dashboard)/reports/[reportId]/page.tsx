"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ReportTimeline } from "@/components/reports/report-timeline"
import { Skeleton } from "@/components/ui/skeleton"
import { getTypeConfig, getStatusConfig } from "@/components/reports/report-card"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Send, XCircle, CheckCircle2, RotateCcw, Lock } from "lucide-react"
import { useState } from "react"
import { formatCurrency } from "@/lib/utils/format"

export default function ReportDetailPage() {
  const router = useRouter()
  const params = useParams()
  const reportId = params.reportId as string
  const { data: session } = useSession()
  const qc = useQueryClient()
  const role = session?.user?.role || ""

  const [returnReason, setReturnReason] = useState("")
  const [actionError, setActionError] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["report", reportId],
    queryFn: async () => {
      const res = await fetch(`/api/reports/${reportId}`)
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  const doAction = useMutation({
    mutationFn: async ({ action, body }: { action: string; body?: Record<string, unknown> }) => {
      const res = await fetch(`/api/reports/${reportId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || "Lỗi")
      return d
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["report", reportId] })
      qc.invalidateQueries({ queryKey: ["reports"] })
      setReturnReason("")
      setActionError("")
    },
    onError: (e: Error) => setActionError(e.message),
  })

  if (isLoading) return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-24" />
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader><Skeleton className="h-5 w-20" /></CardHeader>
          <CardContent><Skeleton className="h-20 w-full" /></CardContent>
        </Card>
      </div>
    </div>
  )

  const report = data?.data
  if (!report) {
    return (
      <div>
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <p className="text-muted-foreground mt-4">Không tìm thấy đơn</p>
      </div>
    )
  }

  const tc = getTypeConfig(report.type)
  const sc = getStatusConfig(report.status)
  const Icon = tc.icon
  const payload = report.payload || {}
  const activities = report.activities || []

  const isOwner = session?.user?.id === report.employee?.userId
  const isDeptMgr = role === "DEPT_MANAGER"
  const isHR = ["SUPER_ADMIN", "HR_MANAGER"].includes(role)

  // Actions available based on status + role
  const canSubmit = isOwner && report.status === "DRAFT"
  const canCancel = isOwner && report.status === "DRAFT"
  const canResubmit = isOwner && (report.status === "RETURNED_L1" || report.status === "RETURNED_L2")
  const canApproveL1 = isDeptMgr && report.status === "SUBMITTED"
  const canReturnL1 = isDeptMgr && report.status === "SUBMITTED"
  const canApproveL2 = isHR && report.status === "APPROVED_L1"
  const canReturnL2 = isHR && report.status === "APPROVED_L1"
  const canClose = isHR && report.status === "APPROVED_FINAL"

  return (
    <div>
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Quay lại
      </Button>

      {actionError && (
        <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded mb-4">
          {actionError}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${tc.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{tc.label}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {report.employee?.employeeCode} — {report.employee?.fullName}
                    </p>
                  </div>
                </div>
                <Badge className={sc.className} variant="secondary">
                  {sc.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Ngày bắt đầu</span>
                  <p className="font-medium">
                    {format(new Date(report.startDate), "dd/MM/yyyy", { locale: vi })}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Ngày kết thúc</span>
                  <p className="font-medium">
                    {format(new Date(report.endDate), "dd/MM/yyyy", { locale: vi })}
                  </p>
                </div>
              </div>

              {/* Type-specific details */}
              {report.type === "BUSINESS_TRIP" && (
                <div className="bg-blue-50 rounded p-3 text-sm space-y-1">
                  <p>Số đêm: <strong>{payload.nightCount || 0}</strong></p>
                  {payload.allowancePerDay && (
                    <p>Phụ cấp/ngày: <strong>{formatCurrency(payload.allowancePerDay)}</strong></p>
                  )}
                </div>
              )}
              {report.type === "OVERTIME" && (
                <div className="bg-orange-50 rounded p-3 text-sm space-y-1">
                  <p>Loại OT: <strong>
                    {{WEEKDAY: "Ngày thường", WEEKEND: "Cuối tuần", HOLIDAY: "Ngày lễ", NIGHT_SHIFT: "Ca đêm"}[payload.otType as string] || payload.otType}
                  </strong></p>
                  <p>Thời gian: <strong>{payload.startTime} → {payload.endTime}</strong></p>
                  <p>Số giờ: <strong>{payload.hours || 0}h</strong></p>
                </div>
              )}
              {report.type.startsWith("LEAVE_") && (
                <div className="bg-green-50 rounded p-3 text-sm">
                  <p>Số ngày nghỉ: <strong>{payload.dayCount || 0}</strong></p>
                </div>
              )}

              {report.notes && (
                <div>
                  <span className="text-sm text-muted-foreground">Ghi chú</span>
                  <p className="text-sm mt-1">{report.notes}</p>
                </div>
              )}

              {report.returnReason && (
                <div className="bg-red-50 rounded p-3">
                  <span className="text-sm font-medium text-red-700">Lý do trả lại</span>
                  <p className="text-sm text-red-600 mt-1">{report.returnReason}</p>
                </div>
              )}

              {report.payrollItemId && (
                <div className="bg-emerald-50 rounded p-3 text-sm">
                  <p className="text-emerald-700">Đã tạo khoản lương từ đơn này</p>
                </div>
              )}

              {report.status === "CLOSED" && (
                <div className="bg-gray-50 rounded p-3 text-sm">
                  <p className="text-gray-700 font-medium">Đơn đã đóng</p>
                  {report.closedAt && (
                    <p className="text-gray-500 mt-1">
                      Ngày đóng: {format(new Date(report.closedAt), "dd/MM/yyyy", { locale: vi })}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {(canSubmit || canCancel || canResubmit || canApproveL1 || canReturnL1 || canApproveL2 || canReturnL2 || canClose) && (
            <Card>
              <CardContent className="py-4 space-y-3">
                {/* Return reason input */}
                {(canReturnL1 || canReturnL2) && (
                  <div>
                    <Label>Lý do trả lại</Label>
                    <Textarea
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      placeholder="Nhập lý do trả lại..."
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {canSubmit && (
                    <Button
                      style={{ backgroundColor: "#1E3A5F" }}
                      onClick={() => doAction.mutate({ action: "submit" })}
                      disabled={doAction.isPending}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Nộp đơn
                    </Button>
                  )}
                  {canCancel && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" disabled={doAction.isPending}>
                          <XCircle className="h-4 w-4 mr-2" />
                          Hủy đơn
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xác nhận hủy đơn?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Đơn sẽ bị hủy và không thể khôi phục. Bạn có chắc chắn muốn tiếp tục?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Không</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => doAction.mutate({ action: "cancel" })}
                          >
                            Hủy đơn
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  {canResubmit && (
                    <Button
                      style={{ backgroundColor: "#1E3A5F" }}
                      onClick={() => doAction.mutate({ action: "resubmit" })}
                      disabled={doAction.isPending}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Nộp lại
                    </Button>
                  )}
                  {canApproveL1 && (
                    <Button
                      className="bg-sky-600 hover:bg-sky-700"
                      onClick={() => doAction.mutate({ action: "approve-l1" })}
                      disabled={doAction.isPending}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Duyệt (L1)
                    </Button>
                  )}
                  {canReturnL1 && (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (!returnReason) { setActionError("Vui lòng nhập lý do trả lại"); return }
                        doAction.mutate({ action: "return-l1", body: { reason: returnReason } })
                      }}
                      disabled={doAction.isPending}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Trả lại (L1)
                    </Button>
                  )}
                  {canApproveL2 && (
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => doAction.mutate({ action: "approve-l2" })}
                      disabled={doAction.isPending}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Duyệt (L2 - Final)
                    </Button>
                  )}
                  {canReturnL2 && (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (!returnReason) { setActionError("Vui lòng nhập lý do trả lại"); return }
                        doAction.mutate({ action: "return-l2", body: { reason: returnReason } })
                      }}
                      disabled={doAction.isPending}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Trả lại (L2)
                    </Button>
                  )}
                  {canClose && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" disabled={doAction.isPending}>
                          <Lock className="h-4 w-4 mr-2" />
                          Đóng đơn
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Đóng đơn này?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Hành động không thể hoàn tác. Bạn có chắc chắn muốn đóng đơn?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Không</AlertDialogCancel>
                          <AlertDialogAction onClick={() => doAction.mutate({ action: "close" })}>
                            Đóng đơn
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Timeline sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lịch sử</CardTitle>
            </CardHeader>
            <CardContent>
              <ReportTimeline activities={activities} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
