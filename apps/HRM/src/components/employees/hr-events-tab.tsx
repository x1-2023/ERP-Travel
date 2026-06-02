"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils/format"

interface HREventItem {
  id: string
  type: string
  status: string
  effectiveDate: string
  payload: Record<string, unknown>
  note: string | null
  rejectionReason: string | null
  requester: { id: string; name: string }
  createdAt: string
}

interface DisciplinaryItem {
  id: string
  level: string
  reason: string
  decisionNo: string | null
  issuedAt: string
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  DEPARTMENT_TRANSFER: "Chuyển phòng ban",
  PROMOTION: "Thăng chức",
  RECOGNITION: "Khen thưởng",
  DISCIPLINARY: "Kỷ luật",
  SALARY_ADJUSTMENT: "Điều chỉnh lương",
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Chờ duyệt", className: "bg-amber-100 text-amber-700" },
  APPROVED: { label: "Đã duyệt", className: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "Từ chối", className: "bg-red-100 text-red-700" },
}

export function HREventsTab({ employeeId }: { employeeId: string }) {
  const { data, isLoading } = useQuery<{ events: HREventItem[]; disciplinaryRecords: DisciplinaryItem[] }>({
    queryKey: ["hr-events", employeeId],
    queryFn: async () => {
      const res = await fetch(`/api/employees/${employeeId}/hr-events`)
      return res.json()
    },
  })

  if (isLoading) return <div className="text-center py-8 text-slate-400">Đang tải...</div>

  const events = data?.events || []
  const records = data?.disciplinaryRecords || []

  return (
    <div className="space-y-6">
      {/* HR Events Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Biến động nhân sự</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">Chưa có biến động</p>
          ) : (
            <div className="space-y-3">
              {events.map((ev) => (
                <div key={ev.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{EVENT_TYPE_LABELS[ev.type] || ev.type}</span>
                      <Badge className={STATUS_CONFIG[ev.status]?.className || ""}>{STATUS_CONFIG[ev.status]?.label || ev.status}</Badge>
                    </div>
                    <span className="text-xs text-slate-400">
                      {formatDate(ev.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Hiệu lực: {formatDate(ev.effectiveDate)} · Yêu cầu bởi: {ev.requester.name}
                  </p>
                  {ev.note && <p className="text-xs text-slate-500 mt-1">Ghi chú: {ev.note}</p>}
                  {ev.rejectionReason && (
                    <p className="text-xs text-red-500 mt-1">Lý do từ chối: {ev.rejectionReason}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Disciplinary Records */}
      {records.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hồ sơ kỷ luật</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {records.map((rec) => (
                <div key={rec.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="destructive">{rec.level}</Badge>
                    <span className="text-xs text-slate-400">
                      {formatDate(rec.issuedAt)}
                    </span>
                  </div>
                  <p className="text-sm">{rec.reason}</p>
                  {rec.decisionNo && (
                    <p className="text-xs text-slate-500 mt-1">Số QĐ: {rec.decisionNo}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
