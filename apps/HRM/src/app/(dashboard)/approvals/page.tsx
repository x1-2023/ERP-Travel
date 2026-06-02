"use client"

import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Search } from "lucide-react"
import { ReportCard, type ReportItem } from "@/components/reports/report-card"
import { REPORT_TYPE_LABELS } from "@/lib/constants/labels"
import { useState, useMemo } from "react"

const TYPE_OPTIONS = [
  { value: "ALL", label: "Tất cả loại" },
  ...Object.entries(REPORT_TYPE_LABELS).map(([value, label]) => ({ value, label })),
]

export default function ApprovalsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const role = session?.user?.role || ""

  const isDeptMgr = role === "DEPT_MANAGER"
  const isHR = ["SUPER_ADMIN", "HR_MANAGER"].includes(role)

  const [filterType, setFilterType] = useState("ALL")
  const [searchName, setSearchName] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["pending-approvals"],
    queryFn: async () => {
      const res = await fetch("/api/reports?pendingApproval=true")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  const allReports: ReportItem[] = data?.data || []
  const reports = useMemo(() => {
    let filtered = allReports
    if (filterType !== "ALL") {
      filtered = filtered.filter((r) => r.type === filterType)
    }
    if (searchName.trim()) {
      const q = searchName.trim().toLowerCase()
      filtered = filtered.filter((r) =>
        r.employee.fullName.toLowerCase().includes(q) ||
        r.employee.employeeCode.toLowerCase().includes(q)
      )
    }
    return filtered
  }, [allReports, filterType, searchName])

  return (
    <div>
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-background z-10 py-3 -mt-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1E3A5F" }}>
            Duyệt Đơn Từ
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isDeptMgr && "Đơn chờ duyệt từ nhân viên phòng bạn"}
            {isHR && "Đơn chờ duyệt cấp 2 (HR)"}
          </p>
        </div>
        <Badge variant="secondary" className="text-base px-3 py-1">
          {reports.length} chờ duyệt
        </Badge>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm nhân viên..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="pl-9 w-[200px]"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(filterType !== "ALL" || searchName.trim()) && (
          <Button variant="ghost" size="sm" onClick={() => { setFilterType("ALL"); setSearchName("") }}>
            Xoá bộ lọc
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="py-4 px-5">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-3 w-12" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Không có đơn nào chờ phê duyệt
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <ReportCard
              key={r.id}
              report={r}
              onClick={() => router.push(`/reports/${r.id}`)}
              showEmployee
            />
          ))}
        </div>
      )}
    </div>
  )
}
