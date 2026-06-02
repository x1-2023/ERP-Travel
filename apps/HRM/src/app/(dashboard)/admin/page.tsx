"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, Briefcase, Settings, ScrollText } from "lucide-react"

const adminSections = [
  {
    title: "Quản Lý Người Dùng",
    description: "Tạo tài khoản, phân quyền, khóa/mở tài khoản",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Phòng Ban",
    description: "Quản lý danh sách phòng ban, trưởng phòng",
    href: "/admin/departments",
    icon: Building2,
  },
  {
    title: "Chức Vụ",
    description: "Quản lý danh sách chức vụ theo phòng ban",
    href: "/admin/positions",
    icon: Briefcase,
  },
  {
    title: "Cài Đặt Hệ Thống",
    description: "Thông tin công ty, thông số lương, ngày công chuẩn",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    title: "Nhật Ký Hệ Thống",
    description: "Xem lịch sử thao tác: duyệt lương, xuất file, thay đổi quyền",
    href: "/admin/audit-logs",
    icon: ScrollText,
  },
]

export default function AdminPage() {
  const router = useRouter()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#1E3A5F" }}>
        Quản Trị Hệ Thống
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {adminSections.map((section) => {
          const Icon = section.icon
          return (
            <Card
              key={section.href}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(section.href)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: "#1E3A5F" }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{section.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{section.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
