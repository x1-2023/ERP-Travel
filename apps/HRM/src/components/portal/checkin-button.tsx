"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, MapPinOff } from "lucide-react"
import { useGeolocation } from "@/lib/hooks/use-geolocation"

interface AttendanceRecord {
  id: string
  date: string
  checkInAt: string | null
  checkOutAt: string | null
  status: string
  workHours: number | string | null
}

function fmtTime(iso: string | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  })
}

function fmtHours(h: number | string | null): string {
  if (h == null) return ""
  const n = Number(h)
  const hrs = Math.floor(n)
  const mins = Math.round((n - hrs) * 60)
  return `${hrs}h ${mins}p`
}

const STATUS_LABELS: Record<string, string> = {
  PRESENT: "Đúng giờ",
  LATE: "Đi trễ",
  HALF_DAY: "Nửa ngày",
}

export function CheckinButton() {
  const queryClient = useQueryClient()
  const { latitude, longitude, loading: gpsLoading, error: gpsError, requestPosition } = useGeolocation()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["today-checkin"],
    queryFn: async () => {
      const res = await fetch("/api/attendance/checkin")
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
    refetchInterval: 60000,
  })

  const record: AttendanceRecord | null = data?.data || null
  const hasCheckedIn = !!record?.checkInAt
  const hasCheckedOut = !!record?.checkOutAt
  const isComplete = hasCheckedIn && hasCheckedOut

  async function handleCheckin(action: "checkin" | "checkout") {
    setError("")
    setSubmitting(true)

    try {
      // Get GPS position
      const coords = await requestPosition()

      const res = await fetch("/api/attendance/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          latitude: coords?.latitude,
          longitude: coords?.longitude,
        }),
      })

      const result = await res.json()
      if (!res.ok) {
        setError(result.error || "Lỗi chấm công")
        return
      }

      queryClient.invalidateQueries({ queryKey: ["today-checkin"] })
      queryClient.invalidateQueries({ queryKey: ["my-attendance"] })
    } catch {
      setError("Lỗi kết nối")
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Đang tải...
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Today status card */}
      <Card>
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground mb-1">Hôm nay</p>
          {!hasCheckedIn ? (
            <p className="text-base font-medium">Chưa chấm công</p>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm">Check-in: <strong>{fmtTime(record!.checkInAt)}</strong></span>
                {record!.status && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    record!.status === "LATE"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-green-100 text-green-700"
                  }`}>
                    {STATUS_LABELS[record!.status] || record!.status}
                  </span>
                )}
              </div>
              {hasCheckedOut && (
                <p className="text-sm">
                  Check-out: <strong>{fmtTime(record!.checkOutAt)}</strong>
                  {record!.workHours != null && (
                    <span className="text-muted-foreground"> ({fmtHours(record!.workHours)})</span>
                  )}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Check-in/out button */}
      {!isComplete && (
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => handleCheckin(hasCheckedIn ? "checkout" : "checkin")}
            disabled={submitting || gpsLoading}
            className={`w-36 h-36 rounded-full text-white text-lg font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 ${
              hasCheckedIn
                ? "bg-red-500 hover:bg-red-600"
                : "bg-emerald-500 hover:bg-emerald-600"
            }`}
          >
            {submitting || gpsLoading
              ? "Đang xử lý..."
              : hasCheckedIn
                ? "CHECK OUT"
                : "CHECK IN"}
          </button>

          {/* GPS indicator */}
          <div className="flex items-center gap-1.5 text-xs">
            {gpsError ? (
              <>
                <MapPinOff className="h-3.5 w-3.5 text-red-500" />
                <span className="text-red-500">{gpsError}</span>
              </>
            ) : latitude != null && longitude != null ? (
              <>
                <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-600">GPS sẵn sàng</span>
              </>
            ) : (
              <>
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">GPS sẽ được lấy khi chấm công</span>
              </>
            )}
          </div>
        </div>
      )}

      {isComplete && (
        <div className="text-center py-4">
          <p className="text-emerald-600 font-medium">Đã hoàn tất chấm công hôm nay</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded text-center">
          {error}
        </div>
      )}
    </div>
  )
}
