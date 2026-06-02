import Link from "next/link"
import { helpGuides } from "@/lib/content/help-guides"
import { Clock, ArrowRight, BookOpen } from "lucide-react"

const COLOR_MAP = {
  blue:   { card: "border-blue-200 bg-blue-50",    badge: "bg-blue-100 text-blue-700",     arrow: "text-blue-600" },
  green:  { card: "border-green-200 bg-green-50",   badge: "bg-green-100 text-green-700",   arrow: "text-green-600" },
  purple: { card: "border-purple-200 bg-purple-50", badge: "bg-purple-100 text-purple-700", arrow: "text-purple-600" },
  orange: { card: "border-orange-200 bg-orange-50", badge: "bg-orange-100 text-orange-700", arrow: "text-orange-600" },
} as const

export default function HelpPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-5 w-5 text-amber-500" />
          <span className="text-sm font-medium text-amber-600">Hướng Dẫn Sử Dụng</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Bắt đầu từ đâu?</h1>
        <p className="mt-1 text-gray-500">
          Chọn tình huống phù hợp với bạn — hướng dẫn ngắn gọn, từng bước, dành cho người đã quen Excel.
        </p>
      </div>

      {/* Guide cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {helpGuides.map((guide) => {
          const c = COLOR_MAP[guide.color as keyof typeof COLOR_MAP]
          return (
            <Link
              key={guide.slug}
              href={`/help/${guide.slug}`}
              className={`group block rounded-xl border-2 p-5 transition-all hover:shadow-md hover:-translate-y-0.5 ${c.card}`}
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl">{guide.icon}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${c.badge}`}>
                  <Clock className="h-3 w-3" />
                  {guide.readingTime}
                </span>
              </div>
              <h2 className="mt-3 font-semibold text-gray-900">{guide.title}</h2>
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">{guide.subtitle}</p>
              <div className={`mt-3 flex items-center gap-1 text-sm font-medium ${c.arrow} group-hover:gap-2 transition-all`}>
                Xem hướng dẫn <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          )
        })}
      </div>

      {/* Excel analogy banner */}
      <div className="mt-8 rounded-xl bg-amber-50 border border-amber-200 p-4">
        <p className="text-sm text-amber-800">
          <span className="font-semibold">Mẹo:</span>{" "}
          Nếu bạn đã dùng Excel để quản lý nhân sự — mọi thứ trong VietERP HRM đều có tương đương,
          nhưng tự động hơn và không bao giờ bị ghi đè nhầm.
        </p>
      </div>
    </div>
  )
}
