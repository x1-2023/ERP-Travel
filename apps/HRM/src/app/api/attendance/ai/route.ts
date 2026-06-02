import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import {
  detectAnomalies,
  getSmartSyncSuggestions,
  forecastAttendance,
  aiAnalyzeAttendance,
} from "@/lib/ai/attendance-ai"

const ALLOWED_ROLES = ["SUPER_ADMIN", "HR_MANAGER", "HR_STAFF"]

/**
 * GET /api/attendance/ai?action=anomalies|suggestions|forecast|analysis&month=&year=
 */
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id || !ALLOWED_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const action = searchParams.get("action") || "anomalies"
  const month = Number(searchParams.get("month")) || new Date().getMonth() + 1
  const year = Number(searchParams.get("year")) || new Date().getFullYear()

  try {
    switch (action) {
      case "anomalies": {
        const anomalies = await detectAnomalies(month, year)
        return NextResponse.json({ anomalies, month, year })
      }

      case "suggestions": {
        const suggestions = await getSmartSyncSuggestions(month, year)
        return NextResponse.json({ suggestions, month, year })
      }

      case "forecast": {
        // Forecast for next week (from next Monday)
        const today = new Date()
        const nextMonday = new Date(today)
        nextMonday.setDate(today.getDate() + ((8 - today.getDay()) % 7 || 7))
        nextMonday.setUTCHours(0, 0, 0, 0)

        const forecast = await forecastAttendance(nextMonday)
        return NextResponse.json({
          forecast,
          weekStart: nextMonday.toISOString().split("T")[0],
        })
      }

      case "analysis": {
        const anomalies = await detectAnomalies(month, year)
        const suggestions = await getSmartSyncSuggestions(month, year)
        const analysis = await aiAnalyzeAttendance(month, year, anomalies, suggestions)
        return NextResponse.json({
          analysis,
          anomalyCount: anomalies.length,
          suggestionCount: suggestions.length,
          month,
          year,
        })
      }

      default:
        return NextResponse.json({ error: `Action không hợp lệ: ${action}` }, { status: 400 })
    }
  } catch (error) {
    console.error("Attendance AI error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Lỗi xử lý AI" },
      { status: 500 }
    )
  }
}
