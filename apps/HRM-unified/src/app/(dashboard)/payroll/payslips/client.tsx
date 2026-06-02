// src/app/(dashboard)/payroll/payslips/client.tsx
// Payslips Client Component

"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
// import { format } from "date-fns"
import { Loader2, Search, FileText } from "lucide-react"

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatVND } from "@/lib/payroll/constants"

interface Payroll {
  id: string
  employeeCode: string
  employeeName: string
  departmentName: string | null
  grossSalary: string
  totalDeductions: string
  netSalary: string
  status: string
  isPaid: boolean
  period: {
    id: string
    name: string
    year: number
    month: number
  }
}

async function fetchPayrolls(periodId?: string, search?: string) {
  const params = new URLSearchParams()
  if (periodId) params.set("periodId", periodId)
  if (search) params.set("search", search)
  params.set("pageSize", "100")

  const res = await fetch(`/api/payroll/payrolls?${params}`)
  if (!res.ok) throw new Error("Failed to fetch payrolls")
  return res.json()
}

async function fetchPeriods() {
  const res = await fetch("/api/payroll/periods?pageSize=24")
  if (!res.ok) throw new Error("Failed to fetch periods")
  return res.json()
}

export function PayslipsClient() {
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("")
  const [search, setSearch] = useState("")

  const { data: periodsData } = useQuery({
    queryKey: ["payroll-periods-select"],
    queryFn: fetchPeriods,
  })

  const { data, isLoading } = useQuery({
    queryKey: ["payslips", selectedPeriodId, search],
    queryFn: () => fetchPayrolls(selectedPeriodId || undefined, search || undefined),
    enabled: !!selectedPeriodId,
  })

  const periods = periodsData?.data || []
  const payrolls: Payroll[] = data?.data || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Phiếu lương</h1>
        <p className="text-muted-foreground">
          Xem và in phiếu lương nhân viên
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách phiếu lương</CardTitle>
          <CardDescription>
            Chọn kỳ lương để xem phiếu lương
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Select
              value={selectedPeriodId}
              onValueChange={setSelectedPeriodId}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Chọn kỳ lương..." />
              </SelectTrigger>
              <SelectContent>
                {periods.map((p: { id: string; name: string }) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo mã NV, tên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {!selectedPeriodId ? (
            <div className="text-center py-8 text-muted-foreground">
              Vui lòng chọn kỳ lương để xem phiếu lương
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : payrolls.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Không có phiếu lương nào trong kỳ này
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã NV</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Phòng ban</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Khấu trừ</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrolls.map((payroll) => (
                  <TableRow key={payroll.id}>
                    <TableCell className="font-medium">
                      {payroll.employeeCode}
                    </TableCell>
                    <TableCell>{payroll.employeeName}</TableCell>
                    <TableCell>{payroll.departmentName || "-"}</TableCell>
                    <TableCell className="text-right">
                      {formatVND(parseFloat(payroll.grossSalary))}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      -{formatVND(parseFloat(payroll.totalDeductions))}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      {formatVND(parseFloat(payroll.netSalary))}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={payroll.isPaid ? "default" : "secondary"}
                        style={
                          payroll.isPaid
                            ? { backgroundColor: "#10B981", color: "white" }
                            : undefined
                        }
                      >
                        {payroll.isPaid ? "Đã trả" : "Chưa trả"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost">
                        <FileText className="h-4 w-4" />
                      </Button>
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
