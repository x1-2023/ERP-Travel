"use client"

import { use } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Ban } from "lucide-react"
import { OffboardingApproval } from "@/components/offboarding/offboarding-approval"
import { OffboardingChecklist } from "@/components/offboarding/offboarding-checklist"
import { CancelOffboardingModal } from "@/components/offboarding/cancel-offboarding-modal"

interface OffboardingDetailData {
  id: string
  employeeId: string
  status: string
  resignationDate: string
  lastWorkingDate: string | null
  resignReason: string | null
  resignDecisionNo: string | null
  initiatedBy: string
  managerApprovedBy: string | null
  managerApprovedAt: string | null
  hrApprovedBy: string | null
  hrApprovedAt: string | null
  completedAt: string | null
  notes: string | null
  createdAt: string
  employee: {
    fullName: string
    employeeCode: string
    status: string
  }
  tasks: Array<{
    id: string
    taskKey: string
    title: string
    description: string | null
    assignedRole: string
    status: string
    dueDate: string | null
    doneAt: string | null
    doneBy: string | null
    note: string | null
  }>
}

export default function OffboardingDetailPage({
  params,
}: {
  params: Promise<{ instanceId: string }>
}) {
  const { instanceId } = use(params)
  const router = useRouter()
  const { data: session } = useSession()
  const [showCancelModal, setShowCancelModal] = useState(false)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["offboarding-detail", instanceId],
    queryFn: async () => {
      const res = await fetch(`/api/offboarding?status=`)
      if (!res.ok) throw new Error("Failed")
      const list = await res.json()
      const item = list.data?.find((i: { id: string }) => i.id === instanceId)
      if (item) {
        // Fetch full detail via employee offboarding endpoint
        const detailRes = await fetch(`/api/employees/${item.employeeId}/offboarding`)
        if (!detailRes.ok) throw new Error("Failed")
        return detailRes.json()
      }
      return null
    },
  })

  const instance: OffboardingDetailData | null = data?.data || null

  if (isLoading) {
    return <p className="text-muted-foreground">Đang tải...</p>
  }

  if (!instance) {
    return <p className="text-muted-foreground">Không tìm thấy offboarding</p>
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/offboarding")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Danh Sách
        </Button>
        <h1 className="text-2xl font-bold" style={{ color: "#1E3A5F" }}>
          Offboarding — {instance.employee.fullName} ({instance.employee.employeeCode})
        </h1>
        {["INITIATED", "MANAGER_APPROVED", "HR_APPROVED", "IN_PROGRESS"].includes(instance.status) &&
          ["SUPER_ADMIN", "HR_MANAGER"].includes(session?.user?.role || "") && (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setShowCancelModal(true)}
          >
            <Ban className="h-4 w-4 mr-1" />
            Hủy Quy Trình
          </Button>
        )}
      </div>

      <div className="space-y-6">
        <OffboardingApproval
          instance={instance}
          userRole={session?.user?.role || "EMPLOYEE"}
          onUpdate={() => refetch()}
        />

        {instance.tasks.length > 0 && (
          <OffboardingChecklist
            instanceId={instance.id}
            tasks={instance.tasks}
            instanceStatus={instance.status}
            employeeId={instance.employeeId}
            userRole={session?.user?.role || "EMPLOYEE"}
            onUpdate={() => refetch()}
          />
        )}
      </div>

      <CancelOffboardingModal
        instanceId={instance.id}
        employeeName={instance.employee.fullName}
        open={showCancelModal}
        onOpenChange={setShowCancelModal}
        onSuccess={() => refetch()}
      />
    </div>
  )
}
