"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  UserCheck,
  FileWarning,
  AlertTriangle,
  FileText,
  Wallet,
  ClipboardList,
  UserPlus,
  ChevronDown,
  ExternalLink,
} from "lucide-react"

interface DetailItem {
  label: string
  sublabel: string
  href?: string
}

interface StatsGridProps {
  totalActive: number
  totalProbation: number
  expiring7: number
  openReqs: number
  pendingApps: number
  pendingL1: number
  pendingL2: number
  currentPayroll: { status: string; totalNet: number; totalCost?: number; employeeCount: number }
  activeOnboarding: number
  loading: boolean
  // Detail data for expandable cards
  activeEmployeesList?: { id: string; name: string; code: string; department: string }[]
  probationEmployeesList?: { id: string; name: string; code: string; department: string; startDate: string }[]
  expiringContracts?: { id: string; employeeName: string; employeeCode: string; expiryDate: string; daysLeft: number }[]
  openReqsList?: { id: string; title: string; department: string; positions: number }[]
  pendingReports?: { id: string; type: string; status: string; employeeName: string; employeeCode: string }[]
  onboardingList?: { id: string; name: string; code: string }[]
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "Tỷ"
  if (n >= 1_000_000) return Math.round(n / 1_000_000) + "M"
  if (n >= 1_000) return Math.round(n / 1_000) + "K"
  return String(n)
}

const PAYROLL_STATUS: Record<string, string> = {
  DRAFT: "Nháp",
  SUBMITTED: "Đã gửi",
  APPROVED: "Đã duyệt",
  NONE: "Chưa có",
}

const REPORT_TYPE: Record<string, string> = {
  OVERTIME: "Tăng ca",
  BUSINESS_TRIP: "Công tác",
  LEAVE_PAID: "Nghỉ phép",
  LEAVE_UNPAID: "Nghỉ không lương",
  OTHER: "Khác",
}

export function StatsGrid(props: StatsGridProps) {
  const {
    totalActive, totalProbation, expiring7, openReqs,
    pendingL1, pendingL2, currentPayroll, activeOnboarding, loading,
    activeEmployeesList, probationEmployeesList, expiringContracts,
    openReqsList, pendingReports, onboardingList,
  } = props

  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const router = useRouter()

  const payrollLabel = currentPayroll.status === "NONE"
    ? "—"
    : currentPayroll.totalNet > 0
      ? formatCurrency(currentPayroll.totalNet) + "đ"
      : currentPayroll.status

  function buildDetails(key: string): DetailItem[] {
    switch (key) {
      case "active":
        return (activeEmployeesList ?? []).map((e) => ({
          label: `${e.code} — ${e.name}`,
          sublabel: e.department,
          href: `/employees`,
        }))
      case "probation":
        return (probationEmployeesList ?? []).map((e) => ({
          label: `${e.code} — ${e.name}`,
          sublabel: e.department,
          href: `/employees`,
        }))
      case "expiring":
        return (expiringContracts ?? []).filter((c) => c.daysLeft <= 7).map((c) => ({
          label: `${c.employeeCode} — ${c.employeeName}`,
          sublabel: `Còn ${c.daysLeft} ngày`,
          href: `/employees`,
        }))
      case "recruitment":
        return (openReqsList ?? []).map((r) => ({
          label: r.title,
          sublabel: `${r.department} — ${r.positions} vị trí`,
          href: `/recruitment`,
        }))
      case "pending":
        return (pendingReports ?? []).map((r) => ({
          label: `${r.employeeCode} — ${r.employeeName}`,
          sublabel: REPORT_TYPE[r.type] || r.type,
          href: `/reports/${r.id}`,
        }))
      case "payroll":
        return currentPayroll.status === "NONE" ? [] : [
          { label: `Trạng thái: ${PAYROLL_STATUS[currentPayroll.status] || currentPayroll.status}`, sublabel: "" },
          { label: `Nhân viên: ${currentPayroll.employeeCount}`, sublabel: "" },
          { label: `Tổng lương NET: ${formatCurrency(currentPayroll.totalNet)}đ`, sublabel: "" },
        ]
      case "onboarding":
        return (onboardingList ?? []).map((o) => ({
          label: `${o.code} — ${o.name}`,
          sublabel: "Đang onboard",
          href: `/employees`,
        }))
      default:
        return []
    }
  }

  const cards = [
    { key: "active", title: "NV Active", value: totalActive, icon: Users, color: "#1E3A5F", viewAllHref: "/employees" },
    { key: "probation", title: "Thử Việc", value: totalProbation, icon: UserCheck, color: "#0891B2", viewAllHref: "/employees" },
    { key: "expiring", title: "HĐ < 7 ngày", value: expiring7, icon: expiring7 > 0 ? AlertTriangle : FileWarning, color: expiring7 > 0 ? "#DC2626" : "#D97706", viewAllHref: "/employees" },
    { key: "recruitment", title: "Tuyển Dụng", value: openReqs, icon: UserPlus, color: "#7C3AED", viewAllHref: "/recruitment" },
    { key: "pending", title: "Chờ Duyệt", value: pendingL1 + pendingL2, icon: FileText, color: "#059669", viewAllHref: "/approvals" },
    { key: "payroll", title: "Lương", value: payrollLabel, icon: Wallet, color: "#D97706", viewAllHref: "/payroll" },
    { key: "onboarding", title: "Onboarding", value: activeOnboarding, icon: ClipboardList, color: "#0D9488", viewAllHref: "/employees" },
  ]

  const expandedCard = expandedKey ? cards.find((c) => c.key === expandedKey) : null
  const expandedDetails = expandedKey ? buildDetails(expandedKey) : []

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-7 gap-3">
        {cards.map((card) => {
          const isExpanded = expandedKey === card.key
          return (
            <Card
              key={card.key}
              className={`cursor-pointer transition-all hover:shadow-md ${isExpanded ? "ring-2" : ""}`}
              style={isExpanded ? { borderColor: card.color, boxShadow: `0 0 0 2px ${card.color}` } : undefined}
              onClick={() => setExpandedKey(isExpanded ? null : card.key)}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <card.icon className="h-4 w-4" style={{ color: card.color }} />
              </CardHeader>
              <CardContent className="pb-3 px-4 flex items-end justify-between">
                <div className="text-xl font-bold">
                  {loading ? "..." : card.value}
                </div>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
                />
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Expandable detail panel */}
      {expandedCard && (
        <Card className="mt-3 animate-in slide-in-from-top-2 duration-200">
          <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
            <CardTitle className="text-sm font-semibold" style={{ color: expandedCard.color }}>
              {expandedCard.title}
              {typeof expandedCard.value === "number" && expandedCard.value > 0 && (
                <span className="text-muted-foreground font-normal ml-2">({expandedCard.value})</span>
              )}
            </CardTitle>
            <button
              onClick={(e) => { e.stopPropagation(); router.push(expandedCard.viewAllHref) }}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              Xem tất cả <ExternalLink className="h-3 w-3" />
            </button>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0">
            {expandedDetails.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">Không có dữ liệu</p>
            ) : (
              <div className="space-y-0 divide-y">
                {expandedDetails.map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between py-2 text-sm ${item.href ? "cursor-pointer hover:bg-muted/50 -mx-2 px-2 rounded" : ""}`}
                    onClick={(e) => {
                      if (item.href) { e.stopPropagation(); router.push(item.href) }
                    }}
                  >
                    <span className="font-medium">{item.label}</span>
                    {item.sublabel && (
                      <span className="text-muted-foreground text-xs">{item.sublabel}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
