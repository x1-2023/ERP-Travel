"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSession } from "next-auth/react"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Check, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface HREventItem {
  id: string
  type: string
  status: string
  effectiveDate: string
  payload: Record<string, unknown>
  note: string | null
  rejectionReason: string | null
  employee: { id: string; fullName: string; employeeCode: string }
  requester: { id: string; name: string }
  createdAt: string
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

export default function HREventsPage() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter] = useState<string>("")
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  const { toast } = useToast()
  const canApprove = session?.user?.role === "HR_MANAGER" || session?.user?.role === "SUPER_ADMIN"

  const { data, isLoading } = useQuery<{ data: HREventItem[] }>({
    queryKey: ["hr-events-list", filter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filter) params.set("status", filter)
      const res = await fetch(`/api/hr-events?${params}`)
      return res.json()
    },
  })

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/hr-events/${id}/approve`, { method: "POST" })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr-events-list"] })
      toast({ title: "Đã duyệt sự kiện nhân sự" })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await fetch(`/api/hr-events/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectionReason: reason }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }
      return res.json()
    },
    onSuccess: () => {
      setRejectId(null)
      setRejectReason("")
      queryClient.invalidateQueries({ queryKey: ["hr-events-list"] })
      toast({ title: "Đã từ chối sự kiện" })
    },
  })

  const events = data?.data || []
  const PAGE_SIZE = 20
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const visibleEvents = useMemo(() => events.slice(0, visibleCount), [events, visibleCount])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: "#1E3A5F" }}>Biến Động Nhân Sự</h1>
        <Button style={{ backgroundColor: "#1E3A5F" }} onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-4 w-4 mr-1" />
          Tạo sự kiện
        </Button>
      </div>

      {/* Create Form */}
      {showCreate && <CreateEventForm onClose={() => setShowCreate(false)} />}

      {/* Filter */}
      <div className="flex gap-2">
        {[{ value: "", label: "Tất cả" }, { value: "PENDING", label: "Chờ duyệt" }, { value: "APPROVED", label: "Đã duyệt" }, { value: "REJECTED", label: "Từ chối" }].map((s) => (
          <Button
            key={s.value}
            variant={filter === s.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(s.value)}
            style={filter === s.value ? { backgroundColor: "#1E3A5F" } : {}}
          >
            {s.label}
          </Button>
        ))}
      </div>

      {/* Events List */}
      {isLoading ? (
        <div className="text-center py-8 text-slate-400">Đang tải...</div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-slate-500">
            Chưa có biến động nào
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {visibleEvents.map((ev) => (
            <Card key={ev.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{ev.employee.fullName}</span>
                      <span className="text-xs text-slate-400">({ev.employee.employeeCode})</span>
                      <Badge className={STATUS_CONFIG[ev.status]?.className}>{STATUS_CONFIG[ev.status]?.label || ev.status}</Badge>
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">{EVENT_TYPE_LABELS[ev.type] || ev.type}</span>
                      {" · "}Hiệu lực: {format(new Date(ev.effectiveDate), "dd/MM/yyyy")}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Yêu cầu bởi {ev.requester.name} · {format(new Date(ev.createdAt), "dd/MM/yyyy HH:mm")}
                    </p>
                    {ev.note && <p className="text-xs text-slate-500 mt-1">Ghi chú: {ev.note}</p>}
                    {ev.rejectionReason && (
                      <p className="text-xs text-red-500 mt-1">Lý do từ chối: {ev.rejectionReason}</p>
                    )}
                  </div>

                  {/* Approve/Reject buttons */}
                  {canApprove && ev.status === "PENDING" && (
                    <div className="flex items-center gap-2 shrink-0">
                      {rejectId === ev.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Lý do từ chối..."
                            className="h-8 text-xs w-44"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={!rejectReason || rejectMutation.isPending}
                            onClick={() => rejectMutation.mutate({ id: ev.id, reason: rejectReason })}
                          >
                            Xác nhận
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setRejectId(null); setRejectReason("") }}>
                            Hủy
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            style={{ backgroundColor: "#1E3A5F" }}
                            disabled={approveMutation.isPending}
                            onClick={() => approveMutation.mutate(ev.id)}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Duyệt
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRejectId(ev.id)}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Từ chối
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {visibleCount < events.length && (
            <div className="text-center pt-2">
              <Button variant="outline" size="sm" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
                Xem thêm ({events.length - visibleCount} còn lại)
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CreateEventForm({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [employeeId, setEmployeeId] = useState("")
  const [type, setType] = useState("DEPARTMENT_TRANSFER")
  const [effectiveDate, setEffectiveDate] = useState("")
  const [note, setNote] = useState("")
  const [error, setError] = useState("")

  // Extra fields based on type
  const [toDepartmentId, setToDepartmentId] = useState("")
  const [toPositionId, setToPositionId] = useState("")
  const [toSalary, setToSalary] = useState("")
  const [level, setLevel] = useState("WARNING")
  const [reason, setReason] = useState("")

  // Load employees for selection
  const { data: employeesData } = useQuery({
    queryKey: ["employees-select"],
    queryFn: async () => {
      const res = await fetch("/api/employees?limit=100")
      return res.json()
    },
  })

  // Load departments
  const { data: deptsData } = useQuery({
    queryKey: ["departments-select"],
    queryFn: async () => {
      const res = await fetch("/api/departments")
      return res.json()
    },
  })

  // Load positions
  const { data: positionsData } = useQuery({
    queryKey: ["positions-select"],
    queryFn: async () => {
      const res = await fetch("/api/positions")
      return res.json()
    },
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: Record<string, any> = {}
      if (type === "DEPARTMENT_TRANSFER") {
        if (toDepartmentId) payload.toDepartmentId = toDepartmentId
        if (toPositionId) payload.toPositionId = toPositionId
      } else if (type === "PROMOTION") {
        if (toPositionId) payload.toPositionId = toPositionId
      } else if (type === "SALARY_ADJUSTMENT") {
        if (toSalary) payload.toSalary = parseFloat(toSalary)
      } else if (type === "DISCIPLINARY") {
        payload.level = level
        payload.reason = reason
      }

      const res = await fetch("/api/hr-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, type, effectiveDate, payload, note: note || null }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr-events-list"] })
      onClose()
    },
    onError: (err) => setError(err.message),
  })

  const employees = employeesData?.data || []
  const depts = deptsData?.data || deptsData || []
  const positions = positionsData?.data || positionsData || []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tạo sự kiện nhân sự mới</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nhân viên *</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger><SelectValue placeholder="Chọn nhân viên" /></SelectTrigger>
              <SelectContent>
                {employees.map((emp: { id: string; fullName: string; employeeCode: string }) => (
                  <SelectItem key={emp.id} value={emp.id}>{emp.fullName} ({emp.employeeCode})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Loại sự kiện *</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Ngày hiệu lực *</Label>
            <Input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
          </div>

          {/* Type-specific fields */}
          {(type === "DEPARTMENT_TRANSFER") && (
            <>
              <div className="space-y-2">
                <Label>Phòng ban mới</Label>
                <Select value={toDepartmentId} onValueChange={setToDepartmentId}>
                  <SelectTrigger><SelectValue placeholder="Chọn phòng ban" /></SelectTrigger>
                  <SelectContent>
                    {depts.map((d: { id: string; name: string }) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Chức vụ mới</Label>
                <Select value={toPositionId} onValueChange={setToPositionId}>
                  <SelectTrigger><SelectValue placeholder="Chọn chức vụ" /></SelectTrigger>
                  <SelectContent>
                    {positions.map((p: { id: string; name: string }) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {type === "PROMOTION" && (
            <div className="space-y-2">
              <Label>Chức vụ mới</Label>
              <Select value={toPositionId} onValueChange={setToPositionId}>
                <SelectTrigger><SelectValue placeholder="Chọn chức vụ" /></SelectTrigger>
                <SelectContent>
                  {positions.map((p: { id: string; name: string }) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {type === "SALARY_ADJUSTMENT" && (
            <div className="space-y-2">
              <Label>Lương mới (VNĐ)</Label>
              <Input type="number" value={toSalary} onChange={(e) => setToSalary(e.target.value)} placeholder="15000000" />
            </div>
          )}

          {type === "DISCIPLINARY" && (
            <>
              <div className="space-y-2">
                <Label>Mức kỷ luật</Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WARNING">Cảnh cáo</SelectItem>
                    <SelectItem value="SUSPENSION">Đình chỉ</SelectItem>
                    <SelectItem value="TERMINATION">Sa thải</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Lý do kỷ luật</Label>
                <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Mô tả lý do..." />
              </div>
            </>
          )}

          <div className="space-y-2 md:col-span-2">
            <Label>Ghi chú</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú thêm..." />
          </div>
        </div>

        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button
            style={{ backgroundColor: "#1E3A5F" }}
            disabled={!employeeId || !effectiveDate || createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            {createMutation.isPending ? "Đang tạo..." : "Tạo sự kiện"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
