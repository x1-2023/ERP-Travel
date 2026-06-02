"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, Lock } from "lucide-react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { toast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils/format"

interface Employee {
  id: string
  fullName: string
  employeeCode: string
  department: { name: string } | null
}

interface KPIScore {
  id: string
  employeeId: string
  score: number
  kpiAmount: number
  notes: string | null
  employee: Employee
}

interface KPIPeriodDetail {
  id: string
  month: number
  year: number
  status: string
  scores: KPIScore[]
}

interface ScoreInput {
  employeeId: string
  score: number
  kpiAmount: number
  notes: string
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Nháp", className: "bg-gray-100 text-gray-700" },
  PUBLISHED: { label: "Đã công bố", className: "bg-emerald-100 text-emerald-700" },
  LOCKED: { label: "Đã khóa", className: "bg-blue-100 text-blue-700" },
}

const DEFAULT_KPI_RATE = 50_000

export default function KPIDetailPage() {
  const { periodId } = useParams<{ periodId: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const isHR = ["SUPER_ADMIN", "HR_MANAGER"].includes(session?.user?.role || "")

  const [scoreMap, setScoreMap] = useState<Record<string, ScoreInput>>({})
  const [isDirty, setIsDirty] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["kpi-detail", periodId],
    queryFn: async () => {
      const res = await fetch(`/api/kpi/${periodId}`)
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  const period: KPIPeriodDetail | null = data?.data || null
  const allEmployees: Employee[] = useMemo(() => data?.employees || [], [data?.employees])

  // Initialize scoreMap from existing scores
  useEffect(() => {
    if (!period) return
    const map: Record<string, ScoreInput> = {}
    for (const s of period.scores) {
      map[s.employeeId] = {
        employeeId: s.employeeId,
        score: Number(s.score),
        kpiAmount: Number(s.kpiAmount),
        notes: s.notes || "",
      }
    }
    // For HR, fill in employees without scores
    if (isHR) {
      for (const emp of allEmployees) {
        if (!map[emp.id]) {
          map[emp.id] = {
            employeeId: emp.id,
            score: 0,
            kpiAmount: 0,
            notes: "",
          }
        }
      }
    }
    setScoreMap(map)
  }, [period, allEmployees, isHR])

  const updateScore = useCallback((empId: string, field: keyof ScoreInput, value: string | number) => {
    setScoreMap((prev) => {
      const current = prev[empId] || { employeeId: empId, score: 0, kpiAmount: 0, notes: "" }
      const updated = { ...current, [field]: value }
      // Auto-calc kpiAmount if score changes
      if (field === "score") {
        updated.kpiAmount = Math.round(Number(value) * DEFAULT_KPI_RATE)
      }
      return { ...prev, [empId]: updated }
    })
    setIsDirty(true)
  }, [])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const scores = Object.values(scoreMap).filter((s) => s.score > 0)
      const res = await fetch(`/api/kpi/${periodId}/scores`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scores }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Lỗi")
      }
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["kpi-detail", periodId] })
      setIsDirty(false)
      toast({ title: `Đã lưu ${data.updated} điểm KPI` })
    },
    onError: (err: Error) => {
      toast({ title: "Lỗi", description: err.message, variant: "destructive" })
    },
  })

  const publishMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/kpi/${periodId}/publish`, { method: "POST" })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Lỗi")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kpi-detail", periodId] })
      queryClient.invalidateQueries({ queryKey: ["kpi-periods"] })
      toast({ title: "Đã công bố KPI" })
    },
    onError: (err: Error) => {
      toast({ title: "Lỗi", description: err.message, variant: "destructive" })
    },
  })

  const feedMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/kpi/${periodId}/feed-payroll`, { method: "POST" })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Lỗi")
      }
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["kpi-detail", periodId] })
      queryClient.invalidateQueries({ queryKey: ["kpi-periods"] })
      toast({ title: data.message })
    },
    onError: (err: Error) => {
      toast({ title: "Lỗi", description: err.message, variant: "destructive" })
    },
  })

  if (isLoading) return <p className="text-muted-foreground">Đang tải...</p>
  if (!period) return <p className="text-muted-foreground">Không tìm thấy kỳ KPI</p>

  const sc = STATUS_CONFIG[period.status] || STATUS_CONFIG.DRAFT
  const isDraft = period.status === "DRAFT"
  const isPublished = period.status === "PUBLISHED"

  // Build display list: for HR use allEmployees, for non-HR use scores only
  const displayList = isHR
    ? allEmployees.map((emp) => ({
        employee: emp,
        score: scoreMap[emp.id] || { employeeId: emp.id, score: 0, kpiAmount: 0, notes: "" },
      }))
    : period.scores.map((s) => ({
        employee: s.employee,
        score: { employeeId: s.employeeId, score: Number(s.score), kpiAmount: Number(s.kpiAmount), notes: s.notes || "" },
      }))

  const totalKpi = Object.values(scoreMap).reduce((s, v) => s + Number(v.kpiAmount), 0)
  const scoredCount = Object.values(scoreMap).filter((v) => v.score > 0).length

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/kpi")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold" style={{ color: "#1E3A5F" }}>
          KPI Tháng {period.month}/{period.year}
        </h1>
        <Badge className={sc.className}>{sc.label}</Badge>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-sm text-muted-foreground">Đã chấm</div>
            <div className="text-xl font-bold">{scoredCount} / {displayList.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-sm text-muted-foreground">Điểm TB</div>
            <div className="text-xl font-bold">
              {scoredCount > 0
                ? (Object.values(scoreMap).filter((v) => v.score > 0).reduce((s, v) => s + v.score, 0) / scoredCount).toFixed(1)
                : "—"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-sm text-muted-foreground">Tổng KPI</div>
            <div className="text-xl font-bold">{formatCurrency(totalKpi)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Action buttons */}
      {isHR && (
        <div className="flex gap-3 mb-4">
          {isDraft && (
            <>
              <Button
                style={{ backgroundColor: "#1E3A5F" }}
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending || !isDirty}
              >
                {saveMutation.isPending ? "Đang lưu..." : "Lưu Điểm"}
              </Button>
              <Button
                variant="outline"
                onClick={() => publishMutation.mutate()}
                disabled={publishMutation.isPending || scoredCount === 0}
              >
                <Send className="h-4 w-4 mr-2" />
                {publishMutation.isPending ? "Đang công bố..." : "Công Bố"}
              </Button>
            </>
          )}
          {isPublished && (
            <Button
              style={{ backgroundColor: "#1E3A5F" }}
              onClick={() => {
                if (confirm("Feed KPI vào bảng lương? Kỳ KPI sẽ bị khóa.")) {
                  feedMutation.mutate()
                }
              }}
              disabled={feedMutation.isPending}
            >
              <Lock className="h-4 w-4 mr-2" />
              {feedMutation.isPending ? "Đang feed..." : "Feed vào Bảng Lương"}
            </Button>
          )}
        </div>
      )}

      {/* Score table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bảng Điểm KPI</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-background">
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Mã NV</th>
                  <th className="text-left py-2 px-3">Họ tên</th>
                  <th className="text-left py-2 px-3">Phòng ban</th>
                  <th className="text-center py-2 px-3 w-24">Điểm</th>
                  <th className="text-right py-2 px-3 w-36">Số tiền KPI</th>
                  <th className="text-left py-2 px-3">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {displayList.map(({ employee, score }) => (
                  <tr key={employee.id} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-3 font-mono text-xs">{employee.employeeCode}</td>
                    <td className="py-2 px-3">{employee.fullName}</td>
                    <td className="py-2 px-3 text-muted-foreground">
                      {employee.department?.name || "—"}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {isHR && isDraft ? (
                        <input
                          type="number"
                          min={0}
                          max={100}
                          className="w-20 border rounded px-2 py-1 text-center text-sm"
                          value={score.score || ""}
                          onChange={(e) => updateScore(employee.id, "score", Number(e.target.value))}
                        />
                      ) : (
                        <span className={score.score >= 80 ? "text-emerald-600 font-medium" : score.score >= 50 ? "text-amber-600" : "text-red-600"}>
                          {score.score}
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right">
                      {isHR && isDraft ? (
                        <input
                          type="number"
                          className="w-32 border rounded px-2 py-1 text-right text-sm"
                          value={score.kpiAmount || ""}
                          onChange={(e) => updateScore(employee.id, "kpiAmount", Number(e.target.value))}
                        />
                      ) : (
                        formatCurrency(score.kpiAmount)
                      )}
                    </td>
                    <td className="py-2 px-3">
                      {isHR && isDraft ? (
                        <input
                          type="text"
                          className="w-full border rounded px-2 py-1 text-sm"
                          placeholder="Ghi chú..."
                          value={score.notes || ""}
                          onChange={(e) => updateScore(employee.id, "notes", e.target.value)}
                        />
                      ) : (
                        <span className="text-muted-foreground">{score.notes || "—"}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
