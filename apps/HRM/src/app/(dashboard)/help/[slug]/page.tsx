import { notFound } from "next/navigation"
import Link from "next/link"
import { getGuideBySlug, getRelatedGuides, helpGuides } from "@/lib/content/help-guides"
import { ArrowLeft, ArrowRight, Lightbulb } from "lucide-react"

const COLOR_MAP = {
  blue:   { header: "bg-blue-600",   section: "border-blue-200 bg-blue-50/50" },
  green:  { header: "bg-green-600",  section: "border-green-200 bg-green-50/50" },
  purple: { header: "bg-purple-600", section: "border-purple-200 bg-purple-50/50" },
  orange: { header: "bg-orange-500", section: "border-orange-200 bg-orange-50/50" },
} as const

export function generateStaticParams() {
  return helpGuides.map((g) => ({ slug: g.slug }))
}

export default async function HelpGuidePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  if (!guide) notFound()

  const related = getRelatedGuides(slug)
  const c = COLOR_MAP[guide.color as keyof typeof COLOR_MAP]

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back */}
      <Link
        href="/help"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Tất cả hướng dẫn
      </Link>

      {/* Header card */}
      <div className={`rounded-xl text-white p-6 mb-6 ${c.header}`}>
        <div className="text-4xl mb-3">{guide.icon}</div>
        <h1 className="text-xl font-bold">{guide.title}</h1>
        <p className="mt-1 text-white/80 text-sm">{guide.subtitle}</p>
      </div>

      {/* Excel analogy */}
      <div className="flex gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4 mb-6">
        <span className="text-lg shrink-0">🧾</span>
        <div>
          <p className="text-xs font-semibold text-amber-700 mb-0.5">Bạn đã quen với Excel?</p>
          <p className="text-sm text-amber-800">{guide.excelAnalogy}</p>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {guide.sections.map((section, si) => (
          <div key={si} className={`rounded-xl border p-5 ${c.section}`}>
            <h2 className="font-semibold text-gray-800 mb-4">{section.title}</h2>
            <div className="space-y-4">
              {section.steps.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-xl shrink-0 mt-0.5">{step.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{step.title}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{step.description}</p>
                    {step.tip && (
                      <div className="flex items-start gap-1.5 mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-2.5 py-1.5">
                        <Lightbulb className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
                        {step.tip}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Related guides */}
      {related.length > 0 && (
        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
            Hướng dẫn liên quan
          </p>
          <div className="flex flex-col gap-2">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/help/${r.slug}`}
                className="flex items-center justify-between rounded-lg border bg-white px-4 py-3 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-2">
                  <span>{r.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{r.title}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
