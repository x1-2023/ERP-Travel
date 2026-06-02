"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle } from "lucide-react"

/* eslint-disable @next/next/no-img-element */

interface JRInfo {
  id: string
  title: string
  status: string
  department: { name: string }
  position: { name: string }
  description: string | null
  requirements: string | null
}

export default function PublicApplyPage() {
  const { requisitionId } = useParams<{ requisitionId: string }>()
  const [jr, setJR] = useState<JRInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [closed, setClosed] = useState(false)

  useEffect(() => {
    fetch(`/api/recruitment/requisitions/${requisitionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error || !data.id) {
          setClosed(true)
        } else if (data.status !== "OPEN") {
          setClosed(true)
          setJR(data)
        } else {
          setJR(data)
        }
        setLoading(false)
      })
      .catch(() => {
        setClosed(true)
        setLoading(false)
      })
  }, [requisitionId])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    const fd = new FormData(e.currentTarget)
    const body = {
      requisitionId,
      fullName: fd.get("fullName"),
      email: fd.get("email"),
      phone: fd.get("phone"),
      dateOfBirth: fd.get("dateOfBirth") || null,
      currentAddress: fd.get("currentAddress") || null,
      school: fd.get("school") || null,
      major: fd.get("major") || null,
      expectedSalary: fd.get("expectedSalary") ? parseFloat(fd.get("expectedSalary") as string) : null,
      coverLetter: fd.get("coverLetter") || null,
      source: fd.get("source") || null,
    }

    const res = await fetch("/api/recruitment/public/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    setSubmitting(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Có lỗi xảy ra")
      return
    }

    setSuccess(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-8 w-8 border-4 border-slate-300 border-t-slate-600 rounded-full" />
      </div>
    )
  }

  if (closed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Vị trí đã đóng tuyển</h2>
            <p className="text-slate-500 text-sm">Vị trí này không còn nhận hồ sơ. Cảm ơn bạn đã quan tâm!</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Ứng tuyển thành công!</h2>
            <p className="text-slate-500 text-sm">Cảm ơn bạn đã ứng tuyển. Chúng tôi sẽ liên hệ với bạn sớm nhất.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex h-10 w-10 rounded-lg items-center justify-center text-white font-bold text-sm mb-3" style={{ backgroundColor: "#1E3A5F" }}>
            <img src="/logo-vierp-dark.png" alt="RTR" width={28} height={28} />
          </div>
          <h1 className="text-2xl font-bold">{jr?.title}</h1>
          <p className="text-slate-500 text-sm mt-1">
            {jr?.department.name} &middot; {jr?.position.name}
          </p>
        </div>

        {/* Job description */}
        {(jr?.description || jr?.requirements) && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              {jr?.description && (
                <div>
                  <h3 className="text-sm font-semibold mb-1">Mô tả công việc</h3>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{jr.description}</p>
                </div>
              )}
              {jr?.requirements && (
                <div>
                  <h3 className="text-sm font-semibold mb-1">Yêu cầu</h3>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{jr.requirements}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Apply form */}
        <Card>
          <CardHeader><CardTitle>Ứng tuyển ngay</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Họ và Tên *</Label>
                <Input name="fullName" required placeholder="Nguyễn Văn A" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input name="email" type="email" required placeholder="email@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Số điện thoại *</Label>
                  <Input name="phone" required placeholder="0901234567" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ngày sinh</Label>
                  <Input name="dateOfBirth" type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Mức lương kỳ vọng (VNĐ)</Label>
                  <Input name="expectedSalary" type="number" placeholder="15000000" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Địa chỉ hiện tại</Label>
                <Input name="currentAddress" placeholder="TP. HCM" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Trường học</Label>
                  <Input name="school" placeholder="Đại học Bách Khoa" />
                </div>
                <div className="space-y-2">
                  <Label>Ngành học</Label>
                  <Input name="major" placeholder="Khoa học máy tính" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nguồn biết đến</Label>
                <select name="source" className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
                  <option value="">Chọn nguồn</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Referral">Giới thiệu</option>
                  <option value="Website">Website</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Thư xin việc</Label>
                <textarea name="coverLetter" rows={4} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  placeholder="Giới thiệu ngắn về bản thân và lý do ứng tuyển..." />
              </div>

              {error && <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</div>}

              <Button type="submit" disabled={submitting} className="w-full" style={{ backgroundColor: "#1E3A5F" }}>
                {submitting ? "Đang gửi..." : "Gửi hồ sơ ứng tuyển"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} VietERP Vietnam
        </p>
      </div>
    </div>
  )
}
