"use client"

import { ReportForm } from "@/components/reports/report-form"
import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function NewReportPage() {
  const router = useRouter()
  const { data: session } = useSession()

  const { data: empData } = useQuery({
    queryKey: ["my-leave-balance"],
    queryFn: async () => {
      const res = await fetch("/api/employees/me")
      if (!res.ok) return null
      return res.json()
    },
    enabled: session?.user?.role === "EMPLOYEE",
  })

  const leaveBalance = empData?.data?.leaveBalance?.remainingDays ?? null

  const isEmployee = session?.user?.role === "EMPLOYEE"

  return (
    <div className="max-w-2xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Quay lại
      </Button>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#1E3A5F" }}>
        {isEmployee ? "Tạo Đơn Mới" : "Tạo Đơn Cho Nhân Viên"}
      </h1>
      <ReportForm leaveBalance={leaveBalance} />
    </div>
  )
}
