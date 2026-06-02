"use client"

import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  Send,
  CheckCircle2,
  RotateCcw,
  XCircle,
  FileEdit,
  Shield,
} from "lucide-react"

interface Activity {
  id: string
  action: string
  actorRole: string
  comment: string | null
  createdAt: string
  actor?: { name: string | null; email: string }
}

const ACTION_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  SUBMITTED: { label: "Đã nộp", icon: Send, color: "text-amber-600" },
  APPROVED_L1: { label: "TP đã duyệt", icon: CheckCircle2, color: "text-sky-600" },
  APPROVED_FINAL: { label: "HR đã duyệt", icon: Shield, color: "text-emerald-600" },
  RETURNED_L1: { label: "TP trả lại", icon: RotateCcw, color: "text-red-600" },
  RETURNED_L2: { label: "HR trả lại", icon: RotateCcw, color: "text-red-600" },
  CANCELLED: { label: "Đã hủy", icon: XCircle, color: "text-gray-500" },
  RESUBMITTED: { label: "Nộp lại", icon: FileEdit, color: "text-amber-600" },
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  HR_MANAGER: "HR Manager",
  HR_STAFF: "HR Staff",
  DEPT_MANAGER: "Trưởng phòng",
  EMPLOYEE: "Nhân viên",
  ACCOUNTANT: "Kế toán",
}

interface ReportTimelineProps {
  activities: Activity[]
}

export function ReportTimeline({ activities }: ReportTimelineProps) {
  if (activities.length === 0) {
    return <p className="text-sm text-muted-foreground">Chưa có hoạt động</p>
  }

  return (
    <div className="space-y-4">
      {activities.map((act, i) => {
        const cfg = ACTION_CONFIG[act.action] || {
          label: act.action,
          icon: FileEdit,
          color: "text-gray-500",
        }
        const Icon = cfg.icon

        return (
          <div key={act.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`p-1 rounded-full bg-white ${cfg.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              {i < activities.length - 1 && (
                <div className="w-px flex-1 bg-border mt-1" />
              )}
            </div>
            <div className="pb-4">
              <p className="text-sm font-medium">{cfg.label}</p>
              <p className="text-xs text-muted-foreground">
                {act.actor?.name || act.actor?.email || ROLE_LABELS[act.actorRole] || act.actorRole}
                {" • "}
                {format(new Date(act.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
              </p>
              {act.comment && (
                <p className="text-sm text-red-600 mt-1 bg-red-50 px-2 py-1 rounded">
                  {act.comment}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
