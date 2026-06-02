'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, FileText, Settings, Users, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Stats {
  totalPolicies: number
  pendingRequests: number
  approvedThisMonth: number
}

export default function LeaveAdminPage() {
  const [stats, setStats] = useState<Stats>({
    totalPolicies: 0,
    pendingRequests: 0,
    approvedThisMonth: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [policiesRes, requestsRes] = await Promise.all([
          fetch('/api/leave/policies'),
          fetch('/api/leave/requests?status=PENDING'),
        ])

        let totalPolicies = 0
        let pendingRequests = 0

        if (policiesRes.ok) {
          const data = await policiesRes.json()
          totalPolicies = data.data?.length || 0
        }

        if (requestsRes.ok) {
          const data = await requestsRes.json()
          pendingRequests = data.meta?.total ?? data.pagination?.total ?? data.data?.length ?? 0
        }

        setStats({
          totalPolicies,
          pendingRequests,
          approvedThisMonth: 0,
        })
      } catch {
        // Ignore errors
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const adminCards = [
    {
      title: 'Chính sách nghỉ phép',
      description: 'Quản lý các loại phép và quy định',
      icon: <FileText className="h-6 w-6" />,
      href: '/leave-admin/policies',
      stat: `${stats.totalPolicies} chính sách`,
    },
    {
      title: 'Đơn xin nghỉ',
      description: 'Xem và quản lý tất cả đơn nghỉ',
      icon: <Users className="h-6 w-6" />,
      href: '/leave-admin/requests',
      stat: `${stats.pendingRequests} chờ duyệt`,
    },
    {
      title: 'Cấu hình',
      description: 'Thiết lập workflow và quy trình',
      icon: <Settings className="h-6 w-6" />,
      href: '/leave-admin/settings',
      stat: 'Workflow',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quản lý nghỉ phép</h1>
        <p className="text-muted-foreground">
          Quản lý chính sách, đơn nghỉ và cấu hình hệ thống
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {adminCards.map((card) => (
          <Card key={card.href}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  {card.icon}
                </div>
                <span className="text-sm text-muted-foreground">{card.stat}</span>
              </div>
              <CardTitle className="mt-4">{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link href={card.href}>
                  Quản lý
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
