"use client"

import { useState, useCallback } from "react"

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  loading: boolean
  error: string | null
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    loading: false,
    error: null,
  })

  const requestPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: "Trình duyệt không hỗ trợ GPS" }))
      return Promise.resolve(null)
    }

    setState((s) => ({ ...s, loading: true, error: null }))

    return new Promise<{ latitude: number; longitude: number } | null>(
      (resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const coords = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            }
            setState({ ...coords, loading: false, error: null })
            resolve(coords)
          },
          (err) => {
            let error = "Không lấy được vị trí"
            if (err.code === err.PERMISSION_DENIED) {
              error = "Bạn đã từ chối quyền truy cập GPS"
            } else if (err.code === err.POSITION_UNAVAILABLE) {
              error = "Không xác định được vị trí"
            } else if (err.code === err.TIMEOUT) {
              error = "Quá thời gian lấy vị trí"
            }
            setState((s) => ({ ...s, loading: false, error }))
            resolve(null)
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        )
      }
    )
  }, [])

  return { ...state, requestPosition }
}
