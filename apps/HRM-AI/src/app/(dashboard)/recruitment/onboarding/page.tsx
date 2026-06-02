'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Users, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingPage } from '@/components/shared/loading-spinner'
import { ONBOARDING_STATUS } from '@/lib/recruitment/constants'

interface OnboardingItem {
  id: string
  employeeName: string
  position: string
  department: string
  startDate: string
  status: string
  progress: number
  totalTasks: number
  completedTasks: number
  buddyName: string | null
}

export default function OnboardingPage() {
  const [onboardings, setOnboardings] = useState<OnboardingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOnboardings() {
      try {
        const res = await fetch('/api/recruitment/onboarding')
        if (!res.ok) throw new Error('Không thể tải danh sách onboarding')
        const json = await res.json()
        const result = json.data ?? json
        setOnboardings(Array.isArray(result) ? result : result.onboardings ?? [])
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
      } finally {
        setLoading(false)
      }
    }
    fetchOnboardings()
  }, [])

  const getStatusBadge = (status: string) => {
    const info = ONBOARDING_STATUS[status]
    if (!info) return <Badge variant="secondary">{status}</Badge>
    const colorMap: Record<string, string> = {
      gray: 'bg-gray-100 text-gray-800',
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
    }
    return <Badge className={colorMap[info.color] || ''}>{info.label}</Badge>
  }

  if (loading) return <LoadingPage />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Onboarding"
        description="Quản lý quy trình onboarding nhân viên mới"
      >
        <div className="flex gap-2">
          <Link href="/recruitment/onboarding/templates">
            <Button variant="outline">
              Quản lý template
            </Button>
          </Link>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Bắt đầu onboarding mới
          </Button>
        </div>
      </PageHeader>

      {error ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {error}
          </CardContent>
        </Card>
      ) : onboardings.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Chưa có quy trình onboarding nào
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {onboardings.map((onboarding) => (
            <Link key={onboarding.id} href={`/recruitment/onboarding/${onboarding.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{onboarding.employeeName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{onboarding.position}</p>
                    </div>
                    {getStatusBadge(onboarding.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <p>{onboarding.department}</p>
                    <p>Bắt đầu: {new Date(onboarding.startDate).toLocaleDateString('vi-VN')}</p>
                    {onboarding.buddyName && (
                      <p className="flex items-center gap-1 mt-1">
                        <Users className="h-3 w-3" />
                        Buddy: {onboarding.buddyName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tiến độ</span>
                      <span className="font-medium flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {onboarding.completedTasks}/{onboarding.totalTasks}
                      </span>
                    </div>
                    <Progress value={onboarding.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-right">
                      {onboarding.progress}%
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
