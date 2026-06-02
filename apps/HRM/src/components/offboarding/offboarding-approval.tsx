"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils/format"
import { CheckCircle2, XCircle, Clock } from "lucide-react"

interface OffboardingApprovalProps {
  instance: {
    id: string
    status: string
    resignationDate: string
    lastWorkingDate: string | null
    resignReason: string | null
    resignDecisionNo: string | null
    managerApprovedAt: string | null
    hrApprovedAt: string | null
    completedAt: string | null
    notes: string | null
    createdAt: string
    employee: { fullName: string; employeeCode: string }
  }
  userRole: string
  onUpdate: () => void
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  INITIATED: { label: "Chờ QL duyệt", className: "bg-amber-100 text-amber-700" },
  MANAGER_APPROVED: { label: "Chờ HR duyệt", className: "bg-orange-100 text-orange-700" },
  IN_PROGRESS: { label: "Đang xử lý", className: "bg-blue-100 text-blue-700" },
  COMPLETED: { label: "Hoàn tất", className: "bg-emerald-100 text-emerald-700" },
  CANCELLED: { label: "Đã hủy", className: "bg-red-100 text-red-700" },
}

export function OffboardingApproval({ instance, userRole, onUpdate }: OffboardingApprovalProps) {
  const [showReject, setShowReject] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [showHRApprove, setShowHRApprove] = useState(false)
  const [lastWorkingDate, setLastWorkingDate] = useState("")
  const [resignDecisionNo, setResignDecisionNo] = useState("")
  const [error, setError] = useState("")

  const cfg = STATUS_CONFIG[instance.status] || STATUS_CONFIG.INITIATED
  const canManagerApprove =
    instance.status === "INITIATED" &&
    ["DEPT_MANAGER", "SUPER_ADMIN", "HR_MANAGER"].includes(userRole)
  const canHRApprove =
    instance.status === "MANAGER_APPROVED" &&
    ["HR_MANAGER", "SUPER_ADMIN"].includes(userRole)

  const managerApproveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/offboarding/${instance.id}/manager-approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
    },
    onSuccess: onUpdate,
    onError: (err) => setError(err.message),
  })

  const managerRejectMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/offboarding/${instance.id}/manager-reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
    },
    onSuccess: onUpdate,
    onError: (err) => setError(err.message),
  })

  const hrApproveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/offboarding/${instance.id}/hr-approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastWorkingDate, resignDecisionNo }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
    },
    onSuccess: onUpdate,
    onError: (err) => setError(err.message),
  })

  const hrRejectMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/offboarding/${instance.id}/hr-reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
    },
    onSuccess: onUpdate,
    onError: (err) => setError(err.message),
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Trạng Thái Duyệt</CardTitle>
          <Badge className={cfg.className}>{cfg.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          <div className="text-sm">
            <span className="text-muted-foreground">Ngày muốn nghỉ:</span>{" "}
            <span className="font-medium">{formatDate(instance.resignationDate)}</span>
          </div>
          {instance.resignReason && (
            <div className="text-sm">
              <span className="text-muted-foreground">Lý do:</span>{" "}
              <span className="font-medium">{instance.resignReason}</span>
            </div>
          )}
          {instance.lastWorkingDate && (
            <div className="text-sm">
              <span className="text-muted-foreground">Ngày làm cuối:</span>{" "}
              <span className="font-medium">{formatDate(instance.lastWorkingDate)}</span>
            </div>
          )}
          {instance.resignDecisionNo && (
            <div className="text-sm">
              <span className="text-muted-foreground">Số QĐ:</span>{" "}
              <span className="font-medium">{instance.resignDecisionNo}</span>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="space-y-3 border-l-2 border-slate-200 pl-4 mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm">
              {formatDate(instance.createdAt)} — NV nộp đơn
            </span>
          </div>
          <div className="flex items-center gap-2">
            {instance.managerApprovedAt ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : instance.status === "CANCELLED" ? (
              <XCircle className="h-4 w-4 text-red-500" />
            ) : (
              <Clock className="h-4 w-4 text-amber-500" />
            )}
            <span className="text-sm">
              {instance.managerApprovedAt
                ? `${formatDate(instance.managerApprovedAt)} — Quản lý đồng ý`
                : instance.status === "CANCELLED" && !instance.hrApprovedAt
                  ? "Bị từ chối"
                  : "Chờ quản lý duyệt..."}
            </span>
          </div>
          {instance.status !== "INITIATED" && instance.status !== "CANCELLED" && (
            <div className="flex items-center gap-2">
              {instance.hrApprovedAt ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Clock className="h-4 w-4 text-amber-500" />
              )}
              <span className="text-sm">
                {instance.hrApprovedAt
                  ? `${formatDate(instance.hrApprovedAt)} — HR phê duyệt`
                  : "Chờ HR phê duyệt..."}
              </span>
            </div>
          )}
          {instance.completedAt && (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm">
                {formatDate(instance.completedAt)} — Offboarding hoàn tất
              </span>
            </div>
          )}
        </div>

        {instance.status === "CANCELLED" && instance.notes && (
          <div className="bg-red-50 rounded p-3 mb-4">
            <span className="text-sm font-medium text-red-700">Lý do hủy</span>
            <p className="text-sm text-red-600 mt-1 whitespace-pre-line">{instance.notes}</p>
          </div>
        )}
        {instance.status !== "CANCELLED" && instance.notes && (
          <p className="text-sm text-muted-foreground mb-4">Ghi chú: {instance.notes}</p>
        )}

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        {/* Manager actions */}
        {canManagerApprove && (
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              style={{ backgroundColor: "#1E3A5F" }}
              disabled={managerApproveMutation.isPending}
              onClick={() => managerApproveMutation.mutate()}
            >
              {managerApproveMutation.isPending ? "Đang duyệt..." : "QL Đồng Ý"}
            </Button>
            {!showReject ? (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setShowReject(true)}
              >
                QL Từ Chối
              </Button>
            ) : (
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="Lý do từ chối..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-60"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={!rejectReason || managerRejectMutation.isPending}
                  onClick={() => managerRejectMutation.mutate()}
                >
                  Xác nhận
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowReject(false)}>
                  Hủy
                </Button>
              </div>
            )}
          </div>
        )}

        {/* HR actions */}
        {canHRApprove && !showHRApprove && !showReject && (
          <div className="flex gap-2">
            <Button
              size="sm"
              style={{ backgroundColor: "#1E3A5F" }}
              onClick={() => setShowHRApprove(true)}
            >
              HR Duyệt — Xác nhận ngày làm cuối
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setShowReject(true)}
            >
              HR Từ Chối
            </Button>
          </div>
        )}

        {canHRApprove && showHRApprove && (
          <div className="space-y-3 border rounded-md p-4">
            <div className="space-y-2">
              <Label>Ngày làm việc cuối *</Label>
              <Input
                type="date"
                value={lastWorkingDate}
                onChange={(e) => setLastWorkingDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Số quyết định nghỉ việc</Label>
              <Input
                value={resignDecisionNo}
                onChange={(e) => setResignDecisionNo(e.target.value)}
                placeholder="QĐ-XX/2026"
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                style={{ backgroundColor: "#1E3A5F" }}
                disabled={!lastWorkingDate || hrApproveMutation.isPending}
                onClick={() => hrApproveMutation.mutate()}
              >
                {hrApproveMutation.isPending ? "Đang xử lý..." : "Xác Nhận Duyệt"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowHRApprove(false)}>
                Hủy
              </Button>
            </div>
          </div>
        )}

        {canHRApprove && showReject && (
          <div className="flex gap-2 items-center mt-3">
            <Input
              placeholder="Lý do từ chối..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-60"
            />
            <Button
              size="sm"
              variant="destructive"
              disabled={!rejectReason || hrRejectMutation.isPending}
              onClick={() => hrRejectMutation.mutate()}
            >
              Xác nhận từ chối
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowReject(false)}>
              Hủy
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
