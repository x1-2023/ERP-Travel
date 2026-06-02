"use client"

import { useState, useCallback } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertTriangle,
  Download, ArrowRight, Loader2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DEVICE_SIGNATURES, type DeviceFormat } from "@/lib/attendance/adapter"

interface PreviewRow {
  employeeCode: string
  employeeName: string
  date: string
  checkIn: string | null
  checkOut: string | null
  workHours: number
  status: string
  matched: boolean
  matchedEmployeeName?: string
  conflict: boolean
  conflictAction?: string
}

interface PreviewResult {
  mode: "preview"
  meta: {
    deviceType: string
    totalRows: number
    parsedRows: number
    dateRange: { from: string; to: string } | null
    employeeCodes: string[]
  }
  summary: {
    totalRecords: number
    matched: number
    unmatched: number
    conflicts: number
    willImport: number
  }
  preview: PreviewRow[]
  parseErrors: { row: number; field: string; message: string; severity: string }[]
}

interface ImportResultData {
  mode: "import"
  result: { created: number; updated: number; skipped: number }
  errors: { row: number; field: string; message: string; severity: string }[]
  meta: { deviceType: string }
}

const STATUS_LABELS: Record<string, string> = {
  PRESENT: "Đúng giờ",
  LATE: "Đi muộn",
  HALF_DAY: "Nửa ngày",
  ABSENT: "Vắng",
  LEAVE: "Nghỉ phép",
  HOLIDAY: "Nghỉ lễ",
}

const STATUS_COLORS: Record<string, string> = {
  PRESENT: "bg-green-100 text-green-800",
  LATE: "bg-yellow-100 text-yellow-800",
  HALF_DAY: "bg-orange-100 text-orange-800",
  ABSENT: "bg-red-100 text-red-800",
  LEAVE: "bg-blue-100 text-blue-800",
  HOLIDAY: "bg-purple-100 text-purple-800",
}

