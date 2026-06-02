// src/app/(dashboard)/payroll/calculation/page.tsx
// Payroll Calculation Page

import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Calculator, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Tính lương | Lạc Việt HR",
  description: "Tính lương nhân viên",
}

export default function PayrollCalculationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tính lương</h1>
        <p className="text-muted-foreground">
          Tính lương cho nhân viên theo kỳ lương
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Tính lương theo kỳ
            </CardTitle>
            <CardDescription>
              Chọn kỳ lương và thực hiện tính lương cho tất cả nhân viên
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/payroll/periods">
              <Button className="w-full">
                Đi đến Kỳ lương
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quy trình tính lương</CardTitle>
            <CardDescription>
              Các bước thực hiện tính lương
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                1
              </span>
              <span className="text-sm">Tạo kỳ lương</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                2
              </span>
              <span className="text-sm">Kiểm tra chấm công</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                3
              </span>
              <span className="text-sm">Nhập điều chỉnh (nếu có)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                4
              </span>
              <span className="text-sm">Tính lương</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                5
              </span>
              <span className="text-sm">Kiểm tra và duyệt</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                6
              </span>
              <span className="text-sm">Xuất file thanh toán</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Công thức tính</CardTitle>
            <CardDescription>
              Công thức tính lương VN
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <strong>Gross</strong> = Lương cơ bản + OT + Phụ cấp
            </div>
            <div>
              <strong>BHXH NLĐ</strong> = Lương đóng BH x 10.5%
            </div>
            <div>
              <strong>Thue TNCN</strong> = (Gross - BHXH - Giam tru) x Bac thue
            </div>
            <div>
              <strong>Net</strong> = Gross - BHXH - Thue - Khau tru khac
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
