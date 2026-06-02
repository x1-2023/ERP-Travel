"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Shield, Receipt, Wallet } from "lucide-react"

const REPORT_GROUPS = [
  {
    title: "Báo Cáo Nhân Sự",
    description: "Headcount, biến động, turnover, phân bổ theo phòng ban",
    href: "/reports-hub/hr",
    icon: Users,
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Bảo Hiểm Xã Hội",
    description: "Mẫu D02-TS, danh sách tham gia BHXH, đăng ký/thôi tham gia",
    href: "/reports-hub/insurance",
    icon: Shield,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Thuế TNCN",
    description: "Mẫu 05/QTT-TNCN, bảng tổng hợp khấu trừ theo tháng/năm",
    href: "/reports-hub/tax",
    icon: Receipt,
    color: "bg-orange-50 text-orange-600",
  },
  {
    title: "Lương Tổng Hợp",
    description: "So sánh các kỳ lương, chi phí nhân sự theo phòng ban",
    href: "/reports-hub/payroll-summary",
    icon: Wallet,
    color: "bg-purple-50 text-purple-600",
  },
]

export default function ReportsHubPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#1E3A5F" }}>
        Báo Cáo Tổng Hợp
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {REPORT_GROUPS.map((group) => (
          <Link key={group.href} href={group.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${group.color}`}>
                    <group.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">{group.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {group.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