export function AttendanceImport({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [format, setFormat] = useState<DeviceFormat>("auto")
  const [duplicateStrategy, setDuplicateStrategy] = useState<"skip" | "overwrite">("skip")
  const [previewData, setPreviewData] = useState<PreviewResult | null>(null)
  const [importResult, setImportResult] = useState<ImportResultData | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // File drop handler
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) {
      setFile(dropped)
      setPreviewData(null)
      setImportResult(null)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      setPreviewData(null)
      setImportResult(null)
    }
  }

  // Preview mutation
  const previewMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Chưa chọn file")
      const formData = new FormData()
      formData.append("file", file)
      formData.append("format", format)
      formData.append("mode", "preview")
      formData.append("duplicateStrategy", duplicateStrategy)

      const res = await fetch("/api/attendance/import", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Lỗi parse file")
      return data as PreviewResult
    },
    onSuccess: (data) => setPreviewData(data),
    onError: (err) => toast({ title: "Lỗi", description: err.message, variant: "destructive" }),
  })

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Chưa chọn file")
      const formData = new FormData()
      formData.append("file", file)
      formData.append("format", format)
      formData.append("mode", "import")
      formData.append("duplicateStrategy", duplicateStrategy)

      const res = await fetch("/api/attendance/import", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Lỗi import")
      return data as ImportResultData
    },
    onSuccess: (data) => {
      setImportResult(data)
      queryClient.invalidateQueries({ queryKey: ["attendance-grid"] })
      toast({
        title: "Import thành công",
        description: `Tạo mới: ${data.result.created}, Cập nhật: ${data.result.updated}, Bỏ qua: ${data.result.skipped}`,
      })
    },
    onError: (err) => toast({ title: "Lỗi import", description: err.message, variant: "destructive" }),
  })

  // Download sample template
  const downloadTemplate = () => {
    const headers = ["Mã NV", "Ngày", "Giờ vào", "Giờ ra"]
    const sampleRows = [
      ["RTR-0001", "01/03/2026", "07:45", "17:30"],
      ["RTR-0002", "01/03/2026", "08:10", "17:45"],
      ["RTR-0003", "01/03/2026", "08:35", "17:30"],
    ]
    const csv = [headers.join(","), ...sampleRows.map(r => r.join(","))].join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "mau_cham_cong.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* Step 1: File upload */}
      {!importResult && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Import Chấm Công từ Máy Vân Tay
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Config row */}
            <div className="flex gap-3 flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <label className="text-xs text-muted-foreground mb-1 block">Loại máy chấm công</label>
                <Select value={format} onValueChange={(v) => setFormat(v as DeviceFormat)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DEVICE_SIGNATURES).map(([key, sig]) => (
                      <SelectItem key={key} value={key}>
                        {sig.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-[180px]">
                <label className="text-xs text-muted-foreground mb-1 block">Bản ghi trùng</label>
                <Select value={duplicateStrategy} onValueChange={(v) => setDuplicateStrategy(v as "skip" | "overwrite")}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skip">Bỏ qua</SelectItem>
                    <SelectItem value="overwrite">Ghi đè</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" size="sm" onClick={downloadTemplate} className="h-9">
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Tải file mẫu
                </Button>
              </div>
            </div>

            {/* Drop zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
                ${dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("attendance-file-input")?.click()}
            >
              <input
                id="attendance-file-input"
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              {file ? (
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(file.size / 1024).toFixed(1)} KB — Bấm &quot;Xem trước&quot; để kiểm tra
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Kéo thả file Excel/CSV từ máy chấm công vào đây
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Hỗ trợ: ZKTeco, Ronald Jack, Suprema, Hikvision, hoặc CSV chung
                  </p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={onClose}>Đóng</Button>
              <Button
                style={{ backgroundColor: "#1E3A5F" }}
                disabled={!file || previewMutation.isPending}
                onClick={() => previewMutation.mutate()}
              >
                {previewMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Đang phân tích...</>
                ) : (
                  <>Xem trước<ArrowRight className="h-4 w-4 ml-2" /></>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Preview */}
      {previewData && !importResult && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Xem trước dữ liệu</span>
              <Badge variant="outline">{previewData.meta.deviceType}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <SummaryCard label="Tổng bản ghi" value={previewData.summary.totalRecords} />
              <SummaryCard label="Khớp NV" value={previewData.summary.matched} color="text-green-600" />
              <SummaryCard label="Không khớp" value={previewData.summary.unmatched} color="text-red-600" />
              <SummaryCard label="Trùng lặp" value={previewData.summary.conflicts} color="text-yellow-600" />
              <SummaryCard label="Sẽ import" value={previewData.summary.willImport} color="text-blue-600" />
            </div>

            {previewData.meta.dateRange && (
              <p className="text-xs text-muted-foreground">
                Khoảng thời gian: {previewData.meta.dateRange.from.split("T")[0]} → {previewData.meta.dateRange.to.split("T")[0]}
              </p>
            )}

            {/* Errors/warnings */}
            {previewData.parseErrors.length > 0 && (
              <div className="max-h-24 overflow-y-auto border rounded p-2">
                {previewData.parseErrors.slice(0, 10).map((err, i) => (
                  <div key={i} className="text-xs flex items-center gap-1 py-0.5">
                    {err.severity === "error"
                      ? <XCircle className="h-3 w-3 text-red-500 shrink-0" />
                      : <AlertTriangle className="h-3 w-3 text-yellow-500 shrink-0" />
                    }
                    <span className="text-muted-foreground">{err.message}</span>
                  </div>
                ))}
                {previewData.parseErrors.length > 10 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    ... và {previewData.parseErrors.length - 10} cảnh báo khác
                  </p>
                )}
              </div>
            )}

            {/* Preview table */}
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto border rounded">
              <table className="text-xs w-full">
                <thead className="sticky top-0 bg-muted/80 z-10">
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Mã NV</th>
                    <th className="text-left py-2 px-2">Tên NV</th>
                    <th className="text-left py-2 px-2">Ngày</th>
                    <th className="text-center py-2 px-2">Vào</th>
                    <th className="text-center py-2 px-2">Ra</th>
                    <th className="text-center py-2 px-2">Giờ làm</th>
                    <th className="text-center py-2 px-2">Trạng thái</th>
                    <th className="text-center py-2 px-2">Khớp</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.preview.map((row, i) => (
                    <tr key={i} className={`border-b ${!row.matched ? "bg-red-50" : row.conflict ? "bg-yellow-50" : ""}`}>
                      <td className="py-1.5 px-2 font-mono">{row.employeeCode}</td>
                      <td className="py-1.5 px-2">{row.matchedEmployeeName || row.employeeName}</td>
                      <td className="py-1.5 px-2">{row.date}</td>
                      <td className="text-center py-1.5 px-2">{row.checkIn || "—"}</td>
                      <td className="text-center py-1.5 px-2">{row.checkOut || "—"}</td>
                      <td className="text-center py-1.5 px-2">{row.workHours}h</td>
                      <td className="text-center py-1.5 px-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${STATUS_COLORS[row.status] || ""}`}>
                          {STATUS_LABELS[row.status] || row.status}
                        </span>
                      </td>
                      <td className="text-center py-1.5 px-2">
                        {row.matched ? (
                          row.conflict ? (
                            <Badge variant="outline" className="text-[10px] text-yellow-600">Trùng</Badge>
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mx-auto" />
                          )
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-red-400 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Import actions */}
            <div className="flex gap-2 justify-between items-center">
              <p className="text-xs text-muted-foreground">
                {previewData.summary.willImport > 0
                  ? `Sẵn sàng import ${previewData.summary.willImport} bản ghi`
                  : "Không có bản ghi nào để import"
                }
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setPreviewData(null); setFile(null) }}>
                  Chọn file khác
                </Button>
                <Button
                  style={{ backgroundColor: "#1E3A5F" }}
                  disabled={previewData.summary.willImport === 0 || importMutation.isPending}
                  onClick={() => importMutation.mutate()}
                >
                  {importMutation.isPending ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Đang import...</>
                  ) : (
                    <>Import {previewData.summary.willImport} bản ghi</>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Result */}
      {importResult && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              Import Hoàn Tất
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <SummaryCard label="Tạo mới" value={importResult.result.created} color="text-green-600" />
              <SummaryCard label="Cập nhật" value={importResult.result.updated} color="text-blue-600" />
              <SummaryCard label="Bỏ qua" value={importResult.result.skipped} color="text-gray-500" />
            </div>

            {importResult.errors.length > 0 && (
              <div className="border border-red-200 rounded p-2">
                <p className="text-xs font-medium text-red-700 mb-1">Lỗi:</p>
                {importResult.errors.map((err, i) => (
                  <p key={i} className="text-xs text-red-600">{err.message}</p>
                ))}
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => {
                setFile(null)
                setPreviewData(null)
                setImportResult(null)
              }}>
                Import thêm
              </Button>
              <Button style={{ backgroundColor: "#1E3A5F" }} onClick={onClose}>
                Đóng
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function SummaryCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="border rounded p-2 text-center">
      <div className={`text-lg font-bold ${color || ""}`}>{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  )
}

// ═══════════════ IMPORT DIALOG WRAPPER ═══════════════

export function AttendanceImportDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import Chấm Công từ Máy Vân Tay
          </DialogTitle>
        </DialogHeader>
        <AttendanceImport onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
