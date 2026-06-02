"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Users,
  Clock,
  CheckSquare,
  MoreHorizontal,
  ChevronRight,
  Calendar,
  Wallet,
  BarChart3,
  Settings,
  MessageSquare,
  Bell,
  User,
  Gauge,
  FileText,
} from "lucide-react"

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
  badge?: number
  matchPaths?: string[]
}

const mobileNavItems: NavItem[] = [
  {
    href: "/",
    icon: LayoutDashboard,
    label: "Tổng quan",
    matchPaths: ["/", "/dashboard"],
  },
  {
    href: "/attendance",
    icon: Clock,
    label: "Chấm công",
    matchPaths: ["/attendance"],
  },
  {
    href: "/ess/leave",
    icon: Calendar,
    label: "Nghỉ phép",
    matchPaths: ["/ess/leave", "/leave"],
  },
  {
    href: "/ess/approvals",
    icon: CheckSquare,
    label: "Phê duyệt",
    matchPaths: ["/ess/approvals", "/approvals"],
  },
]

const moreItems: NavItem[] = [
  { href: "/command-center", icon: Gauge, label: "Command Center" },
  { href: "/employees", icon: Users, label: "Nhân viên" },
  { href: "/payroll/periods", icon: Wallet, label: "Bảng lương" },
  { href: "/analytics/executive", icon: BarChart3, label: "Phân tích" },
  { href: "/ai", icon: MessageSquare, label: "AI Assistant" },
  { href: "/notifications", icon: Bell, label: "Thông báo" },
  { href: "/reports", icon: FileText, label: "Báo cáo" },
  { href: "/ess", icon: User, label: "Hồ sơ cá nhân" },
  { href: "/ess/settings", icon: Settings, label: "Cài đặt" },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = React.useState(false)
  const [pendingApprovals, setPendingApprovals] = React.useState(0)
  const [unreadNotifications, setUnreadNotifications] = React.useState(0)

  // Fetch badge counts
  React.useEffect(() => {
    const fetchBadges = async () => {
      try {
        const [approvalsRes, notifRes] = await Promise.all([
          fetch('/api/approvals/pending?countOnly=true').catch(() => null),
          fetch('/api/notifications/unread-count').catch(() => null),
        ])

        if (approvalsRes?.ok) {
          const data = await approvalsRes.json()
          setPendingApprovals(data.count || 0)
        }

        if (notifRes?.ok) {
          const data = await notifRes.json()
          setUnreadNotifications(data.count || 0)
        }
      } catch {
        // Silent fail
      }
    }

    fetchBadges()
    const interval = setInterval(fetchBadges, 60000)
    return () => clearInterval(interval)
  }, [])

  const isActive = (item: NavItem) => {
    if (item.matchPaths) {
      return item.matchPaths.some((path) =>
        path === "/" ? pathname === "/" : pathname.startsWith(path)
      )
    }
    return pathname.startsWith(item.href)
  }

  // Add badges to nav items
  const navItemsWithBadges = mobileNavItems.map((item) => {
    if (item.href === "/approvals") {
      return { ...item, badge: pendingApprovals }
    }
    return item
  })

  const moreItemsWithBadges = moreItems.map((item) => {
    if (item.href === "/notifications") {
      return { ...item, badge: unreadNotifications }
    }
    return item
  })

  const totalMoreBadges = moreItemsWithBadges.reduce((sum, item) => sum + (item.badge || 0), 0)

  return (
    <>
      {/* Spacer to prevent content from being hidden */}
      <div className="h-16 md:hidden" />

      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="bg-card/95 backdrop-blur-lg border-t border-border shadow-lg">
          <div className="flex items-center justify-around h-16 px-2 pb-safe">
            {navItemsWithBadges.map((item) => {
              const active = isActive(item)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl",
                    "transition-all duration-200 touch-manipulation active:scale-95",
                    active
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <div className="relative">
                    <item.icon
                      className={cn(
                        "w-5 h-5 transition-transform duration-200",
                        active && "scale-110"
                      )}
                    />
                    {item.badge !== undefined && item.badge > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1.5 -right-2 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center"
                      >
                        {item.badge > 99 ? '99+' : item.badge}
                      </Badge>
                    )}
                  </div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              )
            })}

            {/* More menu */}
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl",
                "transition-all duration-200 touch-manipulation active:scale-95",
                "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <div className="relative">
                <MoreHorizontal className="w-5 h-5" />
                {totalMoreBadges > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1.5 -right-2 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center"
                  >
                    {totalMoreBadges > 99 ? '99+' : totalMoreBadges}
                  </Badge>
                )}
              </div>
              <span className="text-[10px] font-medium">Thêm</span>
            </button>
          </div>
        </div>
      </nav>

      {/* More menu sheet */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-2xl animate-slide-in-up max-h-[70vh] overflow-hidden">
            <div className="py-4 px-4 pb-safe">
              {/* Handle bar */}
              <div className="w-12 h-1 bg-border rounded-full mx-auto mb-4" />

              {/* Grid menu */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                {moreItemsWithBadges.slice(0, 8).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-xl transition-all",
                      "touch-manipulation active:scale-95",
                      "hover:bg-muted/50",
                      pathname.startsWith(item.href) && "bg-primary/10 text-primary"
                    )}
                  >
                    <div className="relative p-3 rounded-full bg-muted">
                      <item.icon className="w-5 h-5" />
                      {item.badge !== undefined && item.badge > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-[10px]"
                        >
                          {item.badge > 99 ? '99+' : item.badge}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs font-medium text-center">{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Additional items list */}
              {moreItemsWithBadges.length > 8 && (
                <nav className="space-y-1 border-t pt-4">
                  {moreItemsWithBadges.slice(8).map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-muted/50 transition-colors touch-manipulation active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium text-sm">{item.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  ))}
                </nav>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
