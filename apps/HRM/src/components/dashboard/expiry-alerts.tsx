"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"

interface ExpiryItem {
  id: string
  employeeName: string
  employeeCode: string
  expiryDate: string
  daysLeft: number
}

interface ExpiryAlertsProps {
  contracts: ExpiryItem[]
}

export function ExpiryAlerts({ contracts }: ExpiryAlertsProps) {
  const router = useRouter()

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          HĐ Sắp Hết Hạn
          {contracts.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {contracts.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {contracts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Không có HĐ sắp hết hạn</p>
        ) : (
          <div className="space-y-2">
            {contracts.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between text-sm py-1.5 border-b last:border-0"
              >
                <div>
                  <span className="font-medium">{c.employeeCode}</span>{" "}
                  <span className="text-muted-foreground">{c.employeeName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      c.daysLeft <= 7
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }
                    variant="secondary"
                  >
                    {c.daysLeft} ngày
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => router.push(`/employees`)}
                  >
                    Xem
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
