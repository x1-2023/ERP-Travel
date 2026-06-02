"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, ExternalLink, Copy, Check } from "lucide-react"
import { KanbanBoard } from "@/components/recruitment/kanban-board"
import { format } from "date-fns"
import { useState } from "react"
import { formatCurrency } from "@/lib/utils/format"

const statusColors: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  OPEN: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
}

const statusLabels: Record<string, string> = {
  DRAFT: "Nháp",
  OPEN: "Đang tuyển",
  CLOSED: "Đã đóng",
  CANCELLED: "Đã huỷ",
}

const contractLabels: Record<string, string> = {
  PROBATION: "Thử việc",
  DEFINITE_TERM: "Có thời hạn",
  INDEFINITE_TERM: "Không thời hạn",
  PART_TIME: "Part-time",
  SEASONAL: "Thời vụ",
}

export default function RequisitionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [copied, setCopied] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: jr, isLoading } = useQuery<any>({
    queryKey: ["requisition", id],
    queryFn: async () => {
      const res = await fetch(`/api/recruitment/requisitions/${id}`)
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  const approveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/recruitment/requisitions/${id}/approve`, { method: "POST" })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requisition", id] })
    },
  })

  if (isLoading) {
    return <div className="text-center py-10 text-slate-400">Đang tải...</div>
  }

  if (!jr) {
    return <div className="text-center py-10 text-slate-500">Không tìm thấy</div>
  }

  const isHRManager = session?.user?.role === "HR_MANAGER" || session?.user?.role === "SUPER_ADMIN"
  const applyUrl = typeof window !== "undefined" ? `${window.location.origin}/apply/${id}` : ""

  function copyApplyUrl() {
    navigator.clipboard.writeText(applyUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/recruitment">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{jr.title}</h1>
            <Badge className={statusColors[jr.status]}>{statusLabels[jr.status]}</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            {jr.department.name} &middot; {jr.position.name} &middot; HC: {jr.headcount} &middot; {contractLabels[jr.contractType]}
          </p>
        </div>
        {jr.status === "DRAFT" && isHRManager && (
          <Button onClick={() => approveMutation.mutate()} disabled={approveMutation.isPending}
            style={{ backgroundColor: "#1E3A5F" }}>
            <CheckCircle className="h-4 w-4 mr-2" />
            {approveMutation.isPending ? "Đang duyệt..." : "Duyệt & Mở tuyển"}
          </Button>
        )}
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 text-sm space-y-1">
            <p className="text-slate-500">Mức lương</p>
            <p className="font-medium">{formatCurrency(jr.salaryFrom)} — {formatCurrency(jr.salaryTo)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-sm space-y-1">
            <p className="text-slate-500">Người yêu cầu</p>
            <p className="font-medium">{jr.requester?.name || "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-sm space-y-1">
            <p className="text-slate-500">Ngày tạo</p>
            <p className="font-medium">{format(new Date(jr.createdAt), "dd/MM/yyyy")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Public apply link */}
      {jr.status === "OPEN" && (
        <Card>
          <CardContent className="py-3 flex items-center gap-3">
            <ExternalLink className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <code className="text-xs text-slate-600 flex-1 truncate">{applyUrl}</code>
            <Button size="sm" variant="outline" className="text-xs h-7" onClick={copyApplyUrl}>
              {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {(jr.description || jr.requirements) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jr.description && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Mô tả công việc</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-slate-600 whitespace-pre-wrap">{jr.description}</p></CardContent>
            </Card>
          )}
          {jr.requirements && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Yêu cầu</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-slate-600 whitespace-pre-wrap">{jr.requirements}</p></CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Kanban Board */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Pipeline ứng viên ({jr.applications.length})</h2>
        <KanbanBoard
          applications={jr.applications}
          invalidateKeys={[["requisition", id]]}
          userRole={session?.user?.role || ""}
        />
      </div>
    </div>
  )
}
