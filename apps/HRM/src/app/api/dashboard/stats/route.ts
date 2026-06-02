import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getDashboardMetrics } from "@/lib/analytics/dashboard"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const metrics = await getDashboardMetrics()
    return NextResponse.json(metrics)
  } catch (error) {
    console.error("[Dashboard] Error fetching metrics:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
