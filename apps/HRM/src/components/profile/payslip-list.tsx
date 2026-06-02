"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"
import { PayslipDetail } from "./payslip-detail"
interface PayslipSummary {
  id: string
  periodId: string
  actualDays: number | string
  standardDays: number | string
  totalIncome: number | string
  netSalary: number | string
  period: { month: number; year: number; status: string }
}

function formatCurrency(n: number | string): string {
  return new Intl.NumberFormat("vi-VN").format(Number(n))
}

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 3 }, (_, i) => currentYear - i)

export function PayslipList() {
  const [year, setYear] = useState(String(currentYear))
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["payslips", year],
    queryFn: async () => {
      const res = await fetch(`/api/profile/payslips?year=${year}`)
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  const payslips: PayslipSummary[] = data?.data || []

  if (selectedPeriodId) {
    return <PayslipDetail periodId={selectedPeriodId} onBack={() => setSelectedPeriodId(null)} />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Lịch Sử Phiếu Lương</CardTitle>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {yearOptions.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Đang tải...</div>
        ) : payslips.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">Chưa có phiếu lương năm {year}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tháng</TableHead>
                <TableHead className="text-center">Ngày công</TableHead>
                <TableHead className="text-right">Tổng TN</TableHead>
                <TableHead className="text-right">Thực Lĩnh</TableHead>
                <TableHead className="hidden sm:table-cell">TT</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payslips.map((ps) => (
                <TableRow key={ps.id}>
                  <TableCell className="font-medium">
                    {String(ps.period.month).padStart(2, "0")}/{ps.period.year}
                  </TableCell>
                  <TableCell className="text-center">
                    {Number(ps.actualDays)}/{Number(ps.standardDays)}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(ps.totalIncome)}</TableCell>
                  <TableCell className="text-right font-semibold" style={{ color: "#1E3A5F" }}>
                    {formatCurrency(ps.netSalary)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant={ps.period.status === "PAID" ? "default" : "secondary"} className="text-xs">
                      {ps.period.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setSelectedPeriodId(ps.periodId)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
