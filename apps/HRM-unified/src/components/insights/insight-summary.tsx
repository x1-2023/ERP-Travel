'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { InsightCounts } from '@/types/insight'
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react'

interface InsightSummaryProps {
  counts: InsightCounts
}

export function InsightSummary({ counts }: InsightSummaryProps) {
  const items = [
    {
      label: 'Nghiêm trọng',
      count: counts.critical,
      icon: AlertTriangle,
      className: 'text-red-500',
      bgClass: 'bg-red-50',
    },
    {
      label: 'Cao',
      count: counts.high,
      icon: AlertCircle,
      className: 'text-orange-500',
      bgClass: 'bg-orange-50',
    },
    {
      label: 'Trung bình',
      count: counts.medium,
      icon: Info,
      className: 'text-yellow-500',
      bgClass: 'bg-yellow-50',
    },
    {
      label: 'Thấp',
      count: counts.low,
      icon: CheckCircle,
      className: 'text-blue-500',
      bgClass: 'bg-blue-50',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tổng quan Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.label}
              className={`p-4 rounded-lg ${item.bgClass} flex items-center gap-3`}
            >
              <item.icon className={`h-8 w-8 ${item.className}`} />
              <div>
                <p className="text-2xl font-bold">{item.count}</p>
                <p className="text-sm text-muted-foreground">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Tổng cộng: <span className="font-medium">{counts.total}</span> insights
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
