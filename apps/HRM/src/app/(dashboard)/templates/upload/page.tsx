"use client"

import { useState, useRef } from "react"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Upload, FileText, CheckCircle } from "lucide-react"
import { FieldDefiner, type TemplateField } from "@/components/templates/field-definer"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

const CATEGORIES = [
  { value: "CONTRACT", label: "Hợp Đồng" },
  { value: "OFFICIAL_DOCUMENT", label: "Công Văn" },
  { value: "MEETING", label: "Biên Bản" },
  { value: "RECRUITMENT", label: "Tuyển Dụng" },
]

export default function TemplateUploadPage() {
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(1)
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState("")
  const [category, setCategory] = useState("OFFICIAL_DOCUMENT")
  const [description, setDescription] = useState("")
  const [templateId, setTemplateId] = useState("")
  const [fields, setFields] = useState<TemplateField[]>([])
  const [scanning, setScanning] = useState(false)

  // Step 1: Upload file
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("No file")
      const formData = new FormData()
      formData.append("file", file)
      formData.append("metadata", JSON.stringify({ name, category, description }))

      const res = await fetch("/api/templates/upload", { method: "POST", body: formData })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Upload failed")
      }
      return res.json()
    },
    onSuccess: async (data) => {
      const id = data.data.id
      setTemplateId(id)

      // Auto-scan placeholders
      setScanning(true)
      try {
        const res = await fetch(`/api/templates/${id}/scan-placeholders`)
        if (res.ok) {
          const scan = await res.json()
          const placeholders = scan.data as string[]
          setFields(
            placeholders.map((key: string) => ({
              key,
              label: key.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
              type: "TEXT" as const,
              required: false,
            }))
          )
        }
      } catch {
        // Scan failed, user can define manually
      } finally {
        setScanning(false)
      }

      setStep(2)
    },
    onError: (err) => {
      toast({ title: "Lỗi upload", description: err.message, variant: "destructive" })
    },
  })

  // Step 2: Save fields
  const saveFieldsMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/templates/${templateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields }),
      })
      if (!res.ok) throw new Error("Save failed")
      return res.json()
    },
    onSuccess: () => {
      setStep(3)
    },
    onError: (err) => {
      toast({ title: "Lỗi", description: err.message, variant: "destructive" })
    },
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) {
      if (!f.name.endsWith(".docx")) {
        toast({ title: "Lỗi", description: "Chỉ hỗ trợ file .docx", variant: "destructive" })
        return
      }
      setFile(f)
      if (!name) setName(f.name.replace(/\.docx$/i, ""))
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/templates">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold">Tải Template Lên</h1>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 text-sm">
        <Badge className={step >= 1 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}>
          1. Upload
        </Badge>
        <span className="text-slate-300">→</span>
        <Badge className={step >= 2 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}>
          2. Định nghĩa Fields
        </Badge>
        <span className="text-slate-300">→</span>
        <Badge className={step >= 3 ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}>
          3. Hoàn tất
        </Badge>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bước 1: Upload file .docx</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-blue-300 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <FileText className="h-6 w-6 text-blue-500" />
                  <div className="text-left">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-slate-400">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-slate-500">
                    Click để chọn file .docx (tối đa 10MB)
                  </p>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".docx"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Tên template *</label>
              <Input
                className="mt-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Quyết Định Tăng Lương"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Danh mục *</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Mô tả</label>
              <Textarea
                className="mt-1"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả ngắn về template..."
              />
            </div>

            <Button
              className="w-full"
              style={{ backgroundColor: "#1E3A5F" }}
              disabled={!file || !name || uploadMutation.isPending}
              onClick={() => uploadMutation.mutate()}
            >
              {uploadMutation.isPending ? "Đang upload..." : "Tiếp tục →"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Bước 2: Định nghĩa Fields
              {scanning && <span className="text-sm text-slate-400 ml-2">Đang quét...</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.length > 0 ? (
              <p className="text-sm text-slate-500">
                Phát hiện {fields.length} placeholder trong file. Tùy chỉnh bên dưới:
              </p>
            ) : (
              <p className="text-sm text-slate-500">
                Không tìm thấy placeholder. Thêm fields thủ công hoặc bấm Lưu để skip.
              </p>
            )}

            <FieldDefiner fields={fields} onChange={setFields} />

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                ← Quay lại
              </Button>
              <Button
                className="flex-1"
                style={{ backgroundColor: "#1E3A5F" }}
                disabled={saveFieldsMutation.isPending}
                onClick={() => saveFieldsMutation.mutate()}
              >
                {saveFieldsMutation.isPending ? "Đang lưu..." : "Lưu Template"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <CheckCircle className="h-12 w-12 mx-auto text-emerald-500" />
            <div>
              <p className="text-lg font-semibold">
                Template &quot;{name}&quot; đã được lưu!
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {fields.length} fields đã định nghĩa
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <Link href={`/templates/${templateId}`}>
                <Button variant="outline">Xem Template</Button>
              </Link>
              <Link href={`/templates/${templateId}`}>
                <Button style={{ backgroundColor: "#1E3A5F" }}>Tạo Hồ Sơ Ngay</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
