// src/components/attendance/web-clock.tsx
// Web clock component for check in/out

"use client"

import { useState, useEffect } from "react"
import { Clock, MapPin, Loader2, CheckCircle2, LogIn, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useClockIn, useClockOut, useTodayStatus } from "@/hooks/use-attendance"
import { useToast } from "@/hooks/use-toast"
import { formatTimeToHM } from "@/lib/attendance/time-utils"
import { GEOLOCATION_CONFIG } from "@/constants/attendance"
import type { GeoLocation } from "@/types"

export function WebClock() {
  const { toast } = useToast()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [location, setLocation] = useState<GeoLocation | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  const { data: todayStatus, isLoading: isLoadingStatus, refetch } = useTodayStatus()
  const clockIn = useClockIn()
  const clockOut = useClockOut()

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Get geolocation
  const getLocation = async (): Promise<GeoLocation | null> => {
    if (!navigator.geolocation) {
      setLocationError("Trình duyệt không hỗ trợ định vị")
      return null
    }

    setIsGettingLocation(true)
    setLocationError(null)

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const loc: GeoLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          }

          // Try to get address (reverse geocoding)
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.latitude}&lon=${loc.longitude}&zoom=18&addressdetails=1`
            )
            if (response.ok) {
              const data = await response.json()
              loc.address = data.display_name
            }
          } catch {
            // Ignore reverse geocoding errors
          }

          setLocation(loc)
          setIsGettingLocation(false)
          resolve(loc)
        },
        (error) => {
          let message = "Không thể lấy vị trí"
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = "Bạn đã từ chối quyền truy cập vị trí"
              break
            case error.POSITION_UNAVAILABLE:
              message = "Không có thông tin vị trí"
              break
            case error.TIMEOUT:
              message = "Hết thời gian chờ lấy vị trí"
              break
          }
          setLocationError(message)
          setIsGettingLocation(false)
          resolve(null)
        },
        {
          enableHighAccuracy: GEOLOCATION_CONFIG.HIGH_ACCURACY,
          timeout: GEOLOCATION_CONFIG.TIMEOUT,
          maximumAge: GEOLOCATION_CONFIG.MAX_AGE,
        }
      )
    })
  }

  const handleClockIn = async () => {
    const loc = await getLocation()

    try {
      await clockIn.mutateAsync({
        source: "WEB_CLOCK",
        latitude: loc?.latitude,
        longitude: loc?.longitude,
        address: loc?.address,
      })

      toast({
        title: "Check in thành công",
        description: `Bạn đã check in lúc ${formatTimeToHM(new Date())}`,
      })

      refetch()
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể check in",
        variant: "destructive",
      })
    }
  }

  const handleClockOut = async () => {
    const loc = await getLocation()

    try {
      await clockOut.mutateAsync({
        source: "WEB_CLOCK",
        latitude: loc?.latitude,
        longitude: loc?.longitude,
        address: loc?.address,
      })

      toast({
        title: "Check out thành công",
        description: `Bạn đã check out lúc ${formatTimeToHM(new Date())}`,
      })

      refetch()
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể check out",
        variant: "destructive",
      })
    }
  }

  const isClockingIn = clockIn.isPending || isGettingLocation
  const isClockingOut = clockOut.isPending || isGettingLocation

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Clock className="h-5 w-5" />
          Chấm công
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Time Display */}
        <div className="text-center">
          <div className="text-5xl font-bold tabular-nums">
            {formatTimeToHM(currentTime)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {currentTime.toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Status Display */}
        {isLoadingStatus ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {todayStatus?.hasCheckedIn && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Check in</span>
                </div>
                <span className="font-medium">
                  {todayStatus.attendance?.checkIn
                    ? formatTimeToHM(new Date(todayStatus.attendance.checkIn))
                    : "--:--"}
                </span>
              </div>
            )}

            {todayStatus?.hasCheckedOut && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Check out</span>
                </div>
                <span className="font-medium">
                  {todayStatus.attendance?.checkOut
                    ? formatTimeToHM(new Date(todayStatus.attendance.checkOut))
                    : "--:--"}
                </span>
              </div>
            )}

            {/* Location Info */}
            {location && (
              <div className="flex items-start gap-2 p-3 bg-muted rounded-lg text-sm">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span className="text-muted-foreground truncate">
                  {location.address || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}
                </span>
              </div>
            )}

            {locationError && (
              <div className="text-sm text-destructive text-center">
                {locationError}
              </div>
            )}
          </div>
        )}

        {/* Clock Buttons */}
        <div className="flex gap-3">
          <Button
            className="flex-1"
            onClick={handleClockIn}
            disabled={isClockingIn || todayStatus?.hasCheckedIn}
          >
            {isClockingIn ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="mr-2 h-4 w-4" />
            )}
            Check in
          </Button>

          <Button
            className="flex-1"
            variant="outline"
            onClick={handleClockOut}
            disabled={isClockingOut || !todayStatus?.hasCheckedIn || todayStatus?.hasCheckedOut}
          >
            {isClockingOut ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            Check out
          </Button>
        </div>

        {/* Shift Info */}
        {todayStatus?.shift && (
          <div className="text-center text-sm text-muted-foreground">
            Ca làm việc: {todayStatus.shift.name} ({todayStatus.shift.startTime} - {todayStatus.shift.endTime})
          </div>
        )}
      </CardContent>
    </Card>
  )
}
