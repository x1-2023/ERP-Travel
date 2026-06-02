"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ChangePasswordForm() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      return res.json()
    },
    onSuccess: (data) => {
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setError("")
      setSuccess(data.message)
      setTimeout(() => setSuccess(""), 5000)
    },
    onError: (err: Error) => { setError(err.message); setSuccess("") },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Đổi Mật Khẩu</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label>Mật khẩu hiện tại</Label>
            <Input type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
          </div>
          <div>
            <Label>Mật khẩu mới</Label>
            <Input type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} placeholder="Min 8 ký tự, có HOA + số" />
          </div>
          <div>
            <Label>Xác nhận</Label>
            <Input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
          </div>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}
        <Button
          variant="outline"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? "..." : "Đổi Mật Khẩu"}
        </Button>
      </CardContent>
    </Card>
  )
}
