"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface InitiateFormProps {
  employeeId: string
  onClose: () => void
  onSuccess: () => void
}

export function InitiateOffboardingForm({ employeeId, onClose, onSuccess }: InitiateFormProps) {
  const [resignationDate, setResignationDate] = useState("")
  const [resignReason, setResignReason] = useState("")
  const [error, setError] = useState("")

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/employees/${employeeId}/offboarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resignationDate,
          resignReason: resignReason || undefined,
          isHROverride: true,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      return res.json()
    },
    onSuccess,
    onError: (err) => setError(err.message),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Khởi Tạo Offboarding</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Ngày muốn nghỉ việc *</Label>
            <Input
              type="date"
              value={resignationDate}
              onChange={(e) => setResignationDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Lý do nghỉ việc</Label>
            <Input
              value={resignReason}
              onChange={(e) => setResignReason(e.target.value)}
              placeholder="Chuyển công tác, lý do cá nhân..."
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button
            style={{ backgroundColor: "#1E3A5F" }}
            disabled={!resignationDate || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Đang tạo..." : "Khởi Tạo"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
