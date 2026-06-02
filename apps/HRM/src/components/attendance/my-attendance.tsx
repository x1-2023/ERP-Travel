"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ATTENDANCE_STATUS_ICONS, ATTENDANCE_STATUS_LABELS } from "@/lib/constants/labels"

interface AttendanceRecord {
  id: string
  date: string
  checkInAt: string | null
  checkOutAt: string | null
  status: string
  workHours: number | string | null
  isManualEdit: boolean
}

const now = new Date()
const currentMonth = now.getMonth() + 1
const currentYear = now.getFullYear()

function fmtTime(iso: string | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
}

function fmtDate(iso: string): string {
  const d = new Date(iso + "T00:00:00")
  const weekday = d.toLocaleDateString("vi-VN", { weekday: "long" })
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")} ${weekday}`
}

function fmtHours(h: number | string | null): string {
  if (h == null) return ""
  const n = Number(h)
  const hrs = Math.floor(n)
  const mins = Math.round((n - hrs) * 60)
  return `${hrs}h ${mins}p`
}

export function MyAttendance() {
  const [month, setMonth] = useState(String(currentMonth))
  const [year, setYear] = useState(String(currentYear))

  const { data, isLoading } = useQuery({
    queryKey: ["my-attendance", month, year],
    queryFn: async () => {
      const res = await fetch(`/api/attendance/me?month=${month}&year=${year}`)
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  const records: AttendanceRecord[] = data?.data || []
  const summary = data?.summary

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: "#1E3A5F" }}>Chấm Công Của Tôi</h1>
        <div className="flex items-center gap-2">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>Tháng {i + 1}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[90px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {summary && (
        <div className="flex gap-3 text-sm flex-wrap">
          <span>✅ {summary.present} đúng giờ</span>
          <span>🟡 {summary.late} trễ</span>
          {summary.halfDay > 0 && <span>🔵 {summary.halfDay} nửa ngày</span>}
          {summary.absent > 0 && <span>❌ {summary.absent} vắng</span>}
          {summary.leave > 0 && <span>📋 {summary.leave} phép</span>}
          <span className="font-medium" style={{ color: "#1E3A5F" }}>
            Ngày công: {summary.actualDays}
          </span>
        </div>
      )}

      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">Đang tải...</div>
      ) : records.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Chưa có dữ liệu chấm công tháng {month}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Tháng {month}/{year}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {records.map((r) => {
                const dateStr = typeof r.date === "string" ? r.date.split("T")[0] : r.date
                return (
                  <div key={r.id} className="flex items-center gap-3 py-2.5 px-4">
                    <span className="text-lg">{ATTENDANCE_STATUS_ICONS[r.status] || "⬜"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{fmtDate(dateStr)}</p>
                      <p className="text-xs text-muted-foreground">
                        Check-in {fmtTime(r.checkInAt)} → Check-out {fmtTime(r.checkOutAt)}
                        {r.workHours != null && ` (${fmtHours(r.workHours)})`}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {ATTENDANCE_STATUS_LABELS[r.status] || r.status}
                    </Badge>
                    {r.isManualEdit && (
                      <span className="text-xs text-amber-600" title="Đã sửa bởi HR">✏️</span>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
