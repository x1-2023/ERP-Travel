"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

const pathLabels: Record<string, string> = {
  employees: "Nhân viên",
  new: "Thêm mới",
  edit: "Chỉnh sửa",
  import: "Nhập dữ liệu",
  organization: "Tổ chức",
  departments: "Phòng ban",
  positions: "Chức danh",
  branches: "Chi nhánh",
  contracts: "Hợp đồng",
  settings: "Cài đặt",
  users: "Người dùng",
  attendance: "Chấm công",
  shifts: "Ca làm việc",
  overtime: "Tăng ca",
  summary: "Tổng hợp",
  holidays: "Ngày lễ",
  payroll: "Bảng lương",
  periods: "Kỳ lương",
  calculation: "Tính lương",
  payslips: "Phiếu lương",
  adjustments: "Điều chỉnh",
  payments: "Thanh toán",
  components: "Thành phần",
  config: "Cấu hình",
  ess: "Cổng nhân viên",
  leave: "Nghỉ phép",
  approvals: "Phê duyệt",
  "leave-admin": "Quản lý phép",
  policies: "Chính sách",
  recruitment: "Tuyển dụng",
  requisitions: "Yêu cầu tuyển dụng",
  jobs: "Tin tuyển dụng",
  candidates: "Ứng viên",
  applications: "Hồ sơ ứng tuyển",
  interviews: "Lịch phỏng vấn",
  offers: "Đề nghị",
  onboarding: "Tiếp nhận",
  analytics: "Phân tích",
  reports: "Báo cáo",
  admin: "Quản trị",
  system: "Hệ thống",
  integrations: "Tích hợp",
  export: "Xuất dữ liệu",
  audit: "Nhật ký",
  knowledge: "Tri thức",
  ai: "Trí tuệ nhân tạo",
  insights: "Phân tích chuyên sâu",
}

export function Breadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length === 0) return null

  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/")
    const isLast = index === segments.length - 1
    const label = pathLabels[segment] || segment

    if (segment.length > 20) {
      return { href, label: "Chi tiết", isLast }
    }

    return { href, label, isLast }
  })

  return (
    <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
      <Link
        href="/"
        className="flex items-center hover:text-primary transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {breadcrumbs.map((crumb) => (
        <div key={crumb.href} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3" />
          {crumb.isLast ? (
            <span className="text-foreground font-medium">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="hover:text-primary transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
