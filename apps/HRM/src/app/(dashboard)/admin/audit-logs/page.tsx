"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

interface AuditLog {
  id: string
  userId: string | null
  action: string
  entity: string
  entityId: string | null
  actorName: string | null
  actorRole: string | null
  targetName: string | null
  oldData: Record<string, unknown> | null
  newData: Record<string, unknown> | null
  ipAddress: string | null
  createdAt: string
  user: { id: string; name: string | null; email: string } | null
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const ACTION_CONFIG: Record<string, { label: string; className: string }> = {
  CREATE: { label: "Tạo", className: "bg-emerald-100 text-emerald-700" },
  UPDATE: { label: "Cập nhật", className: "bg-blue-100 text-blue-700" },
  DELETE: { label: "Xóa", className: "bg-red-100 text-red-700" },
  LOGIN: { label: "Đăng nhập", className: "bg-gray-100 text-gray-700" },
  LOGOUT: { label: "Đăng xuất", className: "bg-gray-100 text-gray-700" },
  APPROVE: { label: "Duyệt", className: "bg-emerald-100 text-emerald-700" },
  REJECT: { label: "Từ chối", className: "bg-red-100 text-red-700" },
  EXPORT: { label: "Xuất file", className: "bg-purple-100 text-purple-700" },
  KPI_PUBLISH: { label: "Công bố KPI", className: "bg-teal-100 text-teal-700" },
  PAYROLL_MARK_PAID: { label: "Thanh toán lương", className: "bg-blue-100 text-blue-700" },
  PAYSLIP_EMAIL_SENT: { label: "Gửi phiếu lương", className: "bg-indigo-100 text-indigo-700" },
  OFFBOARDING_CANCELLED: { label: "Hủy offboarding", className: "bg-red-100 text-red-700" },
  REPORTS_BATCH_CLOSED: { label: "Đóng báo cáo", className: "bg-gray-100 text-gray-700" },
  DOCUMENT_GENERATE: { label: "Tạo hồ sơ", className: "bg-cyan-100 text-cyan-700" },
  DATA_IMPORT: { label: "Nhập dữ liệu", className: "bg-violet-100 text-violet-700" },
  DATA_IMPORT_ROLLBACK: { label: "Hoàn tác nhập", className: "bg-orange-100 text-orange-700" },
}

const ENTITY_LABELS: Record<string, string> = {
  PayrollPeriod: "Bảng lương",
  SalaryAdvance: "Tạm ứng",
  KPIPeriod: "KPI",
  Employee: "Nhân viên",
  User: "Người dùng",
  OffboardingInstance: "Offboarding",
  Report: "Báo cáo",
  DocumentTemplate: "Hồ sơ mẫu",
  ImportSession: "Phiên nhập dữ liệu",
}

export default function AuditLogsPage() {
  const [page, setPage] = useState(1)
  const [actionFilter, setActionFilter] = useState("")
  const [entityFilter, setEntityFilter] = useState("")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const limit = 30

  const queryParams = new URLSearchParams()
  queryParams.set("page", String(page))
  queryParams.set("limit", String(limit))
  if (actionFilter) queryParams.set("action", actionFilter)
  if (entityFilter) queryParams.set("entity", entityFilter)
  if (fromDate) queryParams.set("from", fromDate)
  if (toDate) queryParams.set("to", toDate)

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", page, actionFilter, entityFilter, fromDate, toDate],
    queryFn: async () => {
      const res = await fetch(`/api/audit-logs?${queryParams.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  const logs: AuditLog[] = data?.data || []
  const pagination: Pagination = data?.pagination || { page: 1, limit, total: 0, totalPages: 0 }

  function formatTime(dateStr: string) {
    const d = new Date(dateStr)
    return d.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#1E3A5F" }}>
        Nhật Ký Hệ Thống
      </h1>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Hành động</label>
              <Select value={actionFilter || "__all__"} onValueChange={(v) => { setActionFilter(v === "__all__" ? "" : v); setPage(1) }}>
                <SelectTrigger className="mt-1 w-[130px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Tất cả</SelectItem>
                  <SelectItem value="CREATE">Tạo</SelectItem>
                  <SelectItem value="UPDATE">Cập nhật</SelectItem>
                  <SelectItem value="DELETE">Xóa</SelectItem>
                  <SelectItem value="APPROVE">Duyệt</SelectItem>
                  <SelectItem value="REJECT">Từ chối</SelectItem>
                  <SelectItem value="EXPORT">Xuất file</SelectItem>
                  <SelectItem value="LOGIN">Đăng nhập</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Đối tượng</label>
              <Select value={entityFilter || "__all__"} onValueChange={(v) => { setEntityFilter(v === "__all__" ? "" : v); setPage(1) }}>
                <SelectTrigger className="mt-1 w-[130px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Tất cả</SelectItem>
                  <SelectItem value="PayrollPeriod">Bảng lương</SelectItem>
                  <SelectItem value="SalaryAdvance">Tạm ứng</SelectItem>
                  <SelectItem value="KPIPeriod">KPI</SelectItem>
                  <SelectItem value="Employee">Nhân viên</SelectItem>
                  <SelectItem value="User">Người dùng</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Từ ngày</label>
              <Input
                type="date"
                className="mt-1"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setPage(1) }}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Đến ngày</label>
              <Input
                type="date"
                className="mt-1"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setPage(1) }}
              />
            </div>
            {(actionFilter || entityFilter || fromDate || toDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setActionFilter("")
                  setEntityFilter("")
                  setFromDate("")
                  setToDate("")
                  setPage(1)
                }}
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Log table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            {pagination.total > 0 ? `${pagination.total} bản ghi` : "Không có bản ghi"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground py-4">Đang tải...</p>
          ) : logs.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center">Chưa có nhật ký nào</p>
          ) : (
            <div className="space-y-0">
              {logs.map((log) => {
                const ac = ACTION_CONFIG[log.action] || { label: log.action, className: "bg-gray-100 text-gray-700" }
                const entityLabel = ENTITY_LABELS[log.entity] || log.entity
                const isExpanded = expandedId === log.id
                const hasMetadata = log.newData || log.oldData

                return (
                  <div key={log.id} className="border-b last:border-b-0">
                    <div
                      className={`flex items-center gap-3 py-3 px-2 ${hasMetadata ? "cursor-pointer hover:bg-muted/50" : ""}`}
                      onClick={() => hasMetadata && setExpandedId(isExpanded ? null : log.id)}
                    >
                      <Badge className={`${ac.className} shrink-0 w-20 justify-center`}>
                        {ac.label}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm">
                          <span className="font-medium">
                            {log.actorName || log.user?.name || log.user?.email || "System"}
                          </span>
                          {log.actorRole && (
                            <span className="text-muted-foreground text-xs ml-1">
                              ({log.actorRole})
                            </span>
                          )}
                          <span className="text-muted-foreground"> — </span>
                          <span>{entityLabel}</span>
                          {log.targetName && (
                            <span className="font-medium"> {log.targetName}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground shrink-0">
                        {formatTime(log.createdAt)}
                      </div>
                      {hasMetadata && (
                        <div className="shrink-0 text-muted-foreground">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      )}
                    </div>
                    {isExpanded && hasMetadata && (
                      <div className="px-2 pb-3 pl-24">
                        <pre className="text-xs bg-muted rounded p-3 overflow-x-auto max-h-48">
                          {JSON.stringify(log.newData || log.oldData, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <span className="text-sm text-muted-foreground">
                Trang {pagination.page} / {pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
