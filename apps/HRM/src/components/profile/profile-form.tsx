"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface EmployeeData {
  id: string
  employeeCode: string
  fullName: string
  gender: string
  dateOfBirth: string | null
  phone: string | null
  currentAddress: string | null
  permanentAddress: string | null
  personalEmail: string | null
  companyEmail: string | null
  bankAccount: string | null
  bankBranch: string | null
  vehiclePlate: string | null
  nationalId: string | null
  taxCode: string | null
  insuranceCode: string | null
  startDate: string | null
  status: string
  department: { name: string } | null
  position: { name: string } | null
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Đang làm", className: "bg-green-500" },
  PROBATION: { label: "Thử việc", className: "bg-blue-500" },
  RESIGNED: { label: "Đã nghỉ", className: "bg-red-500" },
}

function formatDate(d: string | null): string {
  if (!d) return "—"
  try { return format(new Date(d), "dd/MM/yyyy") } catch { return "—" }
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-1.5">
      <span className="text-sm text-muted-foreground sm:w-36 shrink-0">{label}:</span>
      <span className="text-sm font-medium">{value || "—"}</span>
    </div>
  )
}

export function ProfileForm({ employee }: { employee: EmployeeData }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    phone: employee.phone || "",
    currentAddress: employee.currentAddress || "",
    personalEmail: employee.personalEmail || "",
    bankAccount: employee.bankAccount || "",
    bankBranch: employee.bankBranch || "",
    vehiclePlate: employee.vehiclePlate || "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] })
      setError("")
      setSuccess("Đã lưu thay đổi")
      setTimeout(() => setSuccess(""), 3000)
    },
    onError: (err: Error) => { setError(err.message); setSuccess("") },
  })

  const statusCfg = STATUS_MAP[employee.status] || STATUS_MAP.ACTIVE

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Readonly info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thông Tin (Chỉ Đọc)</CardTitle>
        </CardHeader>
        <CardContent>
          <InfoRow label="Mã NV" value={employee.employeeCode} />
          <InfoRow label="Họ tên" value={employee.fullName} />
          <InfoRow label="Phòng ban" value={employee.department?.name} />
          <InfoRow label="Chức vụ" value={employee.position?.name} />
          <InfoRow label="Ngày vào" value={formatDate(employee.startDate)} />
          <div className="flex items-center gap-2 py-1.5">
            <span className="text-sm text-muted-foreground sm:w-36 shrink-0">Trạng thái:</span>
            <Badge className={statusCfg.className}>{statusCfg.label}</Badge>
          </div>
          <InfoRow label="Email công ty" value={employee.companyEmail} />
          <InfoRow label="CCCD" value={employee.nationalId} />
          <InfoRow label="MST" value={employee.taxCode} />
          <InfoRow label="Mã BH" value={employee.insuranceCode} />
          <InfoRow label="Địa chỉ TT" value={employee.permanentAddress} />
        </CardContent>
      </Card>

      {/* Editable fields */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Có Thể Cập Nhật</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Số điện thoại</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0901234567" />
          </div>
          <div>
            <Label>Địa chỉ hiện tại</Label>
            <Input value={form.currentAddress} onChange={(e) => setForm({ ...form, currentAddress: e.target.value })} />
          </div>
          <div>
            <Label>Email cá nhân</Label>
            <Input type="email" value={form.personalEmail} onChange={(e) => setForm({ ...form, personalEmail: e.target.value })} />
          </div>
          <div>
            <Label>Số tài khoản ngân hàng</Label>
            <Input value={form.bankAccount} onChange={(e) => setForm({ ...form, bankAccount: e.target.value })} />
          </div>
          <div>
            <Label>Chi nhánh ngân hàng</Label>
            <Input value={form.bankBranch} onChange={(e) => setForm({ ...form, bankBranch: e.target.value })} />
          </div>
          <div>
            <Label>Biển số xe</Label>
            <Input value={form.vehiclePlate} onChange={(e) => setForm({ ...form, vehiclePlate: e.target.value })} />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <Button
            style={{ backgroundColor: "#1E3A5F" }}
            className="w-full"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Đang lưu..." : "Lưu Thay Đổi"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
