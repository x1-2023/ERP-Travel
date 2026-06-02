"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, X } from "lucide-react"
import { formatDate, formatCurrency as formatCurrencyUtil } from "@/lib/utils/format"

interface Dependent {
  id: string
  fullName: string
  relationship: string
  dateOfBirth: string
  nationalId: string | null
  taxDepCode: string | null
  registeredAt: string | null
  isActive: boolean
  createdAt: string
}

const RELATIONSHIPS = ["Vợ", "Chồng", "Con", "Cha", "Mẹ", "Khác"]

function formatCurrency(n: number): string {
  return formatCurrencyUtil(n)
}

export function DependentTab({ employeeId }: { employeeId: string }) {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: "", relationship: "", dateOfBirth: "",
    nationalId: "", taxDepCode: "", registeredAt: "",
  })
  const [error, setError] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["dependents", employeeId],
    queryFn: async () => {
      const res = await fetch(`/api/employees/${employeeId}/dependents`)
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  const createMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/employees/${employeeId}/dependents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      return res.json()
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["dependents", employeeId] })
      resetForm()
      if (result.warning) alert(result.warning)
    },
    onError: (err: Error) => setError(err.message),
  })

  const updateMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/employees/${employeeId}/dependents/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dependents", employeeId] })
      resetForm()
    },
    onError: (err: Error) => setError(err.message),
  })

  const deleteMut = useMutation({
    mutationFn: async (depId: string) => {
      const res = await fetch(`/api/employees/${employeeId}/dependents/${depId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error((await res.json()).error)
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dependents", employeeId] })
    },
  })

  function resetForm() {
    setShowForm(false)
    setEditingId(null)
    setFormData({ fullName: "", relationship: "", dateOfBirth: "", nationalId: "", taxDepCode: "", registeredAt: "" })
    setError("")
  }

  function startEdit(dep: Dependent) {
    setEditingId(dep.id)
    setFormData({
      fullName: dep.fullName,
      relationship: dep.relationship,
      dateOfBirth: dep.dateOfBirth ? dep.dateOfBirth.split("T")[0] : "",
      nationalId: dep.nationalId || "",
      taxDepCode: dep.taxDepCode || "",
      registeredAt: dep.registeredAt ? dep.registeredAt.split("T")[0] : "",
    })
    setShowForm(true)
    setError("")
  }

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Đang tải...</div>

  const dependents: Dependent[] = data?.data || []
  const activeCount = data?.activeCount || 0
  const deductionAmount = data?.deductionAmount || 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold" style={{ color: "#1E3A5F" }}>
            Người Phụ Thuộc
          </h3>
          <Badge variant="secondary">{activeCount} người · Giảm trừ: {formatCurrency(deductionAmount)}</Badge>
        </div>
        {!showForm && (
          <Button size="sm" style={{ backgroundColor: "#1E3A5F" }} onClick={() => { resetForm(); setShowForm(true) }}>
            <Plus className="h-4 w-4 mr-1" />
            Thêm NPT
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{editingId ? "Cập Nhật NPT" : "Thêm Người Phụ Thuộc"}</CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Họ tên *</Label>
                <Input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
              </div>
              <div>
                <Label>Quan hệ *</Label>
                <Select value={formData.relationship} onValueChange={(v) => setFormData({ ...formData, relationship: v })}>
                  <SelectTrigger><SelectValue placeholder="Chọn..." /></SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIPS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ngày sinh *</Label>
                <Input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} />
              </div>
              <div>
                <Label>CCCD</Label>
                <Input value={formData.nationalId} onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })} />
              </div>
              <div>
                <Label>Mã giảm trừ thuế</Label>
                <Input value={formData.taxDepCode} onChange={(e) => setFormData({ ...formData, taxDepCode: e.target.value })} />
              </div>
              <div>
                <Label>Ngày đăng ký</Label>
                <Input type="date" value={formData.registeredAt} onChange={(e) => setFormData({ ...formData, registeredAt: e.target.value })} />
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={resetForm}>Hủy</Button>
              <Button
                style={{ backgroundColor: "#1E3A5F" }}
                disabled={createMut.isPending || updateMut.isPending}
                onClick={() => editingId ? updateMut.mutate() : createMut.mutate()}
              >
                {(createMut.isPending || updateMut.isPending) ? "..." : editingId ? "Cập nhật" : "Thêm"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List */}
      {dependents.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Chưa có người phụ thuộc nào
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {dependents.map((dep) => (
            <Card key={dep.id} className={!dep.isActive ? "opacity-60" : ""}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{dep.fullName}</span>
                      <Badge variant="outline" className="text-xs">{dep.relationship}</Badge>
                      {!dep.isActive && <Badge variant="destructive" className="text-xs">Đã xóa</Badge>}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>Sinh: {formatDate(dep.dateOfBirth)}</span>
                      {dep.nationalId && <span>CCCD: {dep.nationalId}</span>}
                      {dep.taxDepCode && <span>Mã thuế: {dep.taxDepCode}</span>}
                      {dep.registeredAt && <span>ĐK: {formatDate(dep.registeredAt)}</span>}
                    </div>
                  </div>
                  {dep.isActive && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(dep)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                        disabled={deleteMut.isPending}
                        onClick={() => {
                          if (confirm("Xóa người phụ thuộc này?")) deleteMut.mutate(dep.id)
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
