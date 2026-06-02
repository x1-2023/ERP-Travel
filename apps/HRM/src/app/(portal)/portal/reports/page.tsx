"use client"

import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { ReportCard, type ReportItem } from "@/components/reports/report-card"
import { Palmtree, Clock, Plane } from "lucide-react"

const quickActions = [
  { label: "Nghỉ phép", type: "LEAVE_PAID", icon: Palmtree, color: "bg-green-50 text-green-700" },
  { label: "Tăng ca", type: "OVERTIME", icon: Clock, color: "bg-orange-50 text-orange-700" },
  { label: "Công tác", type: "BUSINESS_TRIP", icon: Plane, color: "bg-blue-50 text-blue-700" },
]

export default function PortalReportsPage() {
  const router = useRouter()

  const { data: profileData } = useQuery({
    queryKey: ["portal-profile"],
    queryFn: async () => {
      const res = await fetch("/api/employees/me")
      if (!res.ok) return null
      return res.json()
    },
  })

  const { data: reportsData, isLoading } = useQuery({
    queryKey: ["portal-reports"],
    queryFn: async () => {
      const res = await fetch("/api/reports")
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  const leaveBalance = profileData?.data?.leaveBalance
  const reports: ReportItem[] = reportsData?.data || []

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        {quickActions.map((qa) => (
          <button
            key={qa.type}
            onClick={() => router.push(`/portal/reports/new?type=${qa.type}`)}
            className={`${qa.color} rounded-xl p-3 flex flex-col items-center gap-2 transition-all active:scale-95`}
          >
            <qa.icon className="h-6 w-6" />
            <span className="text-xs font-medium">{qa.label}</span>
          </button>
        ))}
      </div>

      {/* Leave balance */}
      {leaveBalance != null && (
        <Card>
          <CardContent className="py-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Phép còn lại</span>
            <span className="text-lg font-bold" style={{ color: "#1E3A5F" }}>
              {leaveBalance?.remainingDays ?? "—"} ngày
            </span>
          </CardContent>
        </Card>
      )}

      {/* Reports list */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-2">Đơn từ của tôi</h2>
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Đang tải...</div>
        ) : reports.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Chưa có đơn từ nào
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onClick={() => router.push(`/reports/${report.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
