"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  Plane,
  Clock,
  Palmtree,
  Baby,
  Heart,
  Briefcase,
  FileText,
} from "lucide-react"
import { REPORT_TYPE_LABELS } from "@/lib/constants/labels"

export interface ReportItem {
  id: string
  type: string
  status: string
  startDate: string
  endDate: string
  notes: string | null
  payload: Record<string, unknown>
  createdAt: string
  submittedAt: string | null
  returnReason: string | null
  employee: {
    id: string
    fullName: string
    employeeCode: string
    department?: { id: string; name: string }
  }
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
  BUSINESS_TRIP: { icon: Plane, color: "bg-blue-100 text-blue-700" },
  OVERTIME: { icon: Clock, color: "bg-orange-100 text-orange-700" },
  LEAVE_PAID: { icon: Palmtree, color: "bg-green-100 text-green-700" },
  LEAVE_UNPAID: { icon: Palmtree, color: "bg-gray-100 text-gray-700" },
  LEAVE_MATERNITY: { icon: Baby, color: "bg-pink-100 text-pink-700" },
  LEAVE_SICK: { icon: Heart, color: "bg-red-100 text-red-700" },
  LEAVE_WEDDING: { icon: Briefcase, color: "bg-purple-100 text-purple-700" },
  NOTE: { icon: FileText, color: "bg-slate-100 text-slate-700" },
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Nháp", className: "bg-gray-100 text-gray-800" },
  SUBMITTED: { label: "Đã nộp", className: "bg-amber-100 text-amber-800" },
  APPROVED_L1: { label: "TP đã duyệt", className: "bg-sky-100 text-sky-800" },
  APPROVED_FINAL: { label: "Đã duyệt", className: "bg-emerald-100 text-emerald-800" },
  RETURNED_L1: { label: "TP trả lại", className: "bg-red-100 text-red-800" },
  RETURNED_L2: { label: "HR trả lại", className: "bg-red-100 text-red-800" },
  CANCELLED: { label: "Đã hủy", className: "bg-gray-200 text-gray-700" },
  CLOSED: { label: "Đã đóng", className: "bg-gray-200 text-gray-700" },
}

export function getTypeConfig(type: string) {
  const config = TYPE_CONFIG[type] || { icon: FileText, color: "bg-gray-100 text-gray-700" }
  return { ...config, label: REPORT_TYPE_LABELS[type] || type }
}

export function getStatusConfig(status: string) {
  return STATUS_CONFIG[status] || { label: status, className: "bg-gray-100 text-gray-700" }
}

interface ReportCardProps {
  report: ReportItem
  onClick: () => void
  showEmployee?: boolean
}

export function ReportCard({ report, onClick, showEmployee }: ReportCardProps) {
  const tc = getTypeConfig(report.type)
  const sc = getStatusConfig(report.status)
  const Icon = tc.icon

  const payload = report.payload || {}
  let detail = ""
  if (report.type === "BUSINESS_TRIP") {
    detail = `${payload.nightCount || 0} đêm`
  } else if (report.type === "OVERTIME") {
    detail = `${payload.hours || 0}h (${payload.otType || ""})`
  } else if (report.type.startsWith("LEAVE_")) {
    detail = `${payload.dayCount || 0} ngày`
  }

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow active:bg-muted/50"
      onClick={onClick}
    >
      <CardContent className="py-4 px-5 min-h-[64px]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`p-2 rounded-lg ${tc.color} shrink-0`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{tc.label}</span>
                <Badge className={sc.className} variant="secondary">
                  {sc.label}
                </Badge>
              </div>
              {showEmployee && (
                <p className="text-sm text-muted-foreground">
                  {report.employee.employeeCode} — {report.employee.fullName}
                  {report.employee.department && ` (${report.employee.department.name})`}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(report.startDate), "dd/MM/yyyy", { locale: vi })}
                {" → "}
                {format(new Date(report.endDate), "dd/MM/yyyy", { locale: vi })}
                {detail && ` • ${detail}`}
              </p>
              {report.returnReason && (
                <p className="text-xs text-red-600 mt-1">
                  Lý do trả: {report.returnReason}
                </p>
              )}
            </div>
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            {format(new Date(report.createdAt), "dd/MM", { locale: vi })}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
