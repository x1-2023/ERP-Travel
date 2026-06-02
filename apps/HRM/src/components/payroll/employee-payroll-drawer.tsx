"use client"

import { useState, useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus, Trash2 } from "lucide-react"
import { CurrencyInput } from "@/components/ui/currency-input"

interface EmployeePayrollDrawerProps {
  periodId: string
  epId: string
  periodStatus: string
  onClose: () => void
}

const ITEM_TYPE_LABELS: Record<string, string> = {
  KPI_CURRENT: "KPI tháng này",
  KPI_PREV1: "KPI tháng trước",
  KPI_PREV2: "KPI T-2",
  OT_WEEKDAY: "OT ngày thường (150%)",
  OT_WEEKEND: "OT T7/CN (200%)",
  OT_HOLIDAY: "OT Lễ (300%)",
  NIGHT_SHIFT: "Trực đêm",
  BUSINESS_TRIP: "Công tác",
  HAZARD_ALLOWANCE: "Phụ cấp độc hại",
  OTHER_ALLOWANCE: "Phụ cấp khác",
  ADVANCE_DEDUCTION: "Trừ tạm ứng",
  BONUS: "Thưởng",
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(Math.round(n)) + "đ"
}

export function EmployeePayrollDrawer({ periodId, epId, periodStatus, onClose }: EmployeePayrollDrawerProps) {
  const queryClient = useQueryClient()
  const isDraft = periodStatus === "DRAFT"

  const { data, isLoading } = useQuery({
    queryKey: ["employee-payroll", epId],
    queryFn: async () => {
      const res = await fetch(`/api/payroll/${periodId}/employees/${epId}`)
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  const ep = data?.data
  const [formReady, setFormReady] = useState(false)
  const [actualDays, setActualDays] = useState<number>(0)
  const [standardDays, setStandardDays] = useState<number>(0)
  const [advanceDeduction, setAdvanceDeduction] = useState<number>(0)
  const [notes, setNotes] = useState("")
  const [newItemType, setNewItemType] = useState("KPI_CURRENT")
  const [newItemAmount, setNewItemAmount] = useState("")
  const [newItemDesc, setNewItemDesc] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (ep) {
      setActualDays(Number(ep.actualDays))
      setStandardDays(Number(ep.standardDays))
      setAdvanceDeduction(Number(ep.advanceDeduction))
      setNotes(ep.notes || "")
      setFormReady(true)
    }
  }, [ep])

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/payroll/${periodId}/employees/${epId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actualDays, standardDays, advanceDeduction, notes }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-payroll", epId] })
      queryClient.invalidateQueries({ queryKey: ["payroll-employees", periodId] })
      setError("")
    },
    onError: (err) => setError(err.message),
  })

  const addItemMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/payroll/${periodId}/employees/${epId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: newItemType,
          amount: parseFloat(newItemAmount),
          description: newItemDesc || undefined,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error)
      }
      return res.json()
    },
    onSuccess: () => {
      setNewItemAmount("")
      setNewItemDesc("")
      queryClient.invalidateQueries({ queryKey: ["employee-payroll", epId] })
    },
  })

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch(
        `/api/payroll/${periodId}/employees/${epId}/items?itemId=${itemId}`,
        { method: "DELETE" }
      )
      if (!res.ok) throw new Error("Failed")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-payroll", epId] })
    },
  })

  if (isLoading || !ep) {
    return (
      <div className="fixed inset-0 z-50 bg-black/30 flex justify-end">
        <div className="w-full max-w-lg bg-white h-full p-4 sm:p-6">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex justify-end">
      <div className="w-full max-w-lg bg-white h-full overflow-y-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: "#1E3A5F" }}>
            {ep.employee.fullName} ({ep.employee.employeeCode})
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {ep.employee.status === "PROBATION" && (
          <Badge className="bg-blue-100 text-blue-700 mb-3">Thử việc — không đóng BH</Badge>
        )}

        {/* Công */}
        <Card className="mb-3">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-sm">Thông tin công</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Công thực tế</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={actualDays}
                  onChange={(e) => setActualDays(parseFloat(e.target.value) || 0)}
                  disabled={!isDraft}
                />
              </div>
              <div>
                <Label className="text-xs">Công chuẩn</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={standardDays}
                  onChange={(e) => setStandardDays(parseFloat(e.target.value) || 0)}
                  disabled={!isDraft}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lương theo HĐ (readonly) */}
        <Card className="mb-3">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-sm">Lương theo HĐ</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lương cơ bản</span>
              <span>{formatCurrency(Number(ep.baseSalary))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cơm trưa</span>
              <span>{formatCurrency(Number(ep.mealAllowance))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Điện thoại</span>
              <span>{formatCurrency(Number(ep.phoneAllowance))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Xăng xe</span>
              <span>{formatCurrency(Number(ep.fuelAllowance))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hiệu quả</span>
              <span>{formatCurrency(Number(ep.perfAllowance))}</span>
            </div>
            <div className="flex justify-between font-medium border-t pt-1">
              <span>Tổng HĐ</span>
              <span>{formatCurrency(Number(ep.totalContractSalary))}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Thực tế ({Number(ep.actualDays)}/{Number(ep.standardDays)})</span>
              <span>{formatCurrency(Number(ep.totalActualSalary))}</span>
            </div>
          </CardContent>
        </Card>

        {/* Tăng thêm (PayrollItems) */}
        <Card className="mb-3">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-sm">Tăng thêm</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            {ep.items && ep.items.length > 0 ? (
              <div className="space-y-1 mb-3 text-sm">
                {ep.items.map((item: { id: string; type: string; amount: string; description: string | null }) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <span>
                      {ITEM_TYPE_LABELS[item.type] || item.type}
                      {item.description && <span className="text-muted-foreground"> — {item.description}</span>}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>{formatCurrency(Number(item.amount))}</span>
                      {isDraft && (
                        <button
                          className="text-red-400 hover:text-red-600"
                          onClick={() => deleteItemMutation.mutate(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mb-3">Chưa có khoản tăng thêm</p>
            )}

            {isDraft && (
              <div className="border-t pt-2 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Select value={newItemType} onValueChange={setNewItemType}>
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ITEM_TYPE_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <CurrencyInput
                    value={parseFloat(newItemAmount) || 0}
                    onChange={(v) => setNewItemAmount(v > 0 ? String(v) : "")}
                    placeholder="Số tiền"
                    className="text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Mô tả"
                    value={newItemDesc}
                    onChange={(e) => setNewItemDesc(e.target.value)}
                    className="text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!newItemAmount || addItemMutation.isPending}
                    onClick={() => addItemMutation.mutate()}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Giảm trừ */}
        {isDraft && (
          <Card className="mb-3">
            <CardHeader className="py-2 px-4">
              <CardTitle className="text-sm">Giảm trừ</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div>
                <Label className="text-xs">Tạm ứng</Label>
                <CurrencyInput
                  value={advanceDeduction}
                  onChange={setAdvanceDeduction}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Kết quả tính toán */}
        <Card className="mb-3">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-sm">Kết quả tính toán</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tổng thu nhập</span>
              <span>{formatCurrency(Number(ep.totalIncome))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">BH NLĐ (10.5%)</span>
              <span>-{formatCurrency(Number(ep.totalEmployeeIns))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Giảm trừ cá nhân</span>
              <span>-{formatCurrency(Number(ep.personalDeduction))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Giảm trừ NPT ({ep.dependentCount})</span>
              <span>-{formatCurrency(Number(ep.dependentDeduction))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Thu nhập chịu thuế</span>
              <span>{formatCurrency(Number(ep.taxableIncome))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Thuế TNCN</span>
              <span>-{formatCurrency(Number(ep.pitAmount))}</span>
            </div>
            {Number(ep.advanceDeduction) > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tạm ứng</span>
                <span>-{formatCurrency(Number(ep.advanceDeduction))}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base border-t pt-2" style={{ color: "#1E3A5F" }}>
              <span>THỰC LĨNH</span>
              <span>{formatCurrency(Number(ep.netSalary))}</span>
            </div>
          </CardContent>
        </Card>

        {/* Ghi chú */}
        {isDraft && (
          <div className="mb-4">
            <Label className="text-xs">Ghi chú</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú..."
            />
          </div>
        )}

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        {isDraft && (
          <Button
            style={{ backgroundColor: "#1E3A5F" }}
            className="w-full"
            disabled={updateMutation.isPending || !formReady}
            onClick={() => updateMutation.mutate()}
          >
            {updateMutation.isPending ? "Đang lưu..." : "Lưu & Tính Lại"}
          </Button>
        )}
      </div>
    </div>
  )
}
