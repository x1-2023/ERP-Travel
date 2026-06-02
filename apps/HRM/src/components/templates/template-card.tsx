"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import Link from "next/link"

interface TemplateCardProps {
  id: string
  name: string
  category: string
  description: string | null
  usageCount: number
  fileName: string
}

const CATEGORY_LABELS: Record<string, string> = {
  CONTRACT: "Hợp Đồng",
  OFFICIAL_DOCUMENT: "Công Văn",
  MEETING: "Biên Bản",
  RECRUITMENT: "Tuyển Dụng",
}

const CATEGORY_COLORS: Record<string, string> = {
  CONTRACT: "bg-blue-100 text-blue-700",
  OFFICIAL_DOCUMENT: "bg-amber-100 text-amber-700",
  MEETING: "bg-purple-100 text-purple-700",
  RECRUITMENT: "bg-emerald-100 text-emerald-700",
}

export function TemplateCard({ id, name, category, description, usageCount }: TemplateCardProps) {
  return (
    <Card className="hover:border-slate-300 transition-colors">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <FileText className="h-8 w-8 text-slate-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{name}</p>
            {description && (
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Badge className={CATEGORY_COLORS[category] || "bg-gray-100 text-gray-700"}>
            {CATEGORY_LABELS[category] || category}
          </Badge>
          <span className="text-xs text-slate-400">Dùng: {usageCount} lần</span>
        </div>
        <Link href={`/templates/${id}`}>
          <Button size="sm" className="w-full" style={{ backgroundColor: "#1E3A5F" }}>
            Tạo Hồ Sơ
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
