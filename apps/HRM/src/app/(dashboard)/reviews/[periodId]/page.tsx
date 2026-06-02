"use client"

import { useState, use } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, UserPlus } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { PeriodProgress } from "@/components/reviews/period-progress"
import { CYCLE_LABELS } from "@/lib/config/competencies"
import { Badge } from "@/components/ui/badge"

export default function ReviewPeriodPage({ params }: { params: Promise<{ periodId: string }> }) {
  const { periodId } = use(params)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [showAssign, setShowAssign] = useState(false)
  const [statusFilter, setStatusFilter] = useState("")

  const { data: periodData } = useQuery({
    queryKey: ["review-period", periodId],
    queryFn: async () => {
      const res = await fetch(`/api/reviews/${periodId}`)
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  const qs = new URLSearchParams()
  if (statusFilter) qs.set("status", statusFilter)

  const { data: empData, isLoading: empLoading } = useQuery({
    queryKey: ["review-employees", periodId, statusFilter],
    queryFn: async () => {
      const res = await fetch(`/api/reviews/${periodId}/employees?${qs.toString()}`)
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  // Fetch employee list for assignment
  const { data: allEmpData } = useQuery({
    queryKey: ["employees-for-assign"],
    queryFn: async () => {
      const res = await fetch("/api/employees?limit=200")
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
    enabled: showAssign,
  })

  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const assignMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/reviews/${periodId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeIds: selectedIds }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed")
      }
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["review-employees", periodId] })
      queryClient.invalidateQueries({ queryKey: ["review-period", periodId] })
      setShowAssign(false)
      setSelectedIds([])
      toast({ title: `Đã assign ${data.data.created} nhân viên` })
    },
    onError: (err) => {
      toast({ title: "Lỗi", description: err.message, variant: "destructive" })
    },
  })

  const period = periodData?.data
  const reviews = empData?.data || []
  const totalCount = empData?.totalCount || 0
  const completedCount = empData?.completedCount || 0
  const allEmployees = allEmpData?.data || []

  const STATUS_FILTERS = [
    { value: "", label: "Tất cả" },
    { value: "SELF_PENDING", label: "Chờ tự ĐG" },
    { value: "MANAGER_PENDING", label: "Chờ Manager" },
    { value: "HR_REVIEWING", label: "Chờ HR" },
    { value: "COMPLETED", label: "Hoàn tất" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/reviews">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1E3A5F" }}>
              {period?.name || "..."}
            </h1>
            {period && (
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Badge variant="outline">{CYCLE_LABELS[period.cycle] || period.cycle}</Badge>
                <span>Deadline: {new Date(period.endDate).toLocaleDateString("vi-VN")}</span>
              </div>
            )}
          </div>
        </div>
        <Button
          style={{ backgroundColor: "#1E3A5F" }}
          onClick={() => setShowAssign(!showAssign)}
        >
          <UserPlus className="h-4 w-4 mr-1" />
          Assign NV
        </Button>
      </div>

      {/* Assign panel */}
      {showAssign && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Assign Nhân Viên</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="max-h-60 overflow-y-auto border rounded-md p-2 space-y-1">
              {allEmployees.map((emp: { id: string; employeeCode: string; fullName: string; department?: { name: string } }) => {
                const checked = selectedIds.includes(emp.id)
                return (
                  <label key={emp.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 px-2 py-1 rounded">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setSelectedIds((prev) =>
                          checked ? prev.filter((id) => id !== emp.id) : [...prev, emp.id]
                        )
                      }}
                    />
                    <span className="font-medium">{emp.employeeCode}</span>
                    <span>{emp.fullName}</span>
                    {emp.department && <span className="text-muted-foreground">({emp.department.name})</span>}
                  </label>
                )
              })}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{selectedIds.length} đã chọn</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedIds(allEmployees.map((e: { id: string }) => e.id))
                  }}
                >
                  Chọn tất cả
                </Button>
                <Button
                  style={{ backgroundColor: "#1E3A5F" }}
                  size="sm"
                  disabled={selectedIds.length === 0 || assignMut.isPending}
                  onClick={() => assignMut.mutate()}
                >
                  {assignMut.isPending ? "Đang assign..." : `Assign ${selectedIds.length} NV`}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status filter tabs */}
      <div className="flex gap-1 flex-wrap">
        {STATUS_FILTERS.map((f) => {
          const count = f.value
            ? (period?.statusCounts?.find((s: { status: string }) => s.status === f.value)?.count || 0)
            : totalCount
          return (
            <Button
              key={f.value}
              variant={statusFilter === f.value ? "default" : "ghost"}
              size="sm"
              onClick={() => setStatusFilter(f.value)}
              style={statusFilter === f.value ? { backgroundColor: "#1E3A5F" } : undefined}
            >
              {f.label}
              {f.value && ` (${count})`}
            </Button>
          )
        })}
      </div>

      {/* Reviews table */}
      <Card>
        <CardContent className="pt-4">
          {empLoading ? (
            <p className="text-muted-foreground py-4 text-center">Đang tải...</p>
          ) : reviews.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              Chưa có nhân viên nào được assign. Bấm &ldquo;Assign NV&rdquo; để bắt đầu.
            </p>
          ) : (
            <PeriodProgress
              reviews={reviews}
              totalCount={totalCount}
              completedCount={completedCount}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
