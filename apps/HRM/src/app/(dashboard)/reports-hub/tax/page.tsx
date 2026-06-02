"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Download } from "lucide-react"
import Link from "next/link"
import { TaxTable } from "@/components/reports-hub/tax-table"
import { TaxPITBarChart } from "@/components/reports-hub/payroll-chart"
import { formatNumber } from "@/lib/utils/format"

export default function TaxReportPage() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)

  const { data, isLoading } = useQuery({
    queryKey: ["reports-hub-tax", year],
    queryFn: async () => {
      const res = await fetch(`/api/reports-hub/tax?year=${year}`)
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  const employees = data?.employees || []
  const summary = data?.summary || { totalEmployees: 0, totalIncomePaid: 0, totalPITPaid: 0 }
  const byMonth = data?.byMonth || []

  const fmt = formatNumber

  const empWithTax = employees.filter((e: { pitPaid: number }) => e.pitPaid > 0).length

  async function handleExport() {
    const res = await fetch(`/api/reports-hub/export?type=tax&year=${year}`)
    if (!res.ok) return
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `05_QTT-TNCN_${year}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/reports-hub">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: "#1E3A5F" }}>Báo Cáo Thuế TNCN</h1>
        </div>
        <div className="flex items-center gap-2">
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-[90px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            Export 05/QTT
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground py-8 text-center">Đang tải...</p>
      ) : (
        <>
          {/* Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Tổng Hợp Năm {year}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Tổng TN chịu thuế:</span>
                  <div className="font-semibold text-lg">{fmt(summary.totalIncomePaid)}đ</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Tổng thuế đã khấu trừ:</span>
                  <div className="font-semibold text-lg text-red-600">{fmt(summary.totalPITPaid)}đ</div>
                </div>
                <div>
                  <span className="text-muted-foreground">NV có phát sinh thuế:</span>
                  <div className="font-semibold text-lg">{empWithTax}/{summary.totalEmployees}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PIT by month chart */}
          {byMonth.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Thuế TNCN Theo Tháng</CardTitle>
              </CardHeader>
              <CardContent>
                <TaxPITBarChart data={byMonth} />
              </CardContent>
            </Card>
          )}

          {/* Detailed table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Bảng Chi Tiết Nhân Viên</CardTitle>
            </CardHeader>
            <CardContent>
              <TaxTable rows={employees} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
