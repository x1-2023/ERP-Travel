"use client"

import { useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import { useSidebarStore } from "@/stores/sidebar-store"
import {
  Sparkles,
  Search,
  Users,
  Building2,
  FileText,
  Clock,
  Wallet,
  CalendarDays,
  User,
  Shield,
  Settings,
  UserPlus,
  TrendingUp,
  GraduationCap,
  DollarSign,
  PieChart,
  BarChart3,
  LayoutDashboard,
  MessageSquare,
} from "lucide-react"

interface CommandItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  section: string
  keywords?: string
}

const commandItems: CommandItem[] = [
  // TỔNG QUAN
  { label: "Tổng quan", href: "/", icon: LayoutDashboard, section: "Điều hướng", keywords: "dashboard home trang chu" },

  // CON NGƯỜI
  { label: "Nhân viên", href: "/employees", icon: Users, section: "Con người", keywords: "employee staff nhan vien" },
  { label: "Phòng ban", href: "/organization/departments", icon: Building2, section: "Con người", keywords: "department phong ban to chuc" },
  { label: "Chức danh", href: "/organization/positions", icon: Building2, section: "Con người", keywords: "position chuc danh" },
  { label: "Chi nhánh", href: "/organization/branches", icon: Building2, section: "Con người", keywords: "branch chi nhanh" },
  { label: "Tuyển dụng - Tổng quan", href: "/recruitment", icon: UserPlus, section: "Con người", keywords: "recruitment tuyen dung" },
  { label: "Yêu cầu tuyển dụng", href: "/recruitment/requisitions", icon: UserPlus, section: "Con người", keywords: "requisition yeu cau" },
  { label: "Tin tuyển dụng", href: "/recruitment/jobs", icon: UserPlus, section: "Con người", keywords: "job tin tuyen" },
  { label: "Ứng viên", href: "/recruitment/candidates", icon: UserPlus, section: "Con người", keywords: "candidate ung vien" },
  { label: "Hồ sơ ứng tuyển", href: "/recruitment/applications", icon: UserPlus, section: "Con người", keywords: "application ho so" },
  { label: "Lịch phỏng vấn", href: "/recruitment/interviews", icon: UserPlus, section: "Con người", keywords: "interview phong van" },
  { label: "Offer", href: "/recruitment/offers", icon: UserPlus, section: "Con người", keywords: "offer thu moi" },
  { label: "Onboarding", href: "/recruitment/onboarding", icon: UserPlus, section: "Con người", keywords: "onboarding hoi nhap" },

  // VẬN HÀNH
  { label: "Chấm công", href: "/attendance", icon: Clock, section: "Vận hành", keywords: "attendance cham cong" },
  { label: "Ca làm việc", href: "/attendance/shifts", icon: Clock, section: "Vận hành", keywords: "shift ca lam viec" },
  { label: "Tăng ca", href: "/attendance/overtime", icon: Clock, section: "Vận hành", keywords: "overtime tang ca" },
  { label: "Tổng hợp công", href: "/attendance/summary", icon: Clock, section: "Vận hành", keywords: "summary tong hop" },
  { label: "Ngày lễ", href: "/attendance/holidays", icon: Clock, section: "Vận hành", keywords: "holiday ngay le" },
  { label: "Nghỉ phép - Tổng quan", href: "/leave-admin", icon: CalendarDays, section: "Vận hành", keywords: "leave nghi phep" },
  { label: "Chính sách nghỉ phép", href: "/leave-admin/policies", icon: CalendarDays, section: "Vận hành", keywords: "policy chinh sach" },
  { label: "Kỳ lương", href: "/payroll/periods", icon: Wallet, section: "Vận hành", keywords: "period ky luong" },
  { label: "Tính lương", href: "/payroll/calculation", icon: Wallet, section: "Vận hành", keywords: "calculation tinh luong" },
  { label: "Phiếu lương", href: "/payroll/payslips", icon: Wallet, section: "Vận hành", keywords: "payslip phieu luong" },
  { label: "Điều chỉnh lương", href: "/payroll/adjustments", icon: Wallet, section: "Vận hành", keywords: "adjustment dieu chinh" },
  { label: "Thanh toán", href: "/payroll/payments", icon: Wallet, section: "Vận hành", keywords: "payment thanh toan" },
  { label: "Thành phần lương", href: "/payroll/components", icon: Wallet, section: "Vận hành", keywords: "component thanh phan" },
  { label: "Cấu hình lương", href: "/payroll/config", icon: Wallet, section: "Vận hành", keywords: "config cau hinh" },
  { label: "Hợp đồng", href: "/contracts", icon: FileText, section: "Vận hành", keywords: "contract hop dong" },

  // PHÁT TRIỂN
  { label: "Hiệu suất - Tổng quan", href: "/performance", icon: TrendingUp, section: "Phát triển", keywords: "performance hieu suat" },
  { label: "Mục tiêu", href: "/performance/goals", icon: TrendingUp, section: "Phát triển", keywords: "goal muc tieu" },
  { label: "Đánh giá", href: "/performance/reviews", icon: TrendingUp, section: "Phát triển", keywords: "review danh gia" },
  { label: "Feedback", href: "/performance/feedback", icon: TrendingUp, section: "Phát triển", keywords: "feedback phan hoi" },
  { label: "Check-ins", href: "/performance/check-ins", icon: TrendingUp, section: "Phát triển", keywords: "checkin" },
  { label: "Calibration", href: "/performance/calibration", icon: TrendingUp, section: "Phát triển", keywords: "calibration hieu chuan" },
  { label: "Học tập - Tổng quan", href: "/learning", icon: GraduationCap, section: "Phát triển", keywords: "learning hoc tap dao tao" },
  { label: "Khóa học", href: "/learning/courses", icon: GraduationCap, section: "Phát triển", keywords: "course khoa hoc" },
  { label: "Đang học", href: "/learning/my-learning", icon: GraduationCap, section: "Phát triển", keywords: "my learning dang hoc" },
  { label: "Lộ trình học", href: "/learning/paths", icon: GraduationCap, section: "Phát triển", keywords: "path lo trinh" },
  { label: "Kỹ năng", href: "/learning/skills", icon: GraduationCap, section: "Phát triển", keywords: "skill ky nang" },
  { label: "Chứng chỉ", href: "/learning/certifications", icon: GraduationCap, section: "Phát triển", keywords: "certification chung chi" },
  { label: "Đãi ngộ - Tổng quan", href: "/compensation", icon: DollarSign, section: "Phát triển", keywords: "compensation dai ngo" },
  { label: "Bậc lương", href: "/compensation/grades", icon: DollarSign, section: "Phát triển", keywords: "grade bac luong" },
  { label: "Phúc lợi", href: "/compensation/benefits", icon: DollarSign, section: "Phát triển", keywords: "benefit phuc loi" },
  { label: "Phụ cấp", href: "/compensation/allowances", icon: DollarSign, section: "Phát triển", keywords: "allowance phu cap" },

  // PHÂN TÍCH
  { label: "Phân tích điều hành", href: "/analytics/executive", icon: PieChart, section: "Phân tích", keywords: "analytics executive dieu hanh" },
  { label: "Phân tích nhân sự", href: "/analytics/hr", icon: PieChart, section: "Phân tích", keywords: "analytics hr nhan su" },
  { label: "Phân tích nghỉ việc", href: "/analytics/turnover", icon: PieChart, section: "Phân tích", keywords: "turnover nghi viec" },
  { label: "Dashboard phân tích", href: "/analytics/dashboards", icon: PieChart, section: "Phân tích", keywords: "dashboard" },
  { label: "Tạo báo cáo", href: "/reports", icon: BarChart3, section: "Phân tích", keywords: "report bao cao" },
  { label: "Báo cáo đã lưu", href: "/reports/saved", icon: BarChart3, section: "Phân tích", keywords: "saved da luu" },
  { label: "AI Insights", href: "/ai/insights", icon: Sparkles, section: "Phân tích", keywords: "ai insights" },

  // ESS PORTAL
  { label: "ESS Portal", href: "/ess", icon: User, section: "ESS Portal", keywords: "ess portal tu phuc vu" },
  { label: "Xin nghỉ phép", href: "/ess/leave", icon: User, section: "ESS Portal", keywords: "ess leave xin nghi" },
  { label: "Phê duyệt", href: "/ess/approvals", icon: User, section: "ESS Portal", keywords: "ess approval phe duyet" },

  // QUẢN TRỊ
  { label: "Quản trị hệ thống", href: "/admin/system", icon: Shield, section: "Quản trị", keywords: "admin system he thong" },
  { label: "Tích hợp", href: "/admin/integrations", icon: Shield, section: "Quản trị", keywords: "integration tich hop" },
  { label: "Import dữ liệu", href: "/admin/import", icon: Shield, section: "Quản trị", keywords: "import nhap du lieu" },
  { label: "Export dữ liệu", href: "/admin/export", icon: Shield, section: "Quản trị", keywords: "export xuat du lieu" },
  { label: "Nhật ký hệ thống", href: "/admin/audit", icon: Shield, section: "Quản trị", keywords: "audit log nhat ky" },
  { label: "Cơ sở tri thức", href: "/admin/knowledge", icon: Shield, section: "Quản trị", keywords: "knowledge base tri thuc" },
  { label: "Người dùng", href: "/settings/users", icon: Settings, section: "Quản trị", keywords: "user nguoi dung" },
  { label: "Cài đặt công ty", href: "/settings", icon: Settings, section: "Quản trị", keywords: "settings cai dat cong ty" },
]

