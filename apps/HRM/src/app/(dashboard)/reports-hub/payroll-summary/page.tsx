"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Wallet, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"
import { PayrollBarChart } from "@/components/reports-hub/payroll-chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatNumber } from "@/lib/utils/format"

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Nháp", className: "bg-gray-100 text-gray-700" },
  SUBMITTED: { label: "Chờ duyệt", className: "bg-yellow-100 text-yellow-700" },
  APPROVED: { label: "Đã duyệt", className: "bg-blue-100 text-blue-700" },
  PAID: { label: "Đã trả", className: "bg-emerald-100 text-emerald-700" },
}

export default function PayrollSummaryPage() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)

  const { data, isLoading } = useQuery({
    queryKey: ["reports-hub-payroll-summary", year],
    queryFn: async () => {
      const res = await fetch(`/api/reports-hub/payroll-summary?year=${year}`)
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  const byMonth = data?.byMonth || []
  const byDepartment = data?.byDepartment || []
  const yearSummary = data?.yearSummary || { totalLaborCost: 0, avgMonthlyCost: 0, highestMonth: 0, lowestMonth: 0 }

  const fmt = formatNumber

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/reports-hub">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: "#1E3A5F" }}>Lương Tổng Hợp</h1>
        </div>
        <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
          <SelectTrigger className="w-[90px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground py-8 text-center">Đang tải...</p>
      ) : (
        <>
          {/* Year summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card>
              <CardContent className="pt-4 pb-3 text-center">
                <Wallet className="h-5 w-5 mx-auto text-blue-600 mb-1" />
                <div className="text-lg font-bold">{fmt(yearSummary.totalLaborCost)}đ</div>
                <div className="text-xs text-muted-foreground">Tổng Chi Phí NS</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 text-center">
                <div className="text-lg font-bold">{fmt(yearSummary.avgMonthlyCost)}đ</div>
                <div className="text-xs text-muted-foreground">TB/Tháng</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 text-center">
                <TrendingUp className="h-5 w-5 mx-auto text-red-500 mb-1" />
                <div className="text-lg font-bold">T{yearSummary.highestMonth || "-"}</div>
                <div className="text-xs text-muted-foreground">Tháng Cao Nhất</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 text-center">
                <TrendingDown className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
                <div className="text-lg font-bold">T{yearSummary.lowestMonth || "-"}</div>
                <div className="text-xs text-muted-foreground">Tháng Thấp Nhất</div>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          {byMonth.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Chi Phí Nhân Sự Theo Tháng</CardTitle>
              </CardHeader>
              <CardContent>
                <PayrollBarChart data={byMonth} />
              </CardContent>
            </Card>
          )}

          {/* Monthly detail table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Chi Tiết Theo Tháng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tháng</TableHead>
                      <TableHead>Trạng Thái</TableHead>
                      <TableHead className="text-right">Số NV</TableHead>
                      <TableHead className="text-right">Tổng TN</TableHead>
                      <TableHead className="text-right">Thực Lĩnh</TableHead>
                      <TableHead className="text-right">BH CTY</TableHead>
                      <TableHead className="text-right">Tổng Chi Phí</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {byMonth.map((m: { month: number; status: string; employeeCount: number; totalGross: number; totalNet: number; totalEmployerIns: number; totalCost: number }) => {
                      const st = STATUS_LABELS[m.status] || { label: m.status, className: "bg-gray-100 text-gray-700" }
                      return (
                        <TableRow key={m.month}>
                          <TableCell className="font-medium">Tháng {m.month}</TableCell>
                          <TableCell>
                            <Badge className={st.className}>{st.label}</Badge>
                          </TableCell>
                          <TableCell className="text-right">{m.employeeCount}</TableCell>
                          <TableCell className="text-right">{fmt(m.totalGross)}</TableCell>
                          <TableCell className="text-right">{fmt(m.totalNet)}</TableCell>
                          <TableCell className="text-right">{fmt(m.totalEmployerIns)}</TableCell>
                          <TableCell className="text-right font-bold">{fmt(m.totalCost)}</TableCell>
                        </TableRow>
                      )
                    })}
                    {byMonth.length > 0 && (
                      <TableRow className="font-bold bg-muted/50">
                        <TableCell colSpan={3}>TỔNG NĂM {year}</TableCell>
                        <TableCell className="text-right">{fmt(byMonth.reduce((s: number, m: { totalGross: number }) => s + m.totalGross, 0))}</TableCell>
                        <TableCell className="text-right">{fmt(byMonth.reduce((s: number, m: { totalNet: number }) => s + m.totalNet, 0))}</TableCell>
                        <TableCell className="text-right">{fmt(byMonth.reduce((s: number, m: { totalEmployerIns: number }) => s + m.totalEmployerIns, 0))}</TableCell>
                        <TableCell className="text-right">{fmt(yearSummary.totalLaborCost)}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* By department */}
          {byDepartment.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Chi Phí Theo Phòng Ban</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phòng Ban</TableHead>
                      <TableHead className="text-right">Số NV</TableHead>
                      <TableHead className="text-right">Lương TB</TableHead>
                      <TableHead className="text-right">Tổng Chi Phí</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {byDepartment.map((d: { department: string; headcount: number; avgSalary: number; totalCost: number }) => (
                      <TableRow key={d.department}>
                        <TableCell className="font-medium">{d.department}</TableCell>
                        <TableCell className="text-right">{d.headcount}</TableCell>
                        <TableCell className="text-right">{fmt(d.avgSalary)}</TableCell>
                        <TableCell className="text-right font-bold">{fmt(d.totalCost)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
