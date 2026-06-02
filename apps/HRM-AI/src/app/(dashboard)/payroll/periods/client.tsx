// src/app/(dashboard)/payroll/periods/client.tsx
// Payroll Periods Client Component

"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Plus, Calculator, CheckCircle, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { formatVND, PAYROLL_STATUS_LABELS, PAYROLL_STATUS_COLORS } from "@/lib/payroll/constants"

interface PayrollPeriod {
  id: string
  name: string
  year: number
  month: number
  status: string
  totalEmployees: number
  totalGross: string
  totalNet: string
  totalDeductions: string
  calculatedAt: string | null
  approvedAt: string | null
  _count: {
    payrolls: number
    bankPayments: number
  }
}

async function fetchPeriods(year?: number) {
  const params = new URLSearchParams()
  if (year) params.set("year", year.toString())
  params.set("pageSize", "24")

  const res = await fetch(`/api/payroll/periods?${params}`)
  if (!res.ok) throw new Error("Failed to fetch periods")
  return res.json()
}

async function createPeriod(data: { year: number; month: number }) {
  const res = await fetch("/api/payroll/periods", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Failed to create period")
  }
  return res.json()
}

async function calculatePeriod(periodId: string, recalculate: boolean = false) {
  const res = await fetch(`/api/payroll/periods/${periodId}/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recalculate }),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Failed to calculate")
  }
  return res.json()
}

async function updatePeriodStatus(periodId: string, status: string) {
  const res = await fetch(`/api/payroll/periods/${periodId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Failed to update status")
  }
  return res.json()
}

export function PayrollPeriodsClient() {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const [selectedYear, setSelectedYear] = useState<number>(currentYear)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newPeriodMonth, setNewPeriodMonth] = useState<number>(currentMonth)
  const [newPeriodYear, setNewPeriodYear] = useState<number>(currentYear)
  const [calculatingId, setCalculatingId] = useState<string | null>(null)

  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data, isLoading } = useQuery({
    queryKey: ["payroll-periods", selectedYear],
    queryFn: () => fetchPeriods(selectedYear),
  })

  const createMutation = useMutation({
    mutationFn: createPeriod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-periods"] })
      setIsCreateOpen(false)
      toast({
        title: "Tạo kỳ lương thành công",
        description: `Kỳ lương tháng ${newPeriodMonth}/${newPeriodYear} đã được tạo`,
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const calculateMutation = useMutation({
    mutationFn: ({ periodId, recalculate }: { periodId: string; recalculate: boolean }) =>
      calculatePeriod(periodId, recalculate),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["payroll-periods"] })
      setCalculatingId(null)
      toast({
        title: "Tính lương thành công",
        description: `Đã tính lương cho ${result.calculated} nhân viên`,
      })
    },
    onError: (error: Error) => {
      setCalculatingId(null)
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ periodId, status }: { periodId: string; status: string }) =>
      updatePeriodStatus(periodId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-periods"] })
      toast({
        title: "Cập nhật thành công",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const handleCreate = () => {
    createMutation.mutate({ year: newPeriodYear, month: newPeriodMonth })
  }

  const handleCalculate = (periodId: string, recalculate: boolean = false) => {
    setCalculatingId(periodId)
    calculateMutation.mutate({ periodId, recalculate })
  }

  const handleApprove = (periodId: string) => {
    statusMutation.mutate({ periodId, status: "APPROVED" })
  }

  const periods: PayrollPeriod[] = data?.data || []

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kỳ lương</h1>
          <p className="text-muted-foreground">
            Quản lý các kỳ tính lương hàng tháng
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={selectedYear.toString()}
            onValueChange={(v) => setSelectedYear(parseInt(v))}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  Năm {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tạo kỳ lương
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tạo kỳ lương mới</DialogTitle>
                <DialogDescription>
                  Chọn tháng và năm để tạo kỳ lương mới
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Tháng</label>
                    <Select
                      value={newPeriodMonth.toString()}
                      onValueChange={(v) => setNewPeriodMonth(parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((m) => (
                          <SelectItem key={m} value={m.toString()}>
                            Tháng {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Năm</label>
                    <Select
                      value={newPeriodYear.toString()}
                      onValueChange={(v) => setNewPeriodYear(parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((y) => (
                          <SelectItem key={y} value={y.toString()}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Tạo
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách kỳ lương năm {selectedYear}</CardTitle>
          <CardDescription>
            Tổng cộng {periods.length} kỳ lương
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : periods.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có kỳ lương nào trong năm {selectedYear}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kỳ lương</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Số NV</TableHead>
                  <TableHead className="text-right">Tổng Gross</TableHead>
                  <TableHead className="text-right">Tổng Net</TableHead>
                  <TableHead className="text-right">Ngày tính</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periods.map((period) => (
                  <TableRow key={period.id}>
                    <TableCell className="font-medium">
                      {period.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        style={{
                          backgroundColor: PAYROLL_STATUS_COLORS[period.status] || "#6B7280",
                          color: "white",
                        }}
                      >
                        {PAYROLL_STATUS_LABELS[period.status] || period.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {period.totalEmployees || period._count?.payrolls || 0}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatVND(parseFloat(period.totalGross) || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatVND(parseFloat(period.totalNet) || 0)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {period.calculatedAt
                        ? format(new Date(period.calculatedAt), "dd/MM HH:mm", { locale: vi })
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        {["DRAFT", "SIMULATED"].includes(period.status) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCalculate(period.id, period.status === "SIMULATED")}
                            disabled={calculatingId === period.id}
                          >
                            {calculatingId === period.id ? (
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            ) : (
                              <Calculator className="mr-1 h-3 w-3" />
                            )}
                            {period.status === "DRAFT" ? "Tính lương" : "Tính lại"}
                          </Button>
                        )}
                        {period.status === "SIMULATED" && (
                          <Button
                            size="sm"
                            onClick={() => handleApprove(period.id)}
                            disabled={statusMutation.isPending}
                          >
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Duyệt
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
