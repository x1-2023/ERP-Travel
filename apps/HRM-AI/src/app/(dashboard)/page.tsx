"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { MetricCard } from "@/components/ui/metric-card"
import { StatusBadge } from "@/components/ui/status-badge"
import {
  AreaChartTerminal,
  BarChartTerminal,
  Sparkline,
} from "@/components/charts"
import { useAnimatedCounter, formatCurrency, staggerStyle } from "@/lib/animation"
import {
  Users,
  UserCheck,
  UserMinus,
  Bell,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  ArrowUpRight,
  Loader2,
} from "lucide-react"
import Link from "next/link"

interface DashboardData {
  overview: {
    totalEmployees: { value: number; change: number; changePercent: number }
    newHires: { value: number; change: number; label: string }
    resignations: { value: number; change: number; label: string }
    avgTenure: { value: number; label: string }
    turnoverRate: { value: number; label: string }
  }
  attendance: {
    activeToday: number
    onLeaveToday: number
    attendanceRate: number
  }
  distribution: {
    department: Array<{ name: string; headcount: number }>
  }
  alerts: {
    pendingApprovals: number
    pendingLeaveRequests: number
  }
  payroll: {
    totalPayroll: number
  }
  attendanceTrend: Array<{ name: string; value: number }>
  recentActivities: Array<{
    id: string
    user: string
    action: string
    time: string
    status: "pending" | "success" | "info"
  }>
  overtimeHours: number
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard/stats')
      if (res.ok) {
        const json = await res.json()
        setData(json.data)
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalEmployees = data?.overview.totalEmployees.value ?? 0
  const totalPayroll = data?.payroll.totalPayroll ?? 0
  const animatedEmployees = useAnimatedCounter(totalEmployees, 1000)
  const animatedPayroll = useAnimatedCounter(totalPayroll, 1500)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const changePercent = data?.overview.totalEmployees.changePercent ?? 0
  const activeToday = data?.attendance.activeToday ?? 0
  const attendanceRate = data?.attendance.attendanceRate ?? 0
  const onLeaveToday = data?.attendance.onLeaveToday ?? 0
  const pendingApprovals = (data?.alerts.pendingApprovals ?? 0) + (data?.alerts.pendingLeaveRequests ?? 0)
  const attendanceTrend = data?.attendanceTrend ?? []
  const departmentData = data?.distribution.department ?? []
  const recentActivities = data?.recentActivities ?? []
  const newHires = data?.overview.newHires.value ?? 0
  const turnoverRate = data?.overview.turnoverRate.value ?? 0
  const avgTenure = data?.overview.avgTenure.value ?? 0
  const overtimeHours = data?.overtimeHours ?? 0

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Tổng quan</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Chào mừng trở lại! Đây là tình hình nhân sự hôm nay.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono">
            Cập nhật: {new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          title="Tổng nhân viên"
          value={animatedEmployees.toLocaleString("vi-VN")}
          icon={<Users className="w-5 h-5" />}
          change={changePercent}
          changeLabel="so với tháng trước"
          trend={changePercent >= 0 ? "up" : "down"}
          className="animate-fade-in-up"
          style={staggerStyle(0)}
        />
        <MetricCard
          title="Đi làm hôm nay"
          value={activeToday.toLocaleString("vi-VN")}
          icon={<UserCheck className="w-5 h-5" />}
          change={attendanceRate}
          changeLabel="tỷ lệ có mặt"
          trend="up"
          className="animate-fade-in-up"
          style={staggerStyle(1)}
        />
        <MetricCard
          title="Đang nghỉ phép"
          value={onLeaveToday.toLocaleString("vi-VN")}
          icon={<UserMinus className="w-5 h-5" />}
          trend="neutral"
          className="animate-fade-in-up"
          style={staggerStyle(2)}
        />
        <MetricCard
          title="Chờ duyệt"
          value={pendingApprovals.toLocaleString("vi-VN")}
          icon={<Bell className="w-5 h-5" />}
          trend="neutral"
          className="animate-fade-in-up"
          style={staggerStyle(3)}
        />
      </div>

      {/* Financial & Trends Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Payroll Card */}
        <div
          className="card-terminal p-4 sm:p-6 animate-fade-in-up"
          style={staggerStyle(4)}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Quỹ lương tháng này</p>
              <p className="text-2xl sm:text-3xl font-bold font-mono mt-1 text-primary">
                {formatCurrency(animatedPayroll)}
              </p>
              <div className="flex items-center gap-1 mt-2 text-muted-foreground text-sm">
                <span className="text-xs">Từ kỳ lương gần nhất</span>
              </div>
            </div>
            <Sparkline data={[42, 45, 48, 46, 52, 55, 58]} height={48} width={80} />
          </div>
        </div>

        {/* Attendance Trend */}
        <div
          className="card-terminal p-4 sm:p-6 lg:col-span-2 animate-fade-in-up"
          style={staggerStyle(5)}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Xu hướng chấm công tuần này</h3>
            <Link
              href="/attendance"
              className="text-xs text-primary hover:underline flex items-center gap-0.5"
            >
              Xem chi tiết <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <AreaChartTerminal
            data={attendanceTrend}
            dataKey="value"
            height={160}
            formatValue={(v) => `${v}%`}
          />
        </div>
      </div>

      {/* Department Stats & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Department Distribution */}
        <div
          className="card-terminal p-4 sm:p-6 animate-fade-in-up"
          style={staggerStyle(6)}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Phân bổ theo phòng ban</h3>
            <Link
              href="/employees"
              className="text-xs text-primary hover:underline flex items-center gap-0.5"
            >
              Xem tất cả <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <BarChartTerminal
            data={departmentData}
            dataKeys={["headcount"]}
            xAxisKey="name"
            height={200}
            showLegend={false}
          />
        </div>

        {/* Recent Activities */}
        <div
          className="card-terminal p-4 sm:p-6 animate-fade-in-up"
          style={staggerStyle(7)}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Hoạt động gần đây</h3>
          </div>
          <div className="space-y-2">
            {recentActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Chưa có hoạt động nào</p>
            ) : (
              recentActivities.map((activity, index) => (
                <div
                  key={activity.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg bg-elevated/50",
                    "hover:bg-elevated transition-colors duration-150",
                    "animate-fade-in-up"
                  )}
                  style={staggerStyle(index, 40)}
                >
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full mt-1.5 shrink-0",
                      activity.status === "pending" && "bg-amber-500",
                      activity.status === "success" && "bg-emerald-500",
                      activity.status === "info" && "bg-blue-500"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.action}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {activity.user} • {activity.time}
                    </p>
                  </div>
                  <StatusBadge
                    status={activity.status}
                    label={
                      activity.status === "pending"
                        ? "Chờ duyệt"
                        : activity.status === "success"
                          ? "Hoàn thành"
                          : "Thông tin"
                    }
                    size="sm"
                    showIcon={false}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <QuickStatCard
          label="Nhân viên mới"
          value={newHires}
          subtext="tháng này"
          trend={newHires > 0 ? "up" : undefined}
          index={8}
        />
        <QuickStatCard
          label="Tỷ lệ nghỉ việc"
          value={`${turnoverRate}%`}
          subtext="12 tháng qua"
          trend={turnoverRate > 0 ? "down" : undefined}
          trendGood
          index={9}
        />
        <QuickStatCard
          label="Thâm niên TB"
          value={(avgTenure / 12).toFixed(1)}
          subtext="năm"
          index={10}
        />
        <QuickStatCard
          label="Giờ tăng ca"
          value={overtimeHours.toLocaleString("vi-VN")}
          subtext="tháng này"
          trend={overtimeHours > 0 ? "up" : undefined}
          index={11}
        />
      </div>
    </div>
  )
}

// Quick Stat Card Component
function QuickStatCard({
  label,
  value,
  subtext,
  trend,
  trendGood,
  index = 0,
}: {
  label: string
  value: string | number
  subtext: string
  trend?: "up" | "down"
  trendGood?: boolean
  index?: number
}) {
  const isPositive = trendGood ? trend === "down" : trend === "up"
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown

  return (
    <div
      className="card-terminal p-4 animate-fade-in-up hover-lift"
      style={staggerStyle(index)}
    >
      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
        {label}
      </p>
      <div className="flex items-end gap-2 mt-1">
        <span className="text-xl font-bold font-mono">{value}</span>
        {trend && (
          <TrendIcon
            className={cn(
              "w-4 h-4 mb-0.5",
              isPositive ? "text-emerald-500" : "text-red-500"
            )}
          />
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
    </div>
  )
}
