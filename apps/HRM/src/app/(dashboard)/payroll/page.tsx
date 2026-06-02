"use client"

import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Wallet } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { formatCurrency } from "@/lib/utils/format"

interface PayrollPeriodItem {
  id: string
  month: number
  year: number
  status: string
  employeeCount: number
  totalNet: number
  totalCost: number
  paidAt: string | null
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Nháp", className: "bg-gray-100 text-gray-700" },
  SUBMITTED: { label: "Chờ duyệt", className: "bg-amber-100 text-amber-700" },
  APPROVED: { label: "Đã duyệt", className: "bg-emerald-100 text-emerald-700" },
  PAID: { label: "Đã trả", className: "bg-blue-100 text-blue-700" },
  CANCELLED: { label: "Đã hủy", className: "bg-red-100 text-red-700" },
}

export default function PayrollPage() {
  const router = useRouter()

  const { data, isLoading } = useQuery({
    queryKey: ["payroll-periods"],
    queryFn: async () => {
      const res = await fetch("/api/payroll")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  const periods: PayrollPeriodItem[] = data?.data || []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#1E3A5F" }}>
          Bảng Lương
        </h1>
        <Button
          style={{ backgroundColor: "#1E3A5F" }}
          onClick={() => router.push("/payroll/new")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Tạo Bảng Lương
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Đang tải...</p>
      ) : periods.length === 0 ? (
        <EmptyState
          icon={<Wallet className="h-10 w-10" />}
          title="Chưa có bảng lương nào"
          description="Tạo bảng lương tháng đầu tiên để bắt đầu."
          action={{ label: "+ Tạo bảng lương tháng này", href: "/payroll/new" }}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Danh sách bảng lương</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-background">
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Tháng/Năm</th>
                    <th className="text-center py-2 px-3">Nhân viên</th>
                    <th className="text-center py-2 px-3">Trạng thái</th>
                    <th className="text-right py-2 px-3">Tổng chi</th>
                    <th className="text-right py-2 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {periods.map((p) => {
                    const sc = STATUS_CONFIG[p.status] || STATUS_CONFIG.DRAFT
                    return (
                      <tr key={p.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-3 font-medium">
                          {String(p.month).padStart(2, "0")}/{p.year}
                        </td>
                        <td className="py-3 px-3 text-center">{p.employeeCount} NV</td>
                        <td className="py-3 px-3 text-center">
                          <Badge className={sc.className}>{sc.label}</Badge>
                          {p.status === "PAID" && p.paidAt && (
                            <span className="block text-xs text-muted-foreground mt-0.5">
                              {new Date(p.paidAt).toLocaleDateString("vi-VN")}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {p.totalCost > 0 ? formatCurrency(p.totalCost) : "—"}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/payroll/${p.id}`)}
                          >
                            Xem
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
