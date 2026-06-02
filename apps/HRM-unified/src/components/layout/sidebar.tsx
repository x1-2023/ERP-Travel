"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  Clock,
  Wallet,
  CalendarDays,
  Shield,
  UserPlus,
  TrendingUp,
  GraduationCap,
  DollarSign,
  PieChart,
  BarChart3,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useSidebarStore } from "@/stores/sidebar-store"

interface NavItem {
  title: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  children?: { title: string; href: string }[]
}

interface NavSection {
  id: string
  label: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    id: "people",
    label: "CON NGƯỜI",
    items: [
      { title: "Nhân viên", href: "/employees", icon: Users },
      {
        title: "Tổ chức",
        icon: Building2,
        children: [
          { title: "Phòng ban", href: "/organization/departments" },
          { title: "Chức danh", href: "/organization/positions" },
          { title: "Chi nhánh", href: "/organization/branches" },
        ],
      },
      {
        title: "Tuyển dụng",
        icon: UserPlus,
        children: [
          { title: "Tổng quan", href: "/recruitment" },
          { title: "Yêu cầu tuyển dụng", href: "/recruitment/requisitions" },
          { title: "Tin tuyển dụng", href: "/recruitment/jobs" },
          { title: "Ứng viên", href: "/recruitment/candidates" },
          { title: "Hồ sơ ứng tuyển", href: "/recruitment/applications" },
          { title: "Lịch phỏng vấn", href: "/recruitment/interviews" },
          { title: "Offer", href: "/recruitment/offers" },
          { title: "Onboarding", href: "/recruitment/onboarding" },
        ],
      },
    ],
  },
  {
    id: "operations",
    label: "VẬN HÀNH",
    items: [
      {
        title: "Chấm công",
        icon: Clock,
        children: [
          { title: "Chấm công", href: "/attendance" },
          { title: "Ca làm việc", href: "/attendance/shifts" },
          { title: "Tăng ca", href: "/attendance/overtime" },
          { title: "Tổng hợp công", href: "/attendance/summary" },
          { title: "Ngày lễ", href: "/attendance/holidays" },
        ],
      },
      {
        title: "Nghỉ phép",
        icon: CalendarDays,
        children: [
          { title: "Tổng quan", href: "/leave-admin" },
          { title: "Chính sách", href: "/leave-admin/policies" },
        ],
      },
      {
        title: "Bảng lương",
        icon: Wallet,
        children: [
          { title: "Kỳ lương", href: "/payroll/periods" },
          { title: "Tính lương", href: "/payroll/calculation" },
          { title: "Phiếu lương", href: "/payroll/payslips" },
          { title: "Điều chỉnh", href: "/payroll/adjustments" },
          { title: "Thanh toán", href: "/payroll/payments" },
          { title: "Thành phần lương", href: "/payroll/components" },
          { title: "Cấu hình", href: "/payroll/config" },
        ],
      },
      { title: "Hợp đồng", href: "/contracts", icon: FileText },
    ],
  },
  {
    id: "development",
    label: "PHÁT TRIỂN",
    items: [
      {
        title: "Hiệu suất",
        icon: TrendingUp,
        children: [
          { title: "Tổng quan", href: "/performance" },
          { title: "Mục tiêu", href: "/performance/goals" },
          { title: "Đánh giá", href: "/performance/reviews" },
          { title: "Feedback", href: "/performance/feedback" },
          { title: "Check-ins", href: "/performance/check-ins" },
          { title: "1-on-1", href: "/performance/one-on-ones" },
          { title: "Calibration", href: "/performance/calibration" },
          { title: "PIP", href: "/performance/pip" },
          { title: "Chu kỳ đánh giá", href: "/performance/admin/cycles" },
          { title: "Khung năng lực", href: "/performance/admin/competencies" },
          { title: "Giá trị cốt lõi", href: "/performance/admin/values" },
          { title: "Phân tích", href: "/performance/admin/analytics" },
        ],
      },
      {
        title: "Học tập",
        icon: GraduationCap,
        children: [
          { title: "Tổng quan", href: "/learning" },
          { title: "Khóa học", href: "/learning/courses" },
          { title: "Đang học", href: "/learning/my-learning" },
          { title: "Lộ trình", href: "/learning/paths" },
          { title: "Kỹ năng", href: "/learning/skills" },
          { title: "Chứng chỉ", href: "/learning/certifications" },
          { title: "Yêu cầu đào tạo", href: "/learning/requests" },
          { title: "Lịch đào tạo", href: "/learning/calendar" },
          { title: "Quản lý khóa học", href: "/learning/admin/courses" },
          { title: "Lịch đào tạo (Admin)", href: "/learning/admin/sessions" },
          { title: "Lộ trình học", href: "/learning/admin/paths" },
          { title: "Danh mục kỹ năng", href: "/learning/admin/skills" },
          { title: "Loại chứng chỉ", href: "/learning/admin/certifications" },
          { title: "Nhà cung cấp", href: "/learning/admin/providers" },
          { title: "Ngân sách", href: "/learning/admin/budget" },
          { title: "Duyệt yêu cầu", href: "/learning/admin/approvals" },
          { title: "Analytics", href: "/learning/admin/analytics" },
        ],
      },
      {
        title: "Đãi ngộ",
        icon: DollarSign,
        children: [
          { title: "Tổng quan", href: "/compensation" },
          { title: "Bậc lương", href: "/compensation/grades" },
          { title: "Ma trận Merit", href: "/compensation/merit-matrix" },
          { title: "Chu kỳ đãi ngộ", href: "/compensation/cycles" },
          { title: "Xét duyệt lương", href: "/compensation/reviews" },
          { title: "Phúc lợi", href: "/compensation/benefits" },
          { title: "Phụ cấp", href: "/compensation/allowances" },
          { title: "Tổng đãi ngộ", href: "/compensation/total-rewards" },
          { title: "Công bằng lương", href: "/compensation/pay-equity" },
          { title: "Benchmarking", href: "/compensation/benchmarks" },
          { title: "Lịch sử", href: "/compensation/history" },
          { title: "Phân tích", href: "/compensation/analytics" },
        ],
      },
    ],
  },
  {
    id: "analytics",
    label: "PHÂN TÍCH",
    items: [
      {
        title: "Phân tích",
        icon: PieChart,
        children: [
          { title: "Điều hành", href: "/analytics/executive" },
          { title: "Nhân sự", href: "/analytics/hr" },
          { title: "Lực lượng LĐ", href: "/analytics/workforce" },
          { title: "Nghỉ việc", href: "/analytics/turnover" },
          { title: "Lương thưởng", href: "/analytics/compensation" },
          { title: "Chấm công", href: "/analytics/attendance" },
          { title: "Dashboard", href: "/analytics/dashboards" },
          { title: "Báo cáo", href: "/analytics/reports" },
        ],
      },
      {
        title: "Báo cáo",
        icon: BarChart3,
        children: [
          { title: "Tạo báo cáo", href: "/reports" },
          { title: "Báo cáo đã lưu", href: "/reports/saved" },
          { title: "AI Insights", href: "/ai/insights" },
        ],
      },
    ],
  },
]

