"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getTypeConfig } from "./report-card"
import { REPORT_TYPE_LABELS } from "@/lib/constants/labels"

const REPORT_TYPES = [
  "BUSINESS_TRIP",
  "OVERTIME",
  "LEAVE_PAID",
  "LEAVE_UNPAID",
  "LEAVE_MATERNITY",
  "LEAVE_SICK",
  "LEAVE_WEDDING",
  "NOTE",
].map((value) => ({ value, label: REPORT_TYPE_LABELS[value] || value }))

const OT_TYPES = [
  { value: "WEEKDAY", label: "Ngày thường" },
  { value: "WEEKEND", label: "Cuối tuần" },
  { value: "HOLIDAY", label: "Ngày lễ" },
  { value: "NIGHT_SHIFT", label: "Ca đêm" },
]

interface ReportFormProps {
  leaveBalance?: number | null
  defaultType?: string
}

export function ReportForm({ leaveBalance, defaultType }: ReportFormProps) {
  const router = useRouter()
  const [type, setType] = useState(defaultType || "")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [notes, setNotes] = useState("")
  const [otType, setOtType] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const tc = type ? getTypeConfig(type) : null

  async function handleSubmit(action: "save" | "submit") {
    setError("")
    const effectiveEnd = type === "OVERTIME" ? startDate : endDate
    if (!type || !startDate || !effectiveEnd) {
      setError("Vui lòng chọn loại đơn và ngày bắt đầu/kết thúc")
      return
    }
    if (new Date(effectiveEnd) < new Date(startDate)) {
      setError("Ngày kết thúc không được trước ngày bắt đầu")
      return
    }
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    if (new Date(startDate) < thirtyDaysAgo) {
      setError("Ngày bắt đầu không được quá 30 ngày trong quá khứ")
      return
    }
    if (type === "OVERTIME" && (!otType || !startTime || !endTime)) {
      setError("Vui lòng điền đầy đủ thông tin tăng ca")
      return
    }

    setSubmitting(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: Record<string, any> = {}
      if (type === "OVERTIME") {
        payload.otType = otType
        payload.startTime = startTime
        payload.endTime = endTime
      }

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          startDate,
          endDate: type === "OVERTIME" ? startDate : endDate,
          notes: notes || undefined,
          payload,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Lỗi tạo đơn")
        return
      }

      const reportId = data.data.id

      if (action === "submit") {
        const submitRes = await fetch(`/api/reports/${reportId}/submit`, {
          method: "POST",
        })
        if (!submitRes.ok) {
          const sd = await submitRes.json()
          setError(sd.error || "Tạo thành công nhưng lỗi khi nộp")
          router.push(`/reports/${reportId}`)
          return
        }
      }

      router.push(`/reports/${reportId}`)
    } catch {
      setError("Lỗi kết nối")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Thông Tin Đơn</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded">
            {error}
          </div>
        )}

        <div>
          <Label>Loại đơn</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Chọn loại đơn" />
            </SelectTrigger>
            <SelectContent>
              {REPORT_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {type === "LEAVE_PAID" && leaveBalance != null && (
          <div className="bg-blue-50 text-blue-700 text-sm px-3 py-2 rounded">
            Số ngày phép còn lại: <strong>{leaveBalance}</strong> ngày
          </div>
        )}

        <div className={type === "OVERTIME" ? "" : "grid grid-cols-2 gap-4"}>
          <div>
            <Label>{type === "OVERTIME" ? "Ngày tăng ca" : "Ngày bắt đầu"}</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1"
            />
          </div>
          {type !== "OVERTIME" && (
            <div>
              <Label>Ngày kết thúc</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1"
              />
            </div>
          )}
        </div>

        {type === "OVERTIME" && (
          <>
            <div>
              <Label>Loại tăng ca</Label>
              <Select value={otType} onValueChange={setOtType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Chọn loại tăng ca" />
                </SelectTrigger>
                <SelectContent>
                  {OT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Giờ bắt đầu</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Giờ kết thúc</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </>
        )}

        {tc && (
          <div className="text-xs text-muted-foreground">
            {type === "BUSINESS_TRIP" && "Số đêm sẽ được tính tự động = endDate - startDate"}
            {type === "OVERTIME" && "Số giờ OT tối đa 4h/ngày theo Luật Lao Động VN"}
            {type.startsWith("LEAVE_") && "Số ngày nghỉ sẽ được tính tự động"}
            {type === "NOTE" && "Ghi chú chung — mô tả chi tiết trong phần ghi chú bên dưới"}
          </div>
        )}

        <div>
          <Label>Ghi chú</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Lý do, chi tiết..."
            className="mt-1"
            rows={3}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit("save")}
            disabled={submitting}
          >
            {submitting ? "Đang xử lý..." : "Lưu nháp"}
          </Button>
          <Button
            style={{ backgroundColor: "#1E3A5F" }}
            onClick={() => handleSubmit("submit")}
            disabled={submitting}
          >
            {submitting ? "Đang gửi..." : "Tạo & Nộp đơn"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
