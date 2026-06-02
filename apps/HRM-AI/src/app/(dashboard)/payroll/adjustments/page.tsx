// src/app/(dashboard)/payroll/adjustments/page.tsx
// Payroll Adjustments Page

import { Metadata } from "next"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export const metadata: Metadata = {
  title: "Điều chỉnh lương | Lạc Việt HR",
  description: "Quản lý điều chỉnh lương",
}

export default function PayrollAdjustmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Điều chỉnh lương</h1>
          <p className="text-muted-foreground">
            Quản lý các khoản điều chỉnh lương (thưởng, khấu trừ, phạt...)
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tạo điều chỉnh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">0</CardTitle>
            <CardDescription>Chờ duyệt</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-green-600">0</CardTitle>
            <CardDescription>Đã duyệt</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-red-600">0</CardTitle>
            <CardDescription>Từ chối</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách điều chỉnh</CardTitle>
          <CardDescription>
            Các khoản điều chỉnh lương trong kỳ hiện tại
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Chưa có điều chỉnh nào
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
