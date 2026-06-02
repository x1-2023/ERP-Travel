"use client"

import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { StatsGrid } from "@/components/dashboard/stats-grid"
import { DeptChart } from "@/components/dashboard/dept-chart"
import { TrendChart } from "@/components/dashboard/trend-chart"
import { ExpiryAlerts } from "@/components/dashboard/expiry-alerts"
import { PendingList } from "@/components/dashboard/pending-list"

export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
    refetchInterval: 60000,
  })

  const metrics = data || {}

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#1E3A5F" }}>
          Tổng Quan
        </h1>
        <span className="text-sm text-muted-foreground">
          Tháng {format(new Date(), "MM/yyyy", { locale: vi })}
        </span>
      </div>

      {isError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          Không thể tải dữ liệu tổng quan. Vui lòng thử lại sau.
        </div>
      )}

      <StatsGrid
        totalActive={metrics.totalActive ?? 0}
        totalProbation={metrics.totalProbation ?? 0}
        expiring7={metrics.expiring7 ?? 0}
        openReqs={metrics.openReqs ?? 0}
        pendingApps={metrics.pendingApps ?? 0}
        pendingL1={metrics.pendingL1 ?? 0}
        pendingL2={metrics.pendingL2 ?? 0}
        currentPayroll={metrics.currentPayroll ?? { status: "NONE", totalNet: 0, employeeCount: 0 }}
        activeOnboarding={metrics.activeOnboarding ?? 0}
        loading={isLoading}
        activeEmployeesList={metrics.activeEmployeesList}
        probationEmployeesList={metrics.probationEmployeesList}
        expiringContracts={metrics.expiringContracts}
        openReqsList={metrics.openReqsList}
        pendingReports={metrics.pendingReports}
        onboardingList={metrics.onboardingList}
      />

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <DeptChart data={metrics.byDepartment ?? []} />
        <TrendChart data={metrics.headcountTrend ?? []} />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <ExpiryAlerts contracts={metrics.expiringContracts ?? []} />
        <PendingList reports={metrics.pendingReports ?? []} />
      </div>
    </div>
  )
}
