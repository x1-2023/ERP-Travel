"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save } from "lucide-react"
import { useRouter } from "next/navigation"

const SETTING_GROUPS = [
  {
    title: "Thông Tin Công Ty",
    keys: [
      { key: "companyName", label: "Tên công ty" },
      { key: "companyTaxCode", label: "Mã số thuế" },
      { key: "companyAddress", label: "Địa chỉ" },
      { key: "companyPhone", label: "Số điện thoại" },
      { key: "companyEmail", label: "Email" },
    ],
  },
  {
    title: "Thông Số Lương",
    keys: [
      { key: "standardWorkDays", label: "Ngày công chuẩn/tháng" },
      { key: "mealAllowanceCap", label: "Trần phụ cấp ăn (đ)" },
      { key: "personalDeduction", label: "Giảm trừ bản thân (đ)" },
      { key: "dependentDeduction", label: "Giảm trừ NPT/người (đ)" },
    ],
  },
  {
    title: "Bảo Hiểm & Thuế",
    keys: [
      { key: "companyInsuranceCode", label: "Mã đơn vị BHXH" },
      { key: "companyTaxAgency", label: "Chi cục thuế quản lý" },
      { key: "defaultHospital", label: "Nơi KCB ban đầu mặc định" },
    ],
  },
]

export default function AdminSettingsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [values, setValues] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/settings")
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  useEffect(() => {
    if (data?.map) {
      setValues(data.map)
    }
  }, [data])

  const saveMut = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: values }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    },
  })

  if (isLoading) return <div className="py-8 text-center text-muted-foreground">Đang tải...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin")}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Quản Trị
          </Button>
          <h1 className="text-2xl font-bold" style={{ color: "#1E3A5F" }}>Cài Đặt Hệ Thống</h1>
        </div>
        <Button
          style={{ backgroundColor: "#1E3A5F" }}
          disabled={saveMut.isPending}
          onClick={() => saveMut.mutate()}
        >
          <Save className="h-4 w-4 mr-1" />
          {saveMut.isPending ? "Đang lưu..." : saved ? "Đã lưu!" : "Lưu thay đổi"}
        </Button>
      </div>

      <div className="space-y-6">
        {SETTING_GROUPS.map((group) => (
          <Card key={group.title}>
            <CardHeader>
              <CardTitle className="text-base">{group.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {group.keys.map(({ key, label }) => (
                  <div key={key}>
                    <Label className="text-sm">{label}</Label>
                    <Input
                      value={values[key] || ""}
                      onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
