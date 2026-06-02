"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { getTypeConfig, getStatusConfig } from "@/components/reports/report-card"

interface PendingItem {
  id: string
  type: string
  status: string
  employeeName: string
  employeeCode: string
  startDate: string
}

interface PendingListProps {
  reports: PendingItem[]
}

export function PendingList({ reports }: PendingListProps) {
  const router = useRouter()

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4 text-sky-500" />
          Báo Cáo Chờ Duyệt
          {reports.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {reports.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <p className="text-sm text-muted-foreground">Không có báo cáo chờ duyệt</p>
        ) : (
          <div className="space-y-2">
            {reports.map((r) => {
              const tc = getTypeConfig(r.type)
              const sc = getStatusConfig(r.status)
              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between text-sm py-1.5 border-b last:border-0 cursor-pointer hover:bg-muted/50 -mx-2 px-2 rounded"
                  onClick={() => router.push(`/reports/${r.id}`)}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{tc.label}</span>
                    <span className="text-muted-foreground">— {r.employeeName}</span>
                  </div>
                  <Badge className={sc.className} variant="secondary">
                    {sc.label}
                  </Badge>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
