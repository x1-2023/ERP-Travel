"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, MapPin, Award } from "lucide-react"
import { formatDateTime, formatCurrency } from "@/lib/utils/format"

const statusColors: Record<string, string> = {
  NEW: "bg-slate-100 text-slate-700",
  SCREENING: "bg-amber-100 text-amber-700",
  INTERVIEW: "bg-blue-100 text-blue-700",
  OFFERED: "bg-purple-100 text-purple-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
  WITHDRAWN: "bg-gray-100 text-gray-700",
}

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: app, isLoading } = useQuery<any>({
    queryKey: ["app-detail", id],
    queryFn: async () => {
      const res = await fetch(`/api/recruitment/applications`)
      const data = await res.json()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return data.data?.find((a: any) => a.id === id) || null
    },
  })

  if (isLoading) return <div className="text-center py-10 text-slate-400">Đang tải...</div>
  if (!app) return <div className="text-center py-10 text-slate-500">Không tìm thấy</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/recruitment/requisitions/${app.requisitionId}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{app.candidate.fullName}</h1>
          <p className="text-sm text-slate-500">{app.requisition.title} — {app.requisition.department.name}</p>
        </div>
        <Badge className={statusColors[app.status]}>{app.status}</Badge>
      </div>

      {/* Candidate info */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Thông tin ứng viên</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-slate-500">Email:</span> {app.candidate.email}</div>
          <div><span className="text-slate-500">SĐT:</span> {app.candidate.phone || "—"}</div>
          <div><span className="text-slate-500">Trường:</span> {app.candidate.school || "—"}</div>
          <div><span className="text-slate-500">Ngành:</span> {app.candidate.major || "—"}</div>
          <div><span className="text-slate-500">Nguồn:</span> {app.candidate.source || "—"}</div>
          <div><span className="text-slate-500">Lương KV:</span> {formatCurrency(app.expectedSalary)}</div>
        </CardContent>
      </Card>

      {/* Interview timeline */}
      {app.interviews.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Lịch phỏng vấn</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {app.interviews.map((iv: { id: string; round: number; scheduledAt: string; location: string | null; result: string; score: number | null; notes: string | null }) => (
                <div key={iv.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                    {iv.round}
                  </div>
                  <div className="flex-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      {formatDateTime(iv.scheduledAt)}
                    </div>
                    {iv.location && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <MapPin className="h-3 w-3" />{iv.location}
                      </div>
                    )}
                    {iv.score && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <Award className="h-3 w-3" />Điểm: {iv.score}/10
                      </div>
                    )}
                    <Badge className={`mt-1 text-xs ${iv.result === "PASS" ? "bg-emerald-100 text-emerald-700" : iv.result === "FAIL" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"}`}>
                      {iv.result}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rejection reason */}
      {app.rejectionReason && (
        <Card>
          <CardHeader><CardTitle className="text-sm text-red-600">Lý do từ chối</CardTitle></CardHeader>
          <CardContent><p className="text-sm">{app.rejectionReason}</p></CardContent>
        </Card>
      )}
    </div>
  )
}
