"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, User, FileText, Briefcase, Wallet, ClipboardCheck } from "lucide-react"
import { formatCurrency } from "@/lib/utils/format"

interface SearchResults {
  employees: Array<{
    id: string; employeeCode: string; fullName: string;
    department: string; position: string; status: string; avatarInitials: string
  }>
  contracts: Array<{
    id: string; contractNo: string; employeeId: string;
    employeeName: string; type: string; status: string
  }>
  reports: Array<{
    id: string; type: string; status: string; employeeName: string
  }>
  recruitment: Array<{
    id: string; title: string; department: string;
    status: string; applicationCount: number
  }>
  advances: Array<{
    id: string; employeeName: string; amount: number; status: string
  }>
  totalCount: number
}

interface ResultItem {
  id: string
  label: string
  sublabel: string
  badge?: string
  href: string
  section: string
  icon: typeof Search
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Hoạt động",
  PROBATION: "Thử việc",
  RESIGNED: "Đã nghỉ",
  TERMINATED: "Sa thải",
  DRAFT: "Nháp",
  OPEN: "Đang tuyển",
  CLOSED: "Đã đóng",
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
}

const REPORT_TYPE_LABELS: Record<string, string> = {
  OVERTIME: "Tăng ca",
  BUSINESS_TRIP: "Công tác",
  LEAVE: "Nghỉ phép",
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Cmd+K / Ctrl+K listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === "Escape") {
        setOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery("")
      setResults(null)
      setSelectedIndex(0)
    }
  }, [open])

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults(null)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`)
        if (res.ok) {
          const data = await res.json()
          setResults(data)
          setSelectedIndex(0)
        }
      } catch {
        // Silent fail
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Build flat list of result items for keyboard nav
  const flatItems: ResultItem[] = []
  if (results) {
    for (const emp of results.employees) {
      flatItems.push({
        id: emp.id,
        label: emp.fullName,
        sublabel: `${emp.employeeCode}  ${emp.department}`,
        badge: STATUS_LABELS[emp.status] || emp.status,
        href: `/employees/${emp.id}`,
        section: "NHAN VIEN",
        icon: User,
      })
    }
    for (const c of results.contracts) {
      flatItems.push({
        id: c.id,
        label: c.contractNo,
        sublabel: `${c.employeeName}  ${c.type}`,
        badge: STATUS_LABELS[c.status] || c.status,
        href: `/employees/${c.employeeId}`,
        section: "HOP DONG",
        icon: FileText,
      })
    }
    for (const r of results.reports) {
      flatItems.push({
        id: r.id,
        label: REPORT_TYPE_LABELS[r.type] || r.type,
        sublabel: r.employeeName,
        badge: STATUS_LABELS[r.status] || r.status,
        href: `/reports/${r.id}`,
        section: "BAO CAO",
        icon: ClipboardCheck,
      })
    }
    for (const r of results.recruitment) {
      flatItems.push({
        id: r.id,
        label: r.title,
        sublabel: `${r.department}  ${r.applicationCount} UV`,
        badge: STATUS_LABELS[r.status] || r.status,
        href: `/recruitment/requisitions/${r.id}`,
        section: "TUYEN DUNG",
        icon: Briefcase,
      })
    }
    for (const a of results.advances) {
      flatItems.push({
        id: a.id,
        label: a.employeeName,
        sublabel: formatCurrency(a.amount),
        badge: STATUS_LABELS[a.status] || a.status,
        href: "/advances",
        section: "TAM UNG",
        icon: Wallet,
      })
    }
  }

  const handleSelect = useCallback(
    (item: ResultItem) => {
      setOpen(false)
      router.push(item.href)
    },
    [router]
  )

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, flatItems.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter" && flatItems[selectedIndex]) {
      handleSelect(flatItems[selectedIndex])
    }
  }

  if (!open) return null

  // Group items by section for display
  const sections: { label: string; items: (ResultItem & { index: number })[] }[] = []
  let currentSection = ""
  for (let i = 0; i < flatItems.length; i++) {
    const item = flatItems[i]
    if (item.section !== currentSection) {
      currentSection = item.section
      sections.push({ label: currentSection, items: [] })
    }
    sections[sections.length - 1].items.push({ ...item, index: i })
  }

  return (
    <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Palette */}
      <div
        className="absolute left-1/2 top-[15%] w-full max-w-lg -translate-x-1/2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-xl shadow-2xl border overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b">
            <Search className="h-5 w-5 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Tim kiem..."
              className="flex-1 text-sm outline-none bg-transparent placeholder:text-slate-400"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {loading && (
              <div className="h-4 w-4 animate-spin border-2 border-slate-300 border-t-slate-600 rounded-full" />
            )}
            <button
              onClick={() => setOpen(false)}
              className="text-xs text-slate-400 border rounded px-1.5 py-0.5 hover:bg-slate-50"
            >
              Esc
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto">
            {query.length < 2 && (
              <div className="px-4 py-8 text-center text-sm text-slate-400">
                {"Nhập ít nhất 2 ký tự để tìm kiếm"}
              </div>
            )}

            {query.length >= 2 && !loading && results && flatItems.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-slate-400">
                {"Không tìm thấy kết quả cho"} &quot;{query}&quot;
              </div>
            )}

            {sections.map((section) => (
              <div key={section.label}>
                <div className="px-4 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50">
                  {section.label}
                </div>
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isSelected = item.index === selectedIndex
                  return (
                    <button
                      key={item.id}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-slate-50 ${
                        isSelected ? "bg-slate-100" : ""
                      }`}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(item.index)}
                    >
                      <Icon className="h-4 w-4 text-slate-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">{item.label}</span>
                        <span className="ml-2 text-xs text-slate-400">{item.sublabel}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
