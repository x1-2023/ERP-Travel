"use client"

import { CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ImportError {
  row: number
  field: string
  message: string
  severity: "error" | "warning"
}

interface DryRunResult {
  totalRows: number
  validRows: number
  errorRows: number
  warningRows: number
  errors: ImportError[]
  preview: Record<string, unknown>[]
}

interface DryRunResultsProps {
  result: DryRunResult
}

export function DryRunResults({ result }: DryRunResultsProps) {
  const errorList = result.errors.filter((e) => e.severity === "error")
  const warningList = result.errors.filter((e) => e.severity === "warning")

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
            <div>
              <p className="text-2xl font-bold">{result.validRows}</p>
              <p className="text-xs text-muted-foreground">Hợp lệ</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{result.warningRows}</p>
              <p className="text-xs text-muted-foreground">Cảnh báo</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <XCircle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold">{result.errorRows}</p>
              <p className="text-xs text-muted-foreground">Lỗi</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error list */}
      {errorList.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm font-medium text-red-800 mb-2">
            Lỗi ({errorList.length})
          </p>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {errorList.map((e, i) => (
              <p key={i} className="text-xs text-red-700">
                Dòng {e.row}: [{e.field}] {e.message}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Warning list */}
      {warningList.length > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
          <p className="text-sm font-medium text-yellow-800 mb-2">
            Cảnh báo ({warningList.length})
          </p>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {warningList.map((e, i) => (
              <p key={i} className="text-xs text-yellow-700">
                Dòng {e.row}: [{e.field}] {e.message}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Preview table */}
      {result.preview.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Xem trước (10 dòng đầu sau khi chuyển đổi)</p>
          <div className="rounded-lg border overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/50">
                <tr>
                  {Object.keys(result.preview[0]).map((key) => (
                    <th key={key} className="px-3 py-2 text-left font-medium whitespace-nowrap">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.preview.map((row, i) => (
                  <tr key={i} className="border-t">
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="px-3 py-1.5 whitespace-nowrap max-w-[200px] truncate">
                        {val === null || val === undefined ? "" : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
