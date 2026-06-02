import { NextRequest, NextResponse } from "next/server"
import { checkContractExpiry } from "@/lib/jobs/contract-expiry"

export async function GET(request: NextRequest) {
  const cronSecret = request.headers.get("x-cron-secret")
  if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await checkContractExpiry()
    return NextResponse.json(result)
  } catch (error) {
    console.error("[Cron] Contract expiry check failed:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
