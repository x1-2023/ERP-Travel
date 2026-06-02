"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { ReportForm } from "@/components/reports/report-form"

export default function PortalNewReportPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preType = searchParams.get("type") || undefined

  const { data: profileData } = useQuery({
    queryKey: ["portal-profile"],
    queryFn: async () => {
      const res = await fetch("/api/employees/me")
      if (!res.ok) return null
      return res.json()
    },
  })

  const leaveBalance = profileData?.data?.leaveBalance?.remainingDays ?? null

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <Button
        variant="ghost"
        size="sm"
        className="gap-1 -ml-2"
        onClick={() => router.push("/portal/reports")}
      >
        <ChevronLeft className="h-4 w-4" />
        Đơn Từ
      </Button>

      <ReportForm leaveBalance={leaveBalance} defaultType={preType} />
    </div>
  )
}