const sections = ["AI", "Điều hướng", "Con người", "Vận hành", "Phát triển", "Phân tích", "ESS Portal", "Quản trị"]

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useSidebarStore()
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandPaletteOpen(!commandPaletteOpen)
      }
      if (e.key === "Escape") {
        setCommandPaletteOpen(false)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [commandPaletteOpen, setCommandPaletteOpen])

  const runCommand = useCallback((command: () => void) => {
    setCommandPaletteOpen(false)
    command()
  }, [setCommandPaletteOpen])

  if (!commandPaletteOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => setCommandPaletteOpen(false)}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-lg mx-4 animate-scale-in">
        <div className="overflow-hidden rounded-lg border border-border bg-popover shadow-elevated">
          <Command className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground/70">
            <div className="flex items-center border-b border-border px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
              <Command.Input
                placeholder="Nhập lệnh hoặc tìm kiếm..."
                className="flex h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
              />
              <kbd className="ml-2 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono border border-border">
                ESC
              </kbd>
            </div>
            <Command.List className="max-h-[320px] overflow-y-auto p-2 scrollbar-terminal">
              <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                Không tìm thấy kết quả.
              </Command.Empty>

              {/* AI Actions */}
              <Command.Group heading="AI">
                <Command.Item
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm cursor-pointer aria-selected:bg-primary/10 aria-selected:text-primary"
                  onSelect={() => runCommand(() => {
                    // Trigger chat widget - dispatch custom event
                    window.dispatchEvent(new CustomEvent('open-ai-chat'))
                  })}
                  value="hoi ai tro ly chat"
                >
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span>Hỏi AI trợ lý</span>
                  <span className="ml-auto text-xs text-muted-foreground">Chat</span>
                </Command.Item>
                <Command.Item
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm cursor-pointer aria-selected:bg-primary/10 aria-selected:text-primary"
                  onSelect={() => runCommand(() => router.push("/ai/insights"))}
                  value="ai insights phan tich thong minh"
                >
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>AI Insights</span>
                  <span className="ml-auto text-xs text-muted-foreground">Phân tích</span>
                </Command.Item>
              </Command.Group>

              {/* Navigation sections */}
              {sections.filter(s => s !== "AI").map((section) => {
                const items = commandItems.filter((item) => item.section === section)
                if (items.length === 0) return null
                return (
                  <Command.Group key={section} heading={section}>
                    {items.map((item) => (
                      <Command.Item
                        key={item.href}
                        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm cursor-pointer aria-selected:bg-primary/10 aria-selected:text-primary"
                        onSelect={() => runCommand(() => router.push(item.href))}
                        value={`${item.label} ${item.keywords || ""}`}
                      >
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                        <span>{item.label}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )
              })}
            </Command.List>
          </Command>
        </div>
      </div>
    </div>
  )
}
