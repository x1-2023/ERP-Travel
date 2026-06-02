"use client"

import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Palmtree, ClipboardCheck } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { ReportCard, type ReportItem } from "@/components/reports/report-card"
import { REPORT_TYPE_LABELS } from "@/lib/constants/labels"
import { useState, useMemo } from "react"

const TYPE_OPTIONS = [
  { value: "ALL", label: "Tất cả loại" },
  ...Object.entries(REPORT_TYPE_LABELS).map(([value, label]) => ({ value, label })),
]

const STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "DRAFT", label: "Nháp" },
  { value: "SUBMITTED", label: "Đã nộp" },
  { value: "APPROVED_L1", label: "TP đã duyệt" },
  { value: "APPROVED_FINAL", label: "Đã duyệt" },
  { value: "RETURNED_L1", label: "TP trả lại" },
  { value: "RETURNED_L2", label: "HR trả lại" },
  { value: "CLOSED", label: "Đã đóng" },
  { value: "CANCELLED", label: "Đã hủy" },
]

export default function ReportsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const role = session?.user?.role
  const isEmployee = role === "EMPLOYEE"

  const [filterType, setFilterType] = useState("ALL")
  const [filterStatus, setFilterStatus] = useState("ALL")

  const params = new URLSearchParams()
  if (filterType !== "ALL") params.set("type", filterType)
  if (filterStatus !== "ALL") params.set("status", filterStatus)
  const qs = params.toString() ? `?${params.toString()}` : ""

  const { data, isLoading } = useQuery({
    queryKey: ["reports", filterType, filterStatus],
    queryFn: async () => {
      const res = await fetch(`/api/reports${qs}`)
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  const { data: balanceData } = useQuery({
    queryKey: ["leave-balance"],
    queryFn: async () => {
      const res = await fetch("/api/reports?type=LEAVE_PAID&status=APPROVED_FINAL")
      return res.json()
    },
    enabled: isEmployee,
  })

  const reports: ReportItem[] = data?.data || []
  const PAGE_SIZE = 20
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const visibleReports = useMemo(() => reports.slice(0, visibleCount), [reports, visibleCount])

  return (
    <div>
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-background z-10 py-3 -mt-3">
        <h1 className="text-2xl font-bold" style={{ color: "#1E3A5F" }}>
          {isEmployee ? "Đơn Của Tôi" : "Quản Lý Đơn Từ"}
        </h1>
        <Button
          style={{ backgroundColor: "#1E3A5F" }}
          onClick={() => router.push("/reports/new")}
        >
          <Plus className="h-4 w-4 mr-2" />
          {isEmployee ? "Tạo Đơn Mới" : "Tạo Đơn"}
        </Button>
      </div>

      {isEmployee && (
        <Card className="mb-4">
          <CardContent className="py-3 px-5 flex items-center gap-3">
            <Palmtree className="h-5 w-5 text-green-600" />
            <span className="text-sm">
              Số ngày phép còn lại:{" "}
              <strong className="text-green-700">
                {balanceData === undefined ? "đang tải..." : `${Math.max(0, 12 - (balanceData?.data?.length || 0))} ngày`}
              </strong>
            </span>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3 mb-4">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(filterType !== "ALL" || filterStatus !== "ALL") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setFilterType("ALL"); setFilterStatus("ALL") }}
          >
            Xoá bộ lọc
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="py-4 px-5">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-3 w-12" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck className="h-10 w-10" />}
          title={isEmployee ? "Chưa có đơn nào" : "Chưa có đơn từ nào"}
          description={isEmployee ? "Tạo đơn nghỉ phép, tăng ca hoặc công tác." : "Chưa có đơn từ nào cần xử lý."}
          action={{ label: isEmployee ? "+ Tạo Đơn Mới" : "+ Tạo Đơn", href: "/reports/new" }}
        />
      ) : (
        <div className="space-y-3">
          {visibleReports.map((r) => (
            <ReportCard
              key={r.id}
              report={r}
              onClick={() => router.push(`/reports/${r.id}`)}
              showEmployee={!isEmployee}
            />
          ))}
          {visibleCount < reports.length && (
            <div className="text-center pt-2">
              <Button variant="outline" size="sm" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
                Xem thêm ({reports.length - visibleCount} còn lại)
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
