"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Clock, FileText, UserCircle } from "lucide-react"

const tabs = [
  { label: "Chấm Công", href: "/portal/checkin", icon: Clock },
  { label: "Đơn Từ", href: "/portal/reports", icon: FileText },
  { label: "Hồ Sơ", href: "/portal/profile", icon: UserCircle },
]

export function BottomTabs() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t flex justify-around"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href)
        const Icon = tab.icon
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center gap-1 py-2 px-4 text-xs transition-colors ${
              active ? "font-medium" : "text-muted-foreground"
            }`}
            style={active ? { color: "#1E3A5F" } : undefined}
          >
            <Icon className="h-5 w-5" />
            <span>{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
