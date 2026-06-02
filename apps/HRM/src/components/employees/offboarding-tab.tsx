"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils/format"
import { InitiateOffboardingForm } from "../offboarding/initiate-form"

interface OffboardingTabProps {
  employeeId: string
  employeeStatus: string
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  INITIATED: { label: "Chờ QL duyệt", className: "bg-amber-100 text-amber-700" },
  MANAGER_APPROVED: { label: "Chờ HR duyệt", className: "bg-orange-100 text-orange-700" },
  IN_PROGRESS: { label: "Đang xử lý", className: "bg-blue-100 text-blue-700" },
  COMPLETED: { label: "Hoàn tất", className: "bg-emerald-100 text-emerald-700" },
  CANCELLED: { label: "Đã hủy", className: "bg-red-100 text-red-700" },
}

export function OffboardingTab({ employeeId, employeeStatus }: OffboardingTabProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["offboarding", employeeId],
    queryFn: async () => {
      const res = await fetch(`/api/employees/${employeeId}/offboarding`)
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  const instance = data?.data
  const isHR = ["SUPER_ADMIN", "HR_MANAGER", "HR_STAFF"].includes(session?.user?.role || "")
  const canInitiate = isHR && ["ACTIVE", "PROBATION"].includes(employeeStatus) && !instance

  if (isLoading) {
    return <p className="text-muted-foreground">Đang tải...</p>
  }

  if (!instance && !canInitiate) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Chưa có đơn offboarding
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {canInitiate && !showForm && (
        <Button
          style={{ backgroundColor: "#1E3A5F" }}
          onClick={() => setShowForm(true)}
        >
          Khởi Tạo Offboarding
        </Button>
      )}

      {showForm && (
        <InitiateOffboardingForm
          employeeId={employeeId}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false)
            queryClient.invalidateQueries({ queryKey: ["offboarding", employeeId] })
          }}
        />
      )}

      {instance && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Badge className={STATUS_CONFIG[instance.status]?.className || ""}>
                  {STATUS_CONFIG[instance.status]?.label || instance.status}
                </Badge>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/offboarding/${instance.id}`)}
              >
                Xem chi tiết
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Ngày muốn nghỉ:</span>{" "}
                {formatDate(instance.resignationDate)}
              </div>
              <div>
                <span className="text-muted-foreground">Ngày làm cuối:</span>{" "}
                {formatDate(instance.lastWorkingDate)}
              </div>
              {instance.resignReason && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Lý do:</span>{" "}
                  {instance.resignReason}
                </div>
              )}
              {instance.tasks && instance.tasks.length > 0 && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Tasks:</span>{" "}
                  {instance.tasks.filter((t: { status: string }) => t.status === "DONE" || t.status === "SKIPPED").length}/
                  {instance.tasks.length}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
