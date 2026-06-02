// src/app/(dashboard)/payroll/payments/page.tsx
// Bank Payments Page

import { Metadata } from "next"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Building2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Thanh toán | Lạc Việt HR",
  description: "Xuất file thanh toán lương qua ngân hàng",
}

export default function PayrollPaymentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Thanh toán lương</h1>
          <p className="text-muted-foreground">
            Xuất file chuyển khoản lương qua ngân hàng
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Xuất file
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vietcombank</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">VCB</div>
            <p className="text-xs text-muted-foreground">
              Format CSV chuyển khoản
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Techcombank</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">TCB</div>
            <p className="text-xs text-muted-foreground">
              Format TXT fixed-width
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BIDV</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">BIDV</div>
            <p className="text-xs text-muted-foreground">
              Format CSV Excel
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chung</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CSV</div>
            <p className="text-xs text-muted-foreground">
              Format CSV chung
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử xuất file</CardTitle>
          <CardDescription>
            Danh sách các file thanh toán đã xuất
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Chưa có file nào được xuất
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
