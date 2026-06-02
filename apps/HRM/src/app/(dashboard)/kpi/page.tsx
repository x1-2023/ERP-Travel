"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Target } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmptyState } from "@/components/ui/empty-state"
import { useState } from "react"
import { toast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils/format"

interface KPIPeriodItem {
  id: string
  month: number
  year: number
  status: string
  scoreCount: number
  avgScore: number
  totalKpi: number
  createdAt: string
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Nháp", className: "bg-gray-100 text-gray-700" },
  PUBLISHED: { label: "Đã công bố", className: "bg-emerald-100 text-emerald-700" },
  LOCKED: { label: "Đã khóa", className: "bg-blue-100 text-blue-700" },
}

export default function KPIPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const isHR = ["SUPER_ADMIN", "HR_MANAGER"].includes(session?.user?.role || "")

  const [showCreate, setShowCreate] = useState(false)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())

  const { data, isLoading } = useQuery({
    queryKey: ["kpi-periods"],
    queryFn: async () => {
      const res = await fetch("/api/kpi")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/kpi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, year }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Lỗi")
      }
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["kpi-periods"] })
      setShowCreate(false)
      toast({ title: "Đã tạo kỳ KPI" })
      router.push(`/kpi/${data.data.id}`)
    },
    onError: (err: Error) => {
      toast({ title: "Lỗi", description: err.message, variant: "destructive" })
    },
  })

  const periods: KPIPeriodItem[] = data?.data || []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#1E3A5F" }}>
          Quản Lý KPI
        </h1>
        {isHR && (
          <Button
            style={{ backgroundColor: "#1E3A5F" }}
            onClick={() => setShowCreate(!showCreate)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Tạo Kỳ KPI
          </Button>
        )}
      </div>

      {showCreate && (
        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="flex items-end gap-4">
              <div>
                <label className="text-sm font-medium">Tháng</label>
                <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                  <SelectTrigger className="mt-1 w-[130px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>
                        Tháng {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Năm</label>
                <input
                  type="number"
                  className="block mt-1 border rounded px-3 py-2 text-sm w-24"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                />
              </div>
              <Button
                style={{ backgroundColor: "#1E3A5F" }}
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Đang tạo..." : "Tạo"}
              </Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Hủy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <p className="text-muted-foreground">Đang tải...</p>
      ) : periods.length === 0 ? (
        <EmptyState
          icon={<Target className="h-10 w-10" />}
          title="Chưa có kỳ KPI nào"
          description={isHR ? "Tạo kỳ KPI đầu tiên để bắt đầu đánh giá hiệu suất." : "Chưa có kỳ KPI nào được tạo."}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Danh sách kỳ KPI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-background">
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Tháng/Năm</th>
                    <th className="text-center py-2 px-3">Trạng thái</th>
                    <th className="text-center py-2 px-3">Số NV</th>
                    <th className="text-center py-2 px-3">Điểm TB</th>
                    <th className="text-right py-2 px-3">Tổng KPI</th>
                    <th className="text-right py-2 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {periods.map((p) => {
                    const sc = STATUS_CONFIG[p.status] || STATUS_CONFIG.DRAFT
                    return (
                      <tr key={p.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-3 font-medium">
                          {String(p.month).padStart(2, "0")}/{p.year}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Badge className={sc.className}>{sc.label}</Badge>
                        </td>
                        <td className="py-3 px-3 text-center">{p.scoreCount}</td>
                        <td className="py-3 px-3 text-center">
                          {p.avgScore > 0 ? p.avgScore : "—"}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {p.totalKpi > 0 ? formatCurrency(p.totalKpi) : "—"}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/kpi/${p.id}`)}
                          >
                            {isHR && p.status === "DRAFT" ? "Nhập điểm" : "Xem"}
                          </Button>
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
    </div>
  )
}
