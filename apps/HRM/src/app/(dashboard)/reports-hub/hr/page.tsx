"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Users, UserPlus, UserMinus, ArrowRightLeft, TrendingDown, AlertTriangle, Download } from "lucide-react"
import Link from "next/link"
import { HeadcountLineChart, DepartmentBarChart } from "@/components/reports-hub/hr-charts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface MovementEmployee {
  employeeCode?: string
  fullName?: string
  startDate?: string
  resignDate?: string
  department?: { name: string }
  employee?: { employeeCode: string; fullName: string }
  effectiveDate?: string
}

export default function HRReportPage() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const [quarter, setQuarter] = useState<string>("")
  const [activeTab, setActiveTab] = useState<"newHires" | "resignations" | "transfers" | "promotions">("newHires")

  const queryParams = new URLSearchParams({ year: String(year) })
  if (quarter) queryParams.set("quarter", quarter)

  const { data, isLoading } = useQuery({
    queryKey: ["reports-hub-hr", year, quarter],
    queryFn: async () => {
      const res = await fetch(`/api/reports-hub/hr?${queryParams.toString()}`)
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  const headcount = data?.headcountByMonth || []
  const movements = data?.movements || { newHires: { count: 0 }, resignations: { count: 0 }, transfers: { count: 0 }, promotions: { count: 0 } }
  const turnoverRate = data?.turnoverRate || 0
  const byDepartment = data?.byDepartment || []
  const byGender = data?.byGender || { male: 0, female: 0 }
  const expiringContracts = data?.expiringContracts || []
  const latestTotal = headcount.length > 0 ? headcount[headcount.length - 1].total : 0

  const TABS = [
    { key: "newHires" as const, label: "Tuyển Mới", count: movements.newHires.count },
    { key: "resignations" as const, label: "Nghỉ Việc", count: movements.resignations.count },
    { key: "transfers" as const, label: "Điều Chuyển", count: movements.transfers.count },
    { key: "promotions" as const, label: "Thăng Chức", count: movements.promotions.count },
  ]

  const activeList: MovementEmployee[] = movements[activeTab]?.employees || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/reports-hub">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: "#1E3A5F" }}>Báo Cáo Nhân Sự</h1>
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
          <Select value={quarter || "__all__"} onValueChange={(v) => setQuarter(v === "__all__" ? "" : v)}>
            <SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Cả năm</SelectItem>
              <SelectItem value="1">Quý 1</SelectItem>
              <SelectItem value="2">Quý 2</SelectItem>
              <SelectItem value="3">Quý 3</SelectItem>
              <SelectItem value="4">Quý 4</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const params = new URLSearchParams({ type: "hr", year: String(year) })
              if (quarter) params.set("quarter", quarter)
              window.open(`/api/reports-hub/export?${params.toString()}`, "_blank")
            }}
          >
            <Download className="h-4 w-4 mr-1" />
            Export Excel
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground py-8 text-center">Đang tải...</p>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Card>
              <CardContent className="pt-4 pb-3 text-center">
                <Users className="h-5 w-5 mx-auto text-blue-600 mb-1" />
                <div className="text-2xl font-bold">{latestTotal}</div>
                <div className="text-xs text-muted-foreground">NV Total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 text-center">
                <UserPlus className="h-5 w-5 mx-auto text-emerald-600 mb-1" />
                <div className="text-2xl font-bold text-emerald-600">+{movements.newHires.count}</div>
                <div className="text-xs text-muted-foreground">Tuyển Mới</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 text-center">
                <UserMinus className="h-5 w-5 mx-auto text-red-500 mb-1" />
                <div className="text-2xl font-bold text-red-500">-{movements.resignations.count}</div>
                <div className="text-xs text-muted-foreground">Nghỉ Việc</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 text-center">
                <ArrowRightLeft className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                <div className="text-2xl font-bold">{movements.transfers.count}</div>
                <div className="text-xs text-muted-foreground">Chuyển Nhượng</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 text-center">
                <TrendingDown className="h-5 w-5 mx-auto text-orange-500 mb-1" />
                <div className="text-2xl font-bold">{turnoverRate}%</div>
                <div className="text-xs text-muted-foreground">Turnover</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Biến Động Headcount</CardTitle>
              </CardHeader>
              <CardContent>
                <HeadcountLineChart data={headcount} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Phân Bố Theo Phòng Ban</CardTitle>
              </CardHeader>
              <CardContent>
                <DepartmentBarChart data={byDepartment} />
                <div className="flex gap-4 mt-3 text-sm text-muted-foreground justify-center">
                  <span>Nam: <strong>{byGender.male}</strong></span>
                  <span>Nữ: <strong>{byGender.female}</strong></span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Expiring contracts */}
          {expiringContracts.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  HĐ Sắp Hết Hạn (60 ngày)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {expiringContracts.map((c: { employee: string; contractNo: string; officialTo: string; daysLeft: number }, i: number) => (
                    <div key={i} className="flex items-center justify-between text-sm border-b pb-2 last:border-b-0">
                      <span className="font-medium">{c.employee}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">{c.contractNo}</span>
                        <Badge className={c.daysLeft <= 15 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}>
                          {c.daysLeft} ngày
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Movement details */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Biến Động Chi Tiết</CardTitle>
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
              {activeList.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Không có dữ liệu</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã NV</TableHead>
                      <TableHead>Họ Tên</TableHead>
                      <TableHead>Phòng Ban</TableHead>
                      <TableHead>Ngày</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeList.map((emp, i) => (
                      <TableRow key={i}>
                        <TableCell>{emp.employeeCode || emp.employee?.employeeCode || ""}</TableCell>
                        <TableCell className="font-medium">{emp.fullName || emp.employee?.fullName || ""}</TableCell>
                        <TableCell>{emp.department?.name || ""}</TableCell>
                        <TableCell>
                          {emp.startDate ? new Date(emp.startDate).toLocaleDateString("vi-VN") :
                           emp.resignDate ? new Date(emp.resignDate).toLocaleDateString("vi-VN") :
                           emp.effectiveDate ? new Date(emp.effectiveDate).toLocaleDateString("vi-VN") : ""}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
