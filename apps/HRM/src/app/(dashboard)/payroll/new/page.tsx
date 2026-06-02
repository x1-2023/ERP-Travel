"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"

export default function NewPayrollPage() {
  const router = useRouter()
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, year, notes: notes || undefined }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      return res.json()
    },
    onSuccess: (data) => {
      router.push(`/payroll/${data.data.id}`)
    },
    onError: (err) => setError(err.message),
  })

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/payroll")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Danh Sách
        </Button>
        <h1 className="text-2xl font-bold" style={{ color: "#1E3A5F" }}>
          Tạo Bảng Lương Mới
        </h1>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-base">Chọn kỳ lương</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label>Tháng *</Label>
              <Input
                type="number"
                min={1}
                max={12}
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label>Năm *</Label>
              <Input
                type="number"
                min={2020}
                max={2050}
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value) || 2026)}
              />
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <Label>Ghi chú</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú..."
            />
          </div>

          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

          <Button
            style={{ backgroundColor: "#1E3A5F" }}
            className="w-full"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Đang tạo..." : "Tạo Bảng Lương"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
