"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RefreshCw, Upload } from "lucide-react"
import { ATTENDANCE_STATUS_ICONS, ATTENDANCE_STATUS_LABELS } from "@/lib/constants/labels"
import { useToast } from "@/hooks/use-toast"
import { AttendanceImportDialog } from "@/components/attendance/attendance-import"
import { AttendanceAIPanel } from "@/components/attendance/attendance-ai-panel"
import { TableSkeleton } from "@/components/ui/loading-state"

interface AttendanceRecord {
  id: string
  employeeId: string
  date: string
  checkInAt: string | null
  checkOutAt: string | null
  status: string
  workHours: number | string | null
  isManualEdit: boolean
  editNote: string | null
}

interface Employee {
  id: string
  employeeCode: string
  fullName: string
  department: { name: string } | null
}

const now = new Date()
const currentMonth = now.getMonth() + 1
const currentYear = now.getFullYear()

function fmtTime(iso: string | null): string {
  if (!iso) return "—"
  const d = new Date(iso)
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
}

export function AttendanceGrid() {
  const [month, setMonth] = useState(String(currentMonth))
  const [year, setYear] = useState(String(currentYear))
  const [editRecord, setEditRecord] = useState<AttendanceRecord | null>(null)
  const [editNote, setEditNote] = useState("")
  const [editCheckIn, setEditCheckIn] = useState("")
  const [editCheckOut, setEditCheckOut] = useState("")
  const [importOpen, setImportOpen] = useState(false)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data, isLoading } = useQuery({
    queryKey: ["attendance-grid", month, year],
    queryFn: async () => {
      const res = await fetch(`/api/attendance?month=${month}&year=${year}`)
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/attendance/sync-payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: Number(month), year: Number(year) }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error)
      }
      return res.json()
    },
    onSuccess: (result) => {
      toast({ title: "Sync thành công", description: result.message })
    },
    onError: (err) => toast({ title: "Lỗi", description: err.message, variant: "destructive" }),
  })

  const editMutation = useMutation({
    mutationFn: async () => {
      if (!editRecord) return
      const body: Record<string, string> = { editNote }
      if (editCheckIn) body.checkInAt = new Date(`${editRecord.date.split("T")[0]}T${editCheckIn}:00`).toISOString()
      if (editCheckOut) body.checkOutAt = new Date(`${editRecord.date.split("T")[0]}T${editCheckOut}:00`).toISOString()

      const res = await fetch(`/api/attendance/${editRecord.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-grid"] })
      setEditRecord(null)
      toast({ title: "Đã cập nhật chấm công" })
    },
    onError: (err) => toast({ title: "Lỗi", description: err.message, variant: "destructive" }),
  })

  const employees: Employee[] = data?.employees || []
  const recordMap: Record<string, Record<string, AttendanceRecord>> = data?.recordMap || {}
  const workingDays: string[] = data?.workingDays || []

  // Summary stats
  let totalPresent = 0, totalLate = 0, totalAbsent = 0
  for (const empId of Object.keys(recordMap)) {
    for (const rec of Object.values(recordMap[empId])) {
      if (rec.status === "PRESENT") totalPresent++
      else if (rec.status === "LATE") totalLate++
      else if (rec.status === "ABSENT") totalAbsent++
    }
  }

  function openEdit(record: AttendanceRecord) {
    setEditRecord(record)
    setEditNote(record.editNote || "")
    setEditCheckIn(record.checkInAt ? new Date(record.checkInAt).toTimeString().slice(0, 5) : "")
    setEditCheckOut(record.checkOutAt ? new Date(record.checkOutAt).toTimeString().slice(0, 5) : "")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold" style={{ color: "#1E3A5F" }}>Chấm Công</h1>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            style={{ backgroundColor: "#1E3A5F" }}
            onClick={() => setImportOpen(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Chấm Công
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncMutation.isPending ? "animate-spin" : ""}`} />
            {syncMutation.isPending ? "Đang sync..." : "Sync vào Bảng Lương"}
          </Button>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
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

      <div className="flex gap-4 text-sm flex-wrap">
        <span>{employees.length} NV</span>
        <span>✅ Đúng giờ: {totalPresent}</span>
        <span>🟡 Trễ: {totalLate}</span>
        <span>❌ Vắng: {totalAbsent}</span>
      </div>

      <div className="text-xs text-muted-foreground flex gap-3 flex-wrap">
        {Object.entries(ATTENDANCE_STATUS_ICONS).map(([k, icon]) => (
          <span key={k}>{icon} {ATTENDANCE_STATUS_LABELS[k]}</span>
        ))}
        <span>⬜ Chưa có</span>
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">
              Bảng Chấm Công — Tháng {month}/{year} ({workingDays.length} ngày làm)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[70vh] overflow-y-auto" style={{ contain: "layout" }}>
              <table className="text-xs w-full">
                <thead className="sticky top-0 z-20">
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-2 px-2 sticky left-0 bg-white z-30 min-w-[140px]">Nhân Viên</th>
                    {workingDays.map((d) => (
                      <th key={d} className="text-center py-2 px-1 min-w-[32px]">
                        {new Date(d + "T00:00:00").getDate()}
                      </th>
                    ))}
                    <th className="text-center py-2 px-2 min-w-[70px]">Tổng Công</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => {
                    const empRecords = recordMap[emp.id] || {}
                    let actualDays = 0
                    for (const rec of Object.values(empRecords)) {
                      const s = rec.status
                      if (s === "PRESENT" || s === "LATE" || s === "LEAVE" || s === "HOLIDAY") actualDays += 1
                      else if (s === "HALF_DAY") actualDays += 0.5
                    }

                    return (
                      <tr key={emp.id} className="border-b hover:bg-muted/30">
                        <td className="py-1.5 px-2 sticky left-0 bg-white z-10">
                          <div className="font-medium truncate">{emp.fullName}</div>
                          <div className="text-muted-foreground">{emp.employeeCode}</div>
                        </td>
                        {workingDays.map((d) => {
                          const rec = empRecords[d]
                          const icon = rec ? (ATTENDANCE_STATUS_ICONS[rec.status] || "⬜") : "⬜"
                          return (
                            <td
                              key={d}
                              className="text-center py-1.5 px-1 cursor-pointer hover:bg-blue-50"
                              title={rec ? `${ATTENDANCE_STATUS_LABELS[rec.status]} — ${fmtTime(rec.checkInAt)}→${fmtTime(rec.checkOutAt)}` : "Chưa có data"}
                              onClick={() => rec && openEdit(rec)}
                            >
                              {icon}
                            </td>
                          )
                        })}
                        <td className="text-center py-1.5 px-2 font-medium">
                          {actualDays}/{workingDays.length}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Intelligence Panel */}
      <AttendanceAIPanel month={Number(month)} year={Number(year)} />

      {/* Import Dialog */}
      <AttendanceImportDialog open={importOpen} onOpenChange={setImportOpen} />

      {/* Edit Dialog */}
      <Dialog open={!!editRecord} onOpenChange={(open) => !open && setEditRecord(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa Chấm Công</DialogTitle>
          </DialogHeader>
          {editRecord && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Ngày: {editRecord.date.split("T")[0]} — Trạng thái: {ATTENDANCE_STATUS_LABELS[editRecord.status] || editRecord.status}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Check-in</Label>
                  <Input type="time" value={editCheckIn} onChange={(e) => setEditCheckIn(e.target.value)} />
                </div>
                <div>
                  <Label>Check-out</Label>
                  <Input type="time" value={editCheckOut} onChange={(e) => setEditCheckOut(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Ghi chú sửa (bắt buộc)</Label>
                <Input value={editNote} onChange={(e) => setEditNote(e.target.value)} placeholder="VD: NV quên check-out" />
              </div>
              <Button
                className="w-full"
                style={{ backgroundColor: "#1E3A5F" }}
                disabled={!editNote || editMutation.isPending}
                onClick={() => editMutation.mutate()}
              >
                {editMutation.isPending ? "Đang lưu..." : "Lưu Thay Đổi"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
