"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users, Wallet, Clock, FileText, Download, Loader2, CheckCircle, ArrowLeft, ArrowRight,
} from "lucide-react"
import { FileUploadZone } from "@/components/import/file-upload-zone"
import { MappingPreview } from "@/components/import/mapping-preview"
import { DryRunResults } from "@/components/import/dry-run-results"
import { SessionHistory } from "@/components/import/session-history"
import type { ColumnMapping } from "@/lib/ai/import-mapper"

type ImportType = "EMPLOYEES" | "PAYROLL" | "ATTENDANCE" | "CONTRACTS"
type Step = "select" | "analyzing" | "review" | "result"

interface DryRunResult {
  totalRows: number
  validRows: number
  errorRows: number
  warningRows: number
  errors: Array<{ row: number; field: string; message: string; severity: "error" | "warning" }>
  preview: Record<string, unknown>[]
}

const TYPE_OPTIONS = [
  { value: "EMPLOYEES" as const, label: "Nhân Sự", desc: "Nhân viên, phòng ban, chức vụ", icon: Users },
  { value: "PAYROLL" as const, label: "Bảng Lương", desc: "Lương, phụ cấp, bảo hiểm", icon: Wallet },
  { value: "ATTENDANCE" as const, label: "Chấm Công", desc: "Check-in, check-out, ngày công", icon: Clock },
  { value: "CONTRACTS" as const, label: "Hợp Đồng", desc: "HĐ lao động, thử việc", icon: FileText },
]

export default function ImportPage() {
  const [step, setStep] = useState<Step>("select")
  const [importType, setImportType] = useState<ImportType | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [mapping, setMapping] = useState<ColumnMapping | null>(null)
  const [dryRunResult, setDryRunResult] = useState<DryRunResult | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ imported: number; errors: unknown[] } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!file || !importType) return
    setStep("analyzing")
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", importType)

      const res = await fetch("/api/import/analyze", { method: "POST", body: formData })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Lỗi phân tích file")
        setStep("select")
        return
      }

      setSessionId(data.sessionId)
      setMapping(data.mapping)
      setDryRunResult(data.dryRunResult)
      setStep("review")
    } catch {
      setError("Lỗi kết nối server")
      setStep("select")
    }
  }

  const handleExecute = async () => {
    if (!sessionId) return
    setImporting(true)

    try {
      const res = await fetch("/api/import/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Lỗi thực hiện import")
        setImporting(false)
        return
      }

      setImportResult(data)
      setStep("result")
    } catch {
      setError("Lỗi kết nối server")
    } finally {
      setImporting(false)
    }
  }

  const handleReset = () => {
    setStep("select")
    setImportType(null)
    setFile(null)
    setSessionId(null)
    setMapping(null)
    setDryRunResult(null)
    setImportResult(null)
    setError(null)
  }

  const handleDownloadTemplate = (type: string) => {
    window.open(`/api/import/template?type=${type}`, "_blank")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Nhập Dữ Liệu</h1>
          <p className="text-sm text-muted-foreground">Import dữ liệu từ Excel với AI tự động mapping cột</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {(["select", "analyzing", "review", "result"] as const).map((s, i) => {
            const labels = ["Chọn file", "Phân tích", "Xem trước", "Kết quả"]
            const isActive = step === s
            const isPast = ["select", "analyzing", "review", "result"].indexOf(step) > i
            return (
              <div key={s} className="flex items-center gap-2">
                {i > 0 && <div className={`w-8 h-0.5 ${isPast ? "bg-[#1E3A5F]" : "bg-muted"}`} />}
                <Badge
                  variant={isActive ? "default" : isPast ? "secondary" : "outline"}
                  className={isActive ? "bg-[#1E3A5F]" : ""}
                >
                  {i + 1}. {labels[i]}
                </Badge>
              </div>
            )
          })}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Step 1: Select type + upload */}
      {step === "select" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">1. Chọn loại dữ liệu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {TYPE_OPTIONS.map((opt) => {
                  const Icon = opt.icon
                  const isSelected = importType === opt.value
                  return (
                    <button
                      key={opt.value}
                      className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                        isSelected
                          ? "border-[#1E3A5F] bg-[#1E3A5F]/5"
                          : "border-transparent bg-muted/30 hover:bg-muted/50"
                      }`}
                      onClick={() => setImportType(opt.value)}
                    >
                      <Icon className={`h-8 w-8 ${isSelected ? "text-[#1E3A5F]" : "text-muted-foreground"}`} />
                      <span className="text-sm font-medium">{opt.label}</span>
                      <span className="text-xs text-muted-foreground">{opt.desc}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs mt-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownloadTemplate(opt.value)
                        }}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Template
                      </Button>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {importType && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">2. Chọn file Excel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FileUploadZone
                  onFileSelect={setFile}
                  selectedFile={file}
                  onClear={() => setFile(null)}
                />
                {file && (
                  <div className="flex justify-end">
                    <Button onClick={handleAnalyze} className="bg-[#1E3A5F] hover:bg-[#1E3A5F]/90">
                      Phân tích với AI
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Session history */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lịch sử import</CardTitle>
            </CardHeader>
            <CardContent>
              <SessionHistory />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: Analyzing */}
      {step === "analyzing" && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <Loader2 className="h-12 w-12 animate-spin text-[#1E3A5F]" />
            <div className="text-center">
              <p className="text-lg font-medium">AI đang phân tích file...</p>
              <p className="text-sm text-muted-foreground mt-1">
                Đang mapping cột và kiểm tra dữ liệu
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review */}
      {step === "review" && mapping && dryRunResult && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mapping cột</CardTitle>
            </CardHeader>
            <CardContent>
              <MappingPreview mapping={mapping} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Kết quả kiểm tra</CardTitle>
            </CardHeader>
            <CardContent>
              <DryRunResults result={dryRunResult} />
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={handleReset}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <Button
              onClick={handleExecute}
              disabled={importing || dryRunResult.validRows === 0}
              className="bg-[#1E3A5F] hover:bg-[#1E3A5F]/90"
            >
              {importing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang import...
                </>
              ) : (
                <>
                  Import {dryRunResult.validRows} dòng hợp lệ
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Result */}
      {step === "result" && importResult && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <CheckCircle className="h-16 w-16 text-emerald-500" />
            <div className="text-center">
              <p className="text-2xl font-bold">{importResult.imported} bản ghi</p>
              <p className="text-sm text-muted-foreground">đã được import thành công</p>
              {importResult.errors.length > 0 && (
                <p className="text-sm text-red-600 mt-1">
                  {importResult.errors.length} lỗi
                </p>
              )}
            </div>
            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={handleReset}>
                Import thêm
              </Button>
              {importType === "EMPLOYEES" && (
                <Button asChild className="bg-[#1E3A5F] hover:bg-[#1E3A5F]/90">
                  <a href="/employees">Xem danh sách NV</a>
                </Button>
              )}
              {importType === "PAYROLL" && (
                <Button asChild className="bg-[#1E3A5F] hover:bg-[#1E3A5F]/90">
                  <a href="/payroll">Xem bảng lương</a>
                </Button>
              )}
              {importType === "ATTENDANCE" && (
                <Button asChild className="bg-[#1E3A5F] hover:bg-[#1E3A5F]/90">
                  <a href="/attendance">Xem chấm công</a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
