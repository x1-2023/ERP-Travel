"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Eye } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { CYCLE_LABELS } from "@/lib/config/competencies"

interface PeriodRow {
  id: string
  name: string
  cycle: string
  startDate: string
  endDate: string
  year: number
  totalReviews: number
  completedReviews: number
}

export default function ReviewsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [formName, setFormName] = useState("")
  const [formCycle, setFormCycle] = useState("MIDYEAR")
  const [formStart, setFormStart] = useState("")
  const [formEnd, setFormEnd] = useState("")
  const [formYear, setFormYear] = useState(String(new Date().getFullYear()))

  const { data, isLoading } = useQuery({
    queryKey: ["review-periods"],
    queryFn: async () => {
      const res = await fetch("/api/reviews")
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  const createMut = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          cycle: formCycle,
          startDate: formStart,
          endDate: formEnd,
          year: Number(formYear),
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review-periods"] })
      setShowCreate(false)
      setFormName("")
      setFormStart("")
      setFormEnd("")
      toast({ title: "Đợt đánh giá đã được tạo" })
    },
    onError: (err) => {
      toast({ title: "Lỗi", description: err.message, variant: "destructive" })
    },
  })

  const periods: PeriodRow[] = data?.data || []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#1E3A5F" }}>
          Đánh Giá Năng Lực
        </h1>
        <Button
          style={{ backgroundColor: "#1E3A5F" }}
          onClick={() => setShowCreate(!showCreate)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Tạo Đợt Đánh Giá
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tạo Đợt Đánh Giá Mới</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Tên đợt *</label>
                <Input
                  className="mt-1"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="VD: Đánh Giá Giữa Năm 2026"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Loại *</label>
                <Select value={formCycle} onValueChange={setFormCycle}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MIDYEAR">Giữa năm</SelectItem>
                    <SelectItem value="ANNUAL">Cuối năm</SelectItem>
                    <SelectItem value="PROBATION">Thử việc</SelectItem>
                    <SelectItem value="ADHOC">Đột xuất</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Ngày bắt đầu *</label>
                <Input
                  type="date"
                  className="mt-1"
                  value={formStart}
                  onChange={(e) => setFormStart(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Ngày kết thúc *</label>
                <Input
                  type="date"
                  className="mt-1"
                  value={formEnd}
                  onChange={(e) => setFormEnd(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Năm *</label>
                <Input
                  className="mt-1"
                  value={formYear}
                  onChange={(e) => setFormYear(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                style={{ backgroundColor: "#1E3A5F" }}
                disabled={createMut.isPending || !formName || !formStart || !formEnd}
                onClick={() => createMut.mutate()}
              >
                {createMut.isPending ? "Đang tạo..." : "Tạo"}
              </Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Hủy</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Periods list */}
      <Card>
        <CardContent className="pt-4">
          {isLoading ? (
            <p className="text-muted-foreground py-4 text-center">Đang tải...</p>
          ) : periods.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">Chưa có đợt đánh giá nào</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Đợt đánh giá</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Tiến độ</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periods.map((p) => {
                  const pct = p.totalReviews > 0 ? Math.round((p.completedReviews / p.totalReviews) * 100) : 0
                  const isOverdue = new Date(p.endDate) < new Date() && p.completedReviews < p.totalReviews
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">Năm {p.year}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{CYCLE_LABELS[p.cycle] || p.cycle}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className={isOverdue ? "text-red-500 font-medium" : ""}>
                          {new Date(p.endDate).toLocaleDateString("vi-VN")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${pct}%`, backgroundColor: pct === 100 ? "#10b981" : "#1E3A5F" }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {p.completedReviews}/{p.totalReviews}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link href={`/reviews/${p.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
