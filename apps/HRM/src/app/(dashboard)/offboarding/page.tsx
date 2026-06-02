"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"

interface OffboardingItem {
  id: string
  status: string
  resignationDate: string
  lastWorkingDate: string | null
  employee: {
    id: string
    fullName: string
    employeeCode: string
    department: { name: string } | null
    position: { name: string } | null
  }
  tasks: { id: string; status: string }[]
  createdAt: string
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  INITIATED: { label: "Chờ QL duyệt", className: "bg-amber-100 text-amber-700" },
  MANAGER_APPROVED: { label: "Chờ HR duyệt", className: "bg-orange-100 text-orange-700" },
  HR_APPROVED: { label: "HR đã duyệt", className: "bg-blue-100 text-blue-700" },
  IN_PROGRESS: { label: "Đang xử lý", className: "bg-blue-100 text-blue-700" },
  COMPLETED: { label: "Hoàn tất", className: "bg-emerald-100 text-emerald-700" },
  CANCELLED: { label: "Đã hủy", className: "bg-red-100 text-red-700" },
}

function formatDate(d: string | null): string {
  if (!d) return "—"
  try {
    return format(new Date(d), "dd/MM/yyyy")
  } catch {
    return "—"
  }
}

export default function OffboardingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [statusFilter, setStatusFilter] = useState<string>("")

  const { data, isLoading } = useQuery({
    queryKey: ["offboarding-list", statusFilter],
    queryFn: async () => {
      const params = statusFilter ? `?status=${statusFilter}` : ""
      const res = await fetch(`/api/offboarding${params}`)
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  const instances: OffboardingItem[] = data?.data || []
  const isHRManager = session?.user?.role === "HR_MANAGER" || session?.user?.role === "SUPER_ADMIN"

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#1E3A5F" }}>
          Quản Lý Nghỉ Việc
        </h1>
        <Select value={statusFilter || "__all__"} onValueChange={(v) => setStatusFilter(v === "__all__" ? "" : v)}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Tất cả</SelectItem>
            <SelectItem value="INITIATED">Chờ QL duyệt</SelectItem>
            <SelectItem value="MANAGER_APPROVED">Chờ HR duyệt</SelectItem>
            <SelectItem value="IN_PROGRESS">Đang xử lý</SelectItem>
            <SelectItem value="COMPLETED">Hoàn tất</SelectItem>
            <SelectItem value="CANCELLED">Đã hủy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Đang tải...</p>
      ) : instances.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Chưa có đơn nghỉ việc nào
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Danh sách Nghỉ Việc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-background">
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium">Nhân Viên</th>
                    <th className="pb-2 font-medium">Phòng</th>
                    <th className="pb-2 font-medium">Ngày muốn nghỉ</th>
                    <th className="pb-2 font-medium">Ngày làm cuối</th>
                    <th className="pb-2 font-medium">Trạng thái</th>
                    <th className="pb-2 font-medium">Tasks</th>
                    <th className="pb-2 font-medium">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {instances.map((item) => {
                    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.INITIATED
                    const doneTasks = item.tasks.filter(
                      (t) => t.status === "DONE" || t.status === "SKIPPED"
                    ).length
                    const totalTasks = item.tasks.length

                    return (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="py-3">
                          <div className="font-medium">{item.employee.fullName}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.employee.employeeCode}
                          </div>
                        </td>
                        <td className="py-3">{item.employee.department?.name || "—"}</td>
                        <td className="py-3">{formatDate(item.resignationDate)}</td>
                        <td className="py-3">{formatDate(item.lastWorkingDate)}</td>
                        <td className="py-3">
                          <Badge className={cfg.className}>{cfg.label}</Badge>
                        </td>
                        <td className="py-3">
                          {totalTasks > 0 ? `${doneTasks}/${totalTasks}` : "—"}
                        </td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/offboarding/${item.id}`)}
                            >
                              Xem
                            </Button>
                            {isHRManager && item.status === "MANAGER_APPROVED" && (
                              <Button
                                size="sm"
                                style={{ backgroundColor: "#1E3A5F" }}
                                onClick={() => router.push(`/offboarding/${item.id}`)}
                              >
                                Duyệt HR
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
