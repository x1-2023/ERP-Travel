"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload } from "lucide-react"
import { TemplateCard } from "@/components/templates/template-card"

interface Template {
  id: string
  name: string
  category: string
  description: string | null
  fileName: string
  usageCount: number
}

const CATEGORIES = [
  { value: "", label: "Tất cả" },
  { value: "CONTRACT", label: "Hợp Đồng" },
  { value: "OFFICIAL_DOCUMENT", label: "Công Văn" },
  { value: "MEETING", label: "Biên Bản" },
  { value: "RECRUITMENT", label: "Tuyển Dụng" },
]

export default function TemplatesPage() {
  const { data: session } = useSession()
  const [category, setCategory] = useState("")
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN"

  const { data, isLoading } = useQuery<{ data: Template[] }>({
    queryKey: ["templates", category],
    queryFn: async () => {
      const params = category ? `?category=${category}` : ""
      const res = await fetch(`/api/templates${params}`)
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  const templates = data?.data || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Thư Viện Hồ Sơ Mẫu</h1>
        {isSuperAdmin && (
          <Link href="/templates/upload">
            <Button style={{ backgroundColor: "#1E3A5F" }}>
              <Upload className="h-4 w-4 mr-2" /> Tải Template Lên
            </Button>
          </Link>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.value}
            variant={category === cat.value ? "default" : "outline"}
            size="sm"
            style={category === cat.value ? { backgroundColor: "#1E3A5F" } : {}}
            onClick={() => setCategory(cat.value)}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-center text-slate-400 py-10">Đang tải...</p>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            Chưa có template nào
            {isSuperAdmin && " — bấm \"Tải Template Lên\" để bắt đầu"}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {templates.map((t) => (
            <TemplateCard key={t.id} {...t} />
          ))}
        </div>
      )}
    </div>
  )
}