const bottomItems: NavItem[] = [
  {
    title: "Quản trị",
    icon: Shield,
    children: [
      { title: "Tổng quan", href: "/admin/system" },
      { title: "Tích hợp", href: "/admin/integrations" },
      { title: "Import", href: "/admin/import" },
      { title: "Export", href: "/admin/export" },
      { title: "Nhật ký", href: "/admin/audit" },
      { title: "Cơ sở tri thức", href: "/admin/knowledge" },
    ],
  },
  {
    title: "Cài đặt",
    icon: Settings,
    children: [
      { title: "Người dùng", href: "/settings/users" },
      { title: "Công ty", href: "/settings" },
    ],
  },
]

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { setCommandPaletteOpen } = useSidebarStore()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    )
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  const renderNavItem = (item: NavItem) => {
    if (item.href) {
      return (
        <Link key={item.title} href={item.href}>
          <span
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-150",
              isActive(item.href)
                ? "border-l-2 border-primary bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </span>
        </Link>
      )
    }

    const hasActiveChild = item.children?.some((child) => isActive(child.href))
    const isExpanded = expandedItems.includes(item.title)

    return (
      <div key={item.title}>
        <button
          onClick={() => toggleExpanded(item.title)}
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-150",
            hasActiveChild
              ? "border-l-2 border-primary bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
          )}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.title}</span>
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 opacity-50" />
              ) : (
                <ChevronRight className="h-3 w-3 opacity-50" />
              )}
            </>
          )}
        </button>
        {!collapsed && isExpanded && item.children && (
          <div className="ml-4 mt-0.5 space-y-0.5 border-l border-border/50 pl-3 animate-fade-in">
            {item.children.map((child) => (
              <Link key={child.href} href={child.href}>
                <span
                  className={cn(
                    "flex items-center rounded-md px-2 py-1 text-sm transition-colors duration-150",
                    isActive(child.href)
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {child.title}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-12 items-center border-b border-border px-4">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <span className="text-xs font-bold text-primary-foreground">R</span>
            </div>
            <span className="font-semibold text-foreground">RTR-<span className="text-primary">HRM</span></span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("ml-auto h-8 w-8", collapsed && "mx-auto")}
          onClick={onToggle}
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* AI Command Trigger */}
      {!collapsed ? (
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="mx-3 mt-3 mb-2 flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-muted-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-foreground transition-all duration-200 group ai-glow"
        >
          <Sparkles className="h-4 w-4 text-primary group-hover:animate-pulse-subtle" />
          <span className="flex-1 text-left text-xs font-medium">AI Command</span>
        </button>
      ) : (
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="mx-auto mt-3 mb-2 flex h-8 w-8 items-center justify-center rounded-md border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-all duration-200 ai-glow"
        >
          <Sparkles className="h-4 w-4" />
        </button>
      )}

      {/* Dashboard Link */}
      <div className="px-2 mb-1">
        <Link href="/">
          <span
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-1.5 text-sm font-semibold transition-all duration-150",
              isActive("/") && pathname === "/"
                ? "border-l-2 border-primary bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
            )}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="uppercase">Tổng quan</span>}
          </span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 scrollbar-terminal">
        {navSections.map((section) => (
          <div key={section.id} className="mt-4 first:mt-2">
            {/* Section Header */}
            {!collapsed && (
              <div className="px-3 pb-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                  {section.label}
                </span>
              </div>
            )}
            {/* Section Items */}
            <div className="space-y-0.5">
              {section.items.map(renderNavItem)}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-border px-2 py-2 space-y-0.5">
        {bottomItems.map(renderNavItem)}
      </div>
    </aside>
  )
}
