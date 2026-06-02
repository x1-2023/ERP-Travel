'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { ESSProfileCard, ESSQuickActions } from '@/components/ess'
import { LeaveBalanceCard } from '@/components/leave'

interface DashboardData {
  employee: {
    id: string
    employeeCode: string
    firstName: string
    lastName: string
    email: string
    avatarUrl?: string | null
    hireDate: string
    department?: { name: string } | null
    position?: { name: string } | null
    manager?: { firstName: string; lastName: string } | null
  }
  leaveBalances: Array<{
    id: string
    policyId: string
    year: number
    entitled: number
    used: number
    pending: number
    carried: number
    policy: {
      name: string
      leaveType: string
    }
  }>
  pendingApprovalsCount: number
  unreadNotificationsCount: number
}

export default function ESSPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch('/api/ess/dashboard')
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }
        const result = await response.json()
        setData(result.data ?? result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">{error || 'Không thể tải dữ liệu'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cổng thông tin nhân viên</h1>
        <p className="text-muted-foreground">
          Xin chào, {data.employee.firstName}! Đây là tổng quan thông tin của bạn.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ESSProfileCard employee={data.employee} />
        <ESSQuickActions pendingApprovalsCount={data.pendingApprovalsCount} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <LeaveBalanceCard balances={data.leaveBalances as never} />
      </div>
    </div>
  )
}
