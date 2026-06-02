"use client"

import { use } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileSpreadsheet, Mail } from "lucide-react"

export default function PayrollExportPage({
  params,
}: {
  params: Promise<{ periodId: string }>
}) {
  const { periodId } = use(params)
  const router = useRouter()

  const { data } = useQuery({
    queryKey: ["payroll-period", periodId],
    queryFn: async () => {
      const res = await fetch(`/api/payroll/${periodId}`)
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  const period = data?.data
  const isApproved = period?.status === "APPROVED" || period?.status === "PAID"

  function handleBankExport() {
    window.open(`/api/payroll/${periodId}/export/bank`, "_blank")
  }

  function handleExcelExport() {
    window.open(`/api/payroll/${periodId}/export/excel`, "_blank")
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/payroll/${periodId}`)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Quay Lại
        </Button>
        <h1 className="text-2xl font-bold" style={{ color: "#1E3A5F" }}>
          Xuất File — Bảng Lương {period ? `${period.month}/${period.year}` : ""}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Xuất Bảng Lương Excel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Pipeline 2 RTR — Bảng lương chi tiết + Chuyển khoản (2 sheets)
            </p>
            <Button
              style={{ backgroundColor: "#1E3A5F" }}
              disabled={!isApproved}
              onClick={handleExcelExport}
              className="w-full"
            >
              {isApproved ? "Tải Excel (.xlsx)" : "Chỉ khả dụng khi đã duyệt"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Xuất Bank Transfer CSV
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Định dạng: STT, Mã NV, Họ Tên, Tên Không Dấu, Số TK, Ngân Hàng, Số Tiền
            </p>
            <Button
              style={{ backgroundColor: "#1E3A5F" }}
              disabled={!isApproved}
              onClick={handleBankExport}
              className="w-full"
            >
              {isApproved ? "Tải CSV" : "Chỉ khả dụng khi đã duyệt"}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Gửi Phiếu Lương Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Gửi email cá nhân cho từng NV. Chỉ khả dụng khi đã duyệt hoặc đã trả.
            </p>
            <Button
              style={{ backgroundColor: "#1E3A5F" }}
              disabled={!isApproved}
              onClick={() => router.push(`/payroll/${periodId}`)}
              className="w-full"
            >
              {isApproved ? "Gửi từ trang Bảng Lương" : "Chỉ khả dụng khi đã duyệt"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
