'use client'

import Link from 'next/link'
import {
  CalendarDays,
  ClipboardCheck,
  FileText,
  Settings,
  ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface QuickAction {
  icon: React.ReactNode
  label: string
  description: string
  href: string
  badge?: number
}

interface ESSQuickActionsProps {
  pendingApprovalsCount?: number
}

export function ESSQuickActions({ pendingApprovalsCount = 0 }: ESSQuickActionsProps) {
  const actions: QuickAction[] = [
    {
      icon: <CalendarDays className="h-5 w-5" />,
      label: 'Xin nghỉ phép',
      description: 'Tạo đơn xin nghỉ mới',
      href: '/ess/leave',
    },
    {
      icon: <ClipboardCheck className="h-5 w-5" />,
      label: 'Phê duyệt',
      description: 'Xem và duyệt đơn',
      href: '/ess/approvals',
      badge: pendingApprovalsCount,
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: 'Đơn của tôi',
      description: 'Xem lịch sử đơn',
      href: '/ess/leave/my-requests',
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: 'Cài đặt',
      description: 'Ủy quyền & cấu hình',
      href: '/ess/settings',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thao tác nhanh</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                  {action.icon}
                </div>
                <div>
                  <p className="font-medium">{action.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {action.badge !== undefined && action.badge > 0 && (
                  <span className="flex items-center justify-center h-6 min-w-[24px] px-2 text-xs font-medium text-white bg-red-500 rounded-full">
                    {action.badge}
                  </span>
                )}
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
