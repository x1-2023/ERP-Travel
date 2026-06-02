"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Download, Users, UserPlus, UserMinus } from "lucide-react"
import Link from "next/link"
import { InsuranceTable } from "@/components/reports-hub/insurance-table"
import { formatNumber } from "@/lib/utils/format"

type TabKey = "all" | "new" | "term" | "adjust"

export default function InsuranceReportPage() {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const [year, setYear] = useState(currentYear)
  const [month, setMonth] = useState(currentMonth)
  const [activeTab, setActiveTab] = useState<TabKey>("all")

  const { data, isLoading } = useQuery({
    queryKey: ["reports-hub-insurance", month, year],
    queryFn: async () => {
      const res = await fetch(`/api/reports-hub/insurance?month=${month}&year=${year}`)
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  const d02 = data?.d02 || { newRegistrations: [], terminations: [], salaryAdjustments: [] }
  const summary = data?.summary || { totalEmployees: 0, totalSalaryFund: 0, employeeContrib: 0, employerContrib: 0, totalContrib: 0 }

  const fmt = formatNumber

  async function handleExport() {
    const res = await fetch(`/api/reports-hub/export?type=insurance&month=${month}&year=${year}`)
    if (!res.ok) return
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `D02-TS_${String(month).padStart(2, "0")}_${year}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  }

  const TABS: { key: TabKey; label: string; count: number }[] = [
    { key: "all", label: "Tất cả", count: summary.totalEmployees },
    { key: "new", label: "Đăng ký mới", count: d02.newRegistrations.length },
    { key: "term", label: "Thôi TG", count: d02.terminations.length },
    { key: "adjust", label: "Điều chỉnh", count: d02.salaryAdjustments.length },
  ]

  const tableRows = activeTab === "all" ? [] :
    activeTab === "new" ? d02.newRegistrations :
    activeTab === "term" ? d02.terminations :
    d02.salaryAdjustments

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/reports-hub">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: "#1E3A5F" }}>Báo Cáo BHXH</h1>
        </div>
        <div className="flex items-center gap-2">
          <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
            <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <SelectItem key={m} value={String(m)}>Tháng {m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-[90px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-1" />
            Export D02
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground py-8 text-center">Đang tải...</p>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card>
              <CardContent className="pt-4 pb-3 text-center">
                <Users className="h-5 w-5 mx-auto text-blue-600 mb-1" />
                <div className="text-2xl font-bold">{summary.totalEmployees}</div>
                <div className="text-xs text-muted-foreground">NV tham gia BH</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 text-center">
                <UserPlus className="h-5 w-5 mx-auto text-emerald-600 mb-1" />
                <div className="text-2xl font-bold text-emerald-600">{d02.newRegistrations.length}</div>
                <div className="text-xs text-muted-foreground">Đăng ký mới</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 text-center">
                <UserMinus className="h-5 w-5 mx-auto text-red-500 mb-1" />
                <div className="text-2xl font-bold text-red-500">{d02.terminations.length}</div>
                <div className="text-xs text-muted-foreground">Thôi tham gia</div>
              </CardContent>
            </Card>
          </div>

          {/* Fund summary */}
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Quỹ lương đóng BH:</span>
                  <div className="font-semibold text-lg">{fmt(summary.totalSalaryFund)}đ</div>
                </div>
                <div>
                  <span className="text-muted-foreground">NLĐ đóng (10.5%):</span>
                  <div className="font-semibold">{fmt(summary.employeeContrib)}đ</div>
                </div>
                <div>
                  <span className="text-muted-foreground">NSDLĐ đóng (21.5%):</span>
                  <div className="font-semibold">{fmt(summary.employerContrib)}đ</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Danh Sách Tham Gia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-1 mb-4">
                {TABS.map((tab) => (
                  <Button
                    key={tab.key}
                    variant={activeTab === tab.key ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab(tab.key)}
                    style={activeTab === tab.key ? { backgroundColor: "#1E3A5F" } : undefined}
                  >
                    {tab.label} ({tab.count})
                  </Button>
                ))}
              </div>

              {activeTab === "all" ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Chọn tab để xem danh sách chi tiết, hoặc Export D02 để tải file đầy đủ.
                </p>
              ) : (
                <InsuranceTable rows={tableRows} type={activeTab} />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
