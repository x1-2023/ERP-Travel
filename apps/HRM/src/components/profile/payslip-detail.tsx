"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"
interface PayrollItem {
  id: string
  type: string
  amount: number | string
  description: string | null
}

function n(v: number | string): number { return Number(v) }

function formatCurrency(v: number): string {
  return new Intl.NumberFormat("vi-VN").format(v)
}

const ITEM_LABELS: Record<string, string> = {
  KPI_CURRENT: "KPI tháng này",
  KPI_PREV1: "KPI T-1",
  KPI_PREV2: "KPI T-2",
  OT_WEEKDAY: "OT ngày thường",
  OT_WEEKEND: "OT T7/CN",
  OT_HOLIDAY: "OT ngày lễ",
  NIGHT_SHIFT: "Trực đêm",
  BUSINESS_TRIP: "Công tác",
  HAZARD_ALLOWANCE: "Phụ cấp nguy hiểm",
  OTHER_ALLOWANCE: "Phụ cấp khác",
  BONUS: "Thưởng",
}

function Row({ label, value, bold, negative }: { label: string; value: number; bold?: boolean; negative?: boolean }) {
  return (
    <div className={`flex justify-between py-1 ${bold ? "font-semibold" : ""}`}>
      <span className="text-sm">{label}</span>
      <span className={`text-sm ${negative ? "text-red-600" : ""}`}>
        {negative && value > 0 ? "-" : ""}{formatCurrency(Math.abs(value))}
      </span>
    </div>
  )
}

export function PayslipDetail({ periodId, onBack }: { periodId: string; onBack: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ["payslip-detail", periodId],
    queryFn: async () => {
      const res = await fetch(`/api/profile/payslips/${periodId}`)
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  if (isLoading) return <div className="py-8 text-center text-muted-foreground">Đang tải...</div>

  const ps = data?.data
  if (!ps) return <div className="py-8 text-center text-red-500">Không tìm thấy phiếu lương</div>

  const items: PayrollItem[] = ps.items || []
  const additions = items.filter((i) => !["BASE_SALARY", "MEAL_ALLOWANCE", "PHONE_ALLOWANCE", "FUEL_ALLOWANCE", "PERF_ALLOWANCE", "ADVANCE_DEDUCTION"].includes(i.type))

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-1" />
        Danh sách
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-base" style={{ color: "#1E3A5F" }}>
            Phiếu Lương — Tháng {ps.period.month}/{ps.period.year}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lương theo HĐ */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Lương Theo HĐ</p>
            <Row label="Lương cơ bản" value={n(ps.baseSalary)} />
            <Row label="Cơm trưa" value={n(ps.mealAllowance)} />
            <Row label="Điện thoại" value={n(ps.phoneAllowance)} />
            <Row label="Xăng xe" value={n(ps.fuelAllowance)} />
            <Row label="Hiệu quả" value={n(ps.perfAllowance)} />
            <Separator className="my-1" />
            <Row label="Tổng HĐ" value={n(ps.totalContractSalary)} bold />
          </div>

          {/* Ngày công */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Ngày Công</p>
            <Row label={`Thực tế / Chuẩn`} value={n(ps.actualDays)} />
            <Row label="Lương theo ngày công" value={n(ps.totalActualSalary)} bold />
          </div>

          {/* Tăng thêm */}
          {additions.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Tăng Thêm</p>
              {additions.map((item) => (
                <Row
                  key={item.id}
                  label={ITEM_LABELS[item.type] || item.description || item.type}
                  value={n(item.amount)}
                />
              ))}
            </div>
          )}

          <Separator />
          <Row label="TỔNG THU NHẬP" value={n(ps.totalIncome)} bold />

          {/* Khấu trừ */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Khấu Trừ</p>
            <Row label="BHXH (8%)" value={n(ps.bhxhEmployee)} negative />
            <Row label="BHYT (1.5%)" value={n(ps.bhytEmployee)} negative />
            <Row label="BHTN (1%)" value={n(ps.bhtnEmployee)} negative />
            <Row label="Thuế TNCN" value={n(ps.pitAmount)} negative />
            {n(ps.advanceDeduction) > 0 && (
              <Row label="Tạm ứng" value={n(ps.advanceDeduction)} negative />
            )}
          </div>

          <Separator />
          <div className="flex justify-between py-2">
            <span className="text-base font-bold" style={{ color: "#1E3A5F" }}>THỰC LĨNH</span>
            <span className="text-base font-bold" style={{ color: "#1E3A5F" }}>
              {formatCurrency(n(ps.netSalary))}
            </span>
          </div>

          {/* Footer info */}
          <div className="text-xs text-muted-foreground space-y-1 pt-2">
            {ps.bankAccount && <p>Tài khoản nhận: ****{ps.bankAccount.slice(-4)}</p>}
            <p>Giảm trừ bản thân: {formatCurrency(n(ps.personalDeduction))} · NPT: {ps.dependentCount} người ({formatCurrency(n(ps.dependentDeduction))})</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
