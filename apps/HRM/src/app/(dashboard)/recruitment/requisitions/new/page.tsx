"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewRequisitionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [positionId, setPositionId] = useState("")
  const [contractType, setContractType] = useState("PROBATION")

  const { data: depts } = useQuery<{ data: { id: string; name: string }[] }>({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await fetch("/api/departments")
      return res.json()
    },
  })

  const { data: positions } = useQuery<{ data: { id: string; name: string }[] }>({
    queryKey: ["positions"],
    queryFn: async () => {
      const res = await fetch("/api/positions")
      return res.json()
    },
  })

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const fd = new FormData(e.currentTarget)
    const body = {
      title: fd.get("title"),
      departmentId,
      positionId,
      headcount: parseInt(fd.get("headcount") as string) || 1,
      contractType,
      salaryFrom: fd.get("salaryFrom") ? parseFloat(fd.get("salaryFrom") as string) : null,
      salaryTo: fd.get("salaryTo") ? parseFloat(fd.get("salaryTo") as string) : null,
      description: fd.get("description") || null,
      requirements: fd.get("requirements") || null,
    }

    const res = await fetch("/api/recruitment/requisitions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Có lỗi xảy ra")
      return
    }

    const jr = await res.json()
    router.push(`/recruitment/requisitions/${jr.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/recruitment">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold">Tạo yêu cầu tuyển dụng</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Thông tin tuyển dụng</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input id="title" name="title" required placeholder="VD: Tuyển kỹ sư phần mềm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phòng ban *</Label>
                <Select value={departmentId} onValueChange={setDepartmentId}>
                  <SelectTrigger><SelectValue placeholder="Chọn phòng ban" /></SelectTrigger>
                  <SelectContent>
                    {depts?.data?.map((d) => (<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Vị trí *</Label>
                <Select value={positionId} onValueChange={setPositionId}>
                  <SelectTrigger><SelectValue placeholder="Chọn vị trí" /></SelectTrigger>
                  <SelectContent>
                    {positions?.data?.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="headcount">Số lượng</Label>
                <Input id="headcount" name="headcount" type="number" min="1" defaultValue="1" />
              </div>
              <div className="space-y-2">
                <Label>Loại HĐ *</Label>
                <Select value={contractType} onValueChange={setContractType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PROBATION">Thử việc</SelectItem>
                    <SelectItem value="DEFINITE_TERM">Có thời hạn</SelectItem>
                    <SelectItem value="INDEFINITE_TERM">Không thời hạn</SelectItem>
                    <SelectItem value="PART_TIME">Part-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salaryFrom">Lương từ (VNĐ)</Label>
                <Input id="salaryFrom" name="salaryFrom" type="number" placeholder="10000000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryTo">Lương đến (VNĐ)</Label>
                <Input id="salaryTo" name="salaryTo" type="number" placeholder="20000000" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả công việc</Label>
              <Textarea id="description" name="description" rows={3} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Yêu cầu ứng viên</Label>
              <Textarea id="requirements" name="requirements" rows={3} />
            </div>

            {error && <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</div>}

            <Button type="submit" disabled={loading} className="w-full" style={{ backgroundColor: "#1E3A5F" }}>
              {loading ? "Đang tạo..." : "Tạo yêu cầu tuyển dụng"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
