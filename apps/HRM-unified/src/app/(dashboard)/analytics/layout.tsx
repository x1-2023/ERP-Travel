// src/app/(dashboard)/analytics/layout.tsx
// Analytics Layout with Horizontal Tab Navigation

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LayoutDashboard,
  Users,
  FileText,
  Bell,
  BarChart3,
  UserMinus,
  PieChart,
  Brain,
  UserSearch,
  Calendar,
  FileBarChart,
  FilePlus,
  AlertTriangle,
  Settings,
  ChevronDown,
} from 'lucide-react'

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  children?: { title: string; href: string; icon: React.ElementType }[]
}

const navItems: NavItem[] = [
  {
    title: 'Tổng quan',
    href: '/analytics',
    icon: LayoutDashboard,
  },
  {
    title: 'Executive',
    href: '/analytics/executive',
    icon: BarChart3,
  },
  {
    title: 'Nhân sự',
    href: '/analytics/workforce',
    icon: Users,
    children: [
      { title: 'Tổng quan', href: '/analytics/workforce', icon: Users },
      { title: 'Số lượng', href: '/analytics/workforce/headcount', icon: PieChart },
      { title: 'Nghỉ việc', href: '/analytics/workforce/turnover', icon: UserMinus },
      { title: 'Nhân khẩu học', href: '/analytics/workforce/demographics', icon: BarChart3 },
    ],
  },
  {
    title: 'Dự đoán',
    href: '/analytics/predictive',
    icon: Brain,
    children: [
      { title: 'Tổng quan', href: '/analytics/predictive', icon: Brain },
      { title: 'Nguy cơ nghỉ việc', href: '/analytics/predictive/turnover-risk', icon: UserSearch },
      { title: 'Dự báo tuyển dụng', href: '/analytics/predictive/hiring-forecast', icon: Calendar },
    ],
  },
  {
    title: 'Báo cáo',
    href: '/analytics/reports',
    icon: FileText,
    children: [
      { title: 'Thư viện', href: '/analytics/reports', icon: FileBarChart },
      { title: 'Tạo báo cáo', href: '/analytics/reports/builder', icon: FilePlus },
    ],
  },
  {
    title: 'Cảnh báo',
    href: '/analytics/alerts',
    icon: Bell,
    children: [
      { title: 'Danh sách', href: '/analytics/alerts', icon: AlertTriangle },
      { title: 'Cấu hình', href: '/analytics/alerts/settings', icon: Settings },
    ],
  },
]

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/analytics') {
      return pathname === '/analytics'
    }
    return pathname.startsWith(href)
  }

  const isChildActive = (item: NavItem) => {
    if (!item.children) return false
    return item.children.some(child => pathname === child.href)
  }

  return (
    <div className="space-y-4">
      {/* Horizontal Tab Navigation */}
      <div className="bg-card border rounded-lg">
        <ScrollArea className="w-full">
          <div className="flex items-center gap-1 p-2">
            {navItems.map((item) => (
              <div key={item.title}>
                {item.children ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant={isActive(item.href) || isChildActive(item) ? 'secondary' : 'ghost'}
                        size="sm"
                        className={cn(
                          'gap-2 whitespace-nowrap',
                          (isActive(item.href) || isChildActive(item)) && 'bg-primary/10 text-primary hover:bg-primary/20'
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{item.title}</span>
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      {item.children.map((child) => (
                        <DropdownMenuItem key={child.href} asChild>
                          <Link
                            href={child.href}
                            className={cn(
                              'flex items-center gap-2 cursor-pointer',
                              pathname === child.href && 'bg-primary/10 text-primary'
                            )}
                          >
                            <child.icon className="h-4 w-4" />
                            {child.title}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link href={item.href}>
                    <Button
                      variant={isActive(item.href) ? 'secondary' : 'ghost'}
                      size="sm"
                      className={cn(
                        'gap-2 whitespace-nowrap',
                        isActive(item.href) && 'bg-primary/10 text-primary hover:bg-primary/20'
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{item.title}</span>
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div>
        {children}
      </div>
    </div>
  )
}
