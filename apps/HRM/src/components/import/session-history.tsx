"use client"

import { useQuery } from "@tanstack/react-query"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"
import { useState } from "react"

interface ImportSession {
  id: string
  type: string
  status: string
  fileName: string
  totalRows: number
  successRows: number
  errorRows: number
  createdAt: string
  completedAt: string | null
  rolledBackAt: string | null
  importer: { name: string | null; email: string }
}

const TYPE_LABELS: Record<string, string> = {
  EMPLOYEES: "Nhân sự",
  PAYROLL: "Lương",
  ATTENDANCE: "Chấm công",
  CONTRACTS: "Hợp đồng",
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DRY_RUN: { label: "Chờ xác nhận", className: "bg-yellow-100 text-yellow-700" },
  COMPLETED: { label: "Hoàn thành", className: "bg-emerald-100 text-emerald-700" },
  ROLLED_BACK: { label: "Đã rollback", className: "bg-gray-100 text-gray-700" },
  FAILED: { label: "Thất bại", className: "bg-red-100 text-red-700" },
}

export function SessionHistory() {
  const [rollbackingId, setRollbackingId] = useState<string | null>(null)

  const { data: sessions, refetch } = useQuery<ImportSession[]>({
    queryKey: ["import-sessions"],
    queryFn: async () => {
      const res = await fetch("/api/import/sessions")
      if (!res.ok) throw new Error("Failed to load")
      return res.json()
    },
  })

  const handleRollback = async (sessionId: string) => {
    if (!confirm("Bạn có chắc muốn rollback phiên import này? Tất cả dữ liệu đã import sẽ bị xóa.")) return

    setRollbackingId(sessionId)
    try {
      const res = await fetch(`/api/import/${sessionId}/rollback`, { method: "POST" })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || "Lỗi rollback")
        return
      }
      refetch()
    } catch {
      alert("Lỗi rollback")
    } finally {
      setRollbackingId(null)
    }
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Chưa có phiên import nào
      </div>
    )
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-2 text-left font-medium">Loại</th>
            <th className="px-4 py-2 text-left font-medium">File</th>
            <th className="px-4 py-2 text-left font-medium">Trạng thái</th>
            <th className="px-4 py-2 text-right font-medium">Tổng</th>
            <th className="px-4 py-2 text-right font-medium">OK</th>
            <th className="px-4 py-2 text-right font-medium">Lỗi</th>
            <th className="px-4 py-2 text-left font-medium">Người import</th>
            <th className="px-4 py-2 text-left font-medium">Thời gian</th>
            <th className="px-4 py-2 text-right font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => {
            const statusCfg = STATUS_CONFIG[s.status] || { label: s.status, className: "" }
            return (
              <tr key={s.id} className="border-t">
                <td className="px-4 py-2">{TYPE_LABELS[s.type] || s.type}</td>
                <td className="px-4 py-2 max-w-[200px] truncate">{s.fileName}</td>
                <td className="px-4 py-2">
                  <Badge variant="secondary" className={statusCfg.className}>
                    {statusCfg.label}
                  </Badge>
                </td>
                <td className="px-4 py-2 text-right">{s.totalRows}</td>
                <td className="px-4 py-2 text-right text-emerald-600">{s.successRows}</td>
                <td className="px-4 py-2 text-right text-red-600">{s.errorRows}</td>
                <td className="px-4 py-2">{s.importer.name || s.importer.email}</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">
                  {new Date(s.createdAt).toLocaleString("vi-VN")}
                </td>
                <td className="px-4 py-2 text-right">
                  {s.status === "COMPLETED" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRollback(s.id)}
                      disabled={rollbackingId === s.id}
                      className="text-red-600 hover:text-red-700"
                    >
                      <RotateCcw className="h-3.5 w-3.5 mr-1" />
                      {rollbackingId === s.id ? "..." : "Rollback"}
                    </Button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
