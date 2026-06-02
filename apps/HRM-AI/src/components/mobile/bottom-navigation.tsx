'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Home,
  Clock,
  Calendar,
  CheckSquare,
  User,
  MoreHorizontal,
  MessageSquare,
  FileText,
  Bell,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useState, useEffect } from 'react'

interface NavItem {
  href: string
  icon: React.ReactNode
  label: string
  badge?: number
  matchPaths?: string[]
}

const mainNavItems: NavItem[] = [
  {
    href: '/',
    icon: <Home className="h-5 w-5" />,
    label: 'Trang chủ',
    matchPaths: ['/', '/dashboard'],
  },
  {
    href: '/attendance',
    icon: <Clock className="h-5 w-5" />,
    label: 'Chấm công',
    matchPaths: ['/attendance'],
  },
  {
    href: '/leave',
    icon: <Calendar className="h-5 w-5" />,
    label: 'Nghỉ phép',
    matchPaths: ['/leave'],
  },
  {
    href: '/approvals',
    icon: <CheckSquare className="h-5 w-5" />,
    label: 'Phê duyệt',
    matchPaths: ['/approvals'],
  },
]

const moreNavItems: NavItem[] = [
  {
    href: '/ai',
    icon: <MessageSquare className="h-5 w-5" />,
    label: 'AI Assistant',
  },
  {
    href: '/payslip',
    icon: <FileText className="h-5 w-5" />,
    label: 'Phiếu lương',
  },
  {
    href: '/notifications',
    icon: <Bell className="h-5 w-5" />,
    label: 'Thông báo',
  },
  {
    href: '/profile',
    icon: <User className="h-5 w-5" />,
    label: 'Hồ sơ',
  },
  {
    href: '/settings',
    icon: <Settings className="h-5 w-5" />,
    label: 'Cài đặt',
  },
]

function NavItemButton({
  item,
  isActive,
  onClick,
}: {
  item: NavItem
  isActive: boolean
  onClick?: () => void
}) {
  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-0.5 py-2 px-3 rounded-lg transition-all',
        'active:scale-95 touch-manipulation',
        isActive
          ? 'text-primary bg-primary/10'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      )}
      onClick={onClick}
    >
      <div className="relative">
        {item.icon}
        {item.badge !== undefined && item.badge > 0 && (
          <Badge
            className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center"
            variant="destructive"
          >
            {item.badge > 99 ? '99+' : item.badge}
          </Badge>
        )}
      </div>
      <span className="text-[10px] font-medium leading-tight">{item.label}</span>
    </div>
  )

  if (onClick) {
    return <button className="flex-1">{content}</button>
  }

  return (
    <Link href={item.href} className="flex-1">
      {content}
    </Link>
  )
}

export function BottomNavigation() {
  const pathname = usePathname()
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [pendingApprovals, setPendingApprovals] = useState(0)
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  // Fetch badges
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const [approvalsRes, notifRes] = await Promise.all([
          fetch('/api/approvals/pending?countOnly=true'),
          fetch('/api/notifications/unread-count'),
        ])

        if (approvalsRes.ok) {
          const data = await approvalsRes.json()
          setPendingApprovals(data.count || 0)
        }

        if (notifRes.ok) {
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
        path === '/' ? pathname === '/' : pathname.startsWith(path)
      )
    }
    return pathname.startsWith(item.href)
  }

  // Add badges to nav items
  const navItemsWithBadges = mainNavItems.map((item) => {
    if (item.href === '/approvals') {
      return { ...item, badge: pendingApprovals }
    }
    return item
  })

  const moreItemsWithBadges = moreNavItems.map((item) => {
    if (item.href === '/notifications') {
      return { ...item, badge: unreadNotifications }
    }
    return item
  })

  const totalMoreBadges = moreItemsWithBadges.reduce((acc, item) => acc + (item.badge || 0), 0)

  return (
    <>
      {/* Spacer to prevent content from being hidden behind nav */}
      <div className="h-16 md:hidden" />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        {/* Safe area background */}
        <div className="absolute inset-0 bg-background/95 backdrop-blur-lg border-t shadow-lg" />

        {/* Navigation items */}
        <div className="relative flex items-center justify-around px-2 pb-safe">
          {navItemsWithBadges.map((item) => (
            <NavItemButton
              key={item.href}
              item={item}
              isActive={isActive(item)}
            />
          ))}

          {/* More menu */}
          <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
            <SheetTrigger asChild>
              <div className="flex-1">
                <NavItemButton
                  item={{
                    href: '#',
                    icon: <MoreHorizontal className="h-5 w-5" />,
                    label: 'Thêm',
                    badge: totalMoreBadges,
                  }}
                  isActive={false}
                  onClick={() => setIsMoreOpen(true)}
                />
              </div>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto max-h-[70vh] rounded-t-2xl">
              <SheetHeader className="pb-4">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-4 gap-4 pb-8">
                {moreItemsWithBadges.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMoreOpen(false)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-3 rounded-xl transition-all',
                      'active:scale-95 touch-manipulation',
                      'hover:bg-muted/50',
                      isActive(item) && 'bg-primary/10 text-primary'
                    )}
                  >
                    <div className="relative p-3 rounded-full bg-muted">
                      {item.icon}
                      {item.badge !== undefined && item.badge > 0 && (
                        <Badge
                          className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-[10px]"
                          variant="destructive"
                        >
                          {item.badge > 99 ? '99+' : item.badge}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </>
  )
}
