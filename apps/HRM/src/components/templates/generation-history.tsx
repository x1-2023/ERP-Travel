"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { formatDateTime } from "@/lib/utils/format"
import { useToast } from "@/hooks/use-toast"

interface Generation {
  id: string
  fileName: string
  fieldValues: Record<string, string>
  createdAt: string
  generator: { name: string | null; email: string }
  employee: { fullName: string; employeeCode: string } | null
}

interface GenerationHistoryProps {
  templateId: string
}

export function GenerationHistory({ templateId }: GenerationHistoryProps) {
  const { toast } = useToast()

  const { data, isLoading } = useQuery<{ data: Generation[] }>({
    queryKey: ["template-generations", templateId],
    queryFn: async () => {
      const res = await fetch(`/api/templates/${templateId}/generations`)
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  const generations = data?.data || []

  async function handleRegenerate(gen: Generation) {
    try {
      const res = await fetch(`/api/templates/${templateId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: gen.employee ? undefined : undefined,
          fieldValues: gen.fieldValues,
        }),
      })

      if (!res.ok) throw new Error("Failed")

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.download = gen.fileName
      a.href = url
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast({ title: "Lỗi", description: "Không thể tạo lại file", variant: "destructive" })
    }
  }

  if (isLoading) return <p className="text-sm text-slate-400">Đang tải...</p>

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Lịch sử tạo hồ sơ ({generations.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {generations.length === 0 ? (
          <p className="text-sm text-slate-400">Chưa có lần tạo nào</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-2">Thời gian</th>
                  <th className="text-left py-2 px-2">Người tạo</th>
                  <th className="text-left py-2 px-2">Nhân viên</th>
                  <th className="text-right py-2 px-2">Tải lại</th>
                </tr>
              </thead>
              <tbody>
                {generations.map((gen) => (
                  <tr key={gen.id} className="border-b">
                    <td className="py-2 px-2 text-slate-600">
                      {formatDateTime(gen.createdAt)}
                    </td>
                    <td className="py-2 px-2">
                      {gen.generator.name || gen.generator.email}
                    </td>
                    <td className="py-2 px-2">
                      {gen.employee
                        ? `${gen.employee.fullName} (${gen.employee.employeeCode})`
                        : "—"}
                    </td>
                    <td className="py-2 px-2 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRegenerate(gen)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
