"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, GraduationCap, Clock } from "lucide-react"
import { formatDate } from "@/lib/utils/format"
import type { KanbanApplication } from "./kanban-board"

interface DragOverlayCardProps {
  app: KanbanApplication
}

export function DragOverlayCard({ app }: DragOverlayCardProps) {
  return (
    <div className="w-[250px]" style={{ cursor: "grabbing" }}>
      <Card className="border-slate-200 shadow-xl rotate-2">
        <CardContent className="p-3 space-y-1.5">
          <p className="font-medium text-sm">{app.candidate.fullName}</p>

          <div className="space-y-0.5 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Mail className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{app.candidate.email}</span>
            </div>
            {app.candidate.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="h-3 w-3 flex-shrink-0" />{app.candidate.phone}
              </div>
            )}
            {(app.candidate.school || app.candidate.major) && (
              <div className="flex items-center gap-1.5">
                <GraduationCap className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">
                  {[app.candidate.school, app.candidate.major].filter(Boolean).join(" — ")}
                </span>
              </div>
            )}
          </div>

          {app.requisition && (
            <p className="text-xs font-medium text-slate-600 truncate">{app.requisition.title}</p>
          )}

          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <Clock className="h-3 w-3" />
            Nộp: {formatDate(app.createdAt)}
          </div>

          {app.employeeId && app.status === "ACCEPTED" && (
            <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">NV đã tạo</Badge>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
