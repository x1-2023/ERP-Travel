"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const TYPE_OPTIONS = [
  { value: "PROBATION", label: "HĐ Thử Việc" },
  { value: "DEFINITE_TERM", label: "HĐ Có Thời Hạn" },
  { value: "INDEFINITE_TERM", label: "HĐ Vô Thời Hạn" },
  { value: "INTERN", label: "Thỏa Thuận Thực Tập" },
  { value: "SEASONAL", label: "HĐ Thời Vụ" },
  { value: "PART_TIME", label: "HĐ Bán Thời Gian" },
]

interface ContractFormProps {
  employeeId: string
  onClose: () => void
  onSuccess: () => void
}

export function ContractForm({ employeeId, onClose, onSuccess }: ContractFormProps) {
  const [type, setType] = useState("PROBATION")
  const [contractNo, setContractNo] = useState("")
  const [probationFrom, setProbationFrom] = useState("")
  const [probationTo, setProbationTo] = useState("")
  const [officialFrom, setOfficialFrom] = useState("")
  const [officialTo, setOfficialTo] = useState("")
  const [baseSalary, setBaseSalary] = useState("")
  const [mealAllowance, setMealAllowance] = useState("")
  const [phoneAllowance, setPhoneAllowance] = useState("")
  const [fuelAllowance, setFuelAllowance] = useState("")
  const [perfAllowance, setPerfAllowance] = useState("")
  const [kpiAmount, setKpiAmount] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")

  const createMutation = useMutation({
    mutationFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body: Record<string, any> = { type }
      if (contractNo) body.contractNo = contractNo
      if (type === "PROBATION") {
        if (probationFrom) body.probationFrom = probationFrom
        if (probationTo) body.probationTo = probationTo
      } else {
        if (officialFrom) body.officialFrom = officialFrom
        if (officialTo) body.officialTo = officialTo
      }
      if (baseSalary) body.baseSalary = parseFloat(baseSalary)
      if (mealAllowance) body.mealAllowance = parseFloat(mealAllowance)
      if (phoneAllowance) body.phoneAllowance = parseFloat(phoneAllowance)
      if (fuelAllowance) body.fuelAllowance = parseFloat(fuelAllowance)
      if (perfAllowance) body.perfAllowance = parseFloat(perfAllowance)
      if (kpiAmount) body.kpiAmount = parseFloat(kpiAmount)
      if (notes) body.notes = notes

      const res = await fetch(`/api/employees/${employeeId}/contracts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || JSON.stringify(data.details))
      }
      return res.json()
    },
    onSuccess,
    onError: (err) => setError(err.message),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Tạo Hợp Đồng Mới</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Loại hợp đồng *</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Số hợp đồng (tự sinh nếu bỏ trống)</Label>
            <Input value={contractNo} onChange={(e) => setContractNo(e.target.value)} placeholder="01/2026-HĐTV-RTR" />
          </div>

          {type === "PROBATION" ? (
            <>
              <div className="space-y-2">
                <Label>Ngày bắt đầu thử việc *</Label>
                <Input type="date" value={probationFrom} onChange={(e) => setProbationFrom(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Ngày kết thúc thử việc * (tối đa 60 ngày)</Label>
                <Input type="date" value={probationTo} onChange={(e) => setProbationTo(e.target.value)} />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Ngày bắt đầu *</Label>
                <Input type="date" value={officialFrom} onChange={(e) => setOfficialFrom(e.target.value)} />
              </div>
              {type !== "INDEFINITE_TERM" && (
                <div className="space-y-2">
                  <Label>Ngày kết thúc *</Label>
                  <Input type="date" value={officialTo} onChange={(e) => setOfficialTo(e.target.value)} />
                </div>
              )}
            </>
          )}

          <div className="space-y-2">
            <Label>Lương cơ bản (VNĐ)</Label>
            <Input type="number" value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)} placeholder="15000000" />
          </div>

          <div className="space-y-2">
            <Label>Phụ cấp cơm (VNĐ)</Label>
            <Input type="number" value={mealAllowance} onChange={(e) => setMealAllowance(e.target.value)} placeholder="730000" />
          </div>

          <div className="space-y-2">
            <Label>Phụ cấp ĐT (VNĐ)</Label>
            <Input type="number" value={phoneAllowance} onChange={(e) => setPhoneAllowance(e.target.value)} placeholder="500000" />
          </div>

          <div className="space-y-2">
            <Label>Phụ cấp xăng (VNĐ)</Label>
            <Input type="number" value={fuelAllowance} onChange={(e) => setFuelAllowance(e.target.value)} placeholder="500000" />
          </div>

          <div className="space-y-2">
            <Label>Phụ cấp hiệu suất (VNĐ)</Label>
            <Input type="number" value={perfAllowance} onChange={(e) => setPerfAllowance(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>KPI (VNĐ)</Label>
            <Input type="number" value={kpiAmount} onChange={(e) => setKpiAmount(e.target.value)} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Ghi chú</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ghi chú thêm..." />
          </div>
        </div>

        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button
            style={{ backgroundColor: "#1E3A5F" }}
            disabled={createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            {createMutation.isPending ? "Đang tạo..." : "Tạo Hợp Đồng"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
