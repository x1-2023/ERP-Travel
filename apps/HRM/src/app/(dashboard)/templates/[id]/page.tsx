"use client"

import { use } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Settings, FileText } from "lucide-react"
import { GenerateForm } from "@/components/templates/generate-form"
import { GenerationHistory } from "@/components/templates/generation-history"
import { formatDate } from "@/lib/utils/format"
import type { TemplateField } from "@/components/templates/field-definer"

const CATEGORY_LABELS: Record<string, string> = {
  CONTRACT: "Hợp Đồng",
  OFFICIAL_DOCUMENT: "Công Văn",
  MEETING: "Biên Bản",
  RECRUITMENT: "Tuyển Dụng",
}

interface TemplateData {
  id: string
  name: string
  category: string
  description: string | null
  fileName: string
  fileSize: number
  fields: TemplateField[]
  usageCount: number
  isActive: boolean
  createdAt: string
  uploader: { name: string | null; email: string }
  _count: { generations: number }
}

export default function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: session } = useSession()
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN"

  const { data, isLoading } = useQuery<{ data: TemplateData }>({
    queryKey: ["template", id],
    queryFn: async () => {
      const res = await fetch(`/api/templates/${id}`)
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  const template = data?.data

  if (isLoading) return <p className="text-center py-10 text-slate-400">Đang tải...</p>
  if (!template) return <p className="text-center py-10 text-slate-500">Không tìm thấy</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/templates">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{template.name}</h1>
            <Badge>{CATEGORY_LABELS[template.category] || template.category}</Badge>
          </div>
          {template.description && (
            <p className="text-sm text-slate-500 mt-0.5">{template.description}</p>
          )}
        </div>
        {isSuperAdmin && (
          <Link href={`/templates/upload?edit=${id}`}>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-1" /> Chỉnh sửa
            </Button>
          </Link>
        )}
      </div>

      {/* Template info */}
      <Card>
        <CardContent className="py-3">
          <div className="flex items-center gap-6 text-sm text-slate-500 flex-wrap">
            <div className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              {template.fileName} ({(template.fileSize / 1024).toFixed(1)} KB)
            </div>
            <span>Dùng: {template.usageCount} lần</span>
            <span>Tạo bởi: {template.uploader.name || template.uploader.email}</span>
            <span>Ngày tạo: {formatDate(template.createdAt)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Generate form */}
      {template.fields.length > 0 ? (
        <GenerateForm
          templateId={id}
          templateName={template.name}
          fields={template.fields}
        />
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-slate-500">
            Template chưa có fields nào.
            {isSuperAdmin && " Vào \"Chỉnh sửa\" để định nghĩa fields."}
          </CardContent>
        </Card>
      )}

      {/* History */}
      <GenerationHistory templateId={id} />
    </div>
  )
}
