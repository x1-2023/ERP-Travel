'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { APPLICATION_STATUS } from '@/lib/recruitment/constants'

interface FunnelStage {
  stage: string
  count: number
}

interface HiringFunnelProps {
  data: FunnelStage[]
  title?: string
}

export function HiringFunnel({ data, title = 'Phễu tuyển dụng' }: HiringFunnelProps) {
  const stages = useMemo(() => {
    // Define pipeline order
    const stageOrder = [
      'NEW',
      'SCREENING',
      'PHONE_SCREEN',
      'INTERVIEW',
      'ASSESSMENT',
      'OFFER',
      'HIRED',
    ]

    // Map and sort data
    const orderedStages = stageOrder
      .map((stageId) => {
        const stageData = data.find((d) => d.stage === stageId)
        return {
          id: stageId,
          label: APPLICATION_STATUS[stageId]?.label || stageId,
          count: stageData?.count || 0,
        }
      })
      .filter((s) => s.count > 0 || stageOrder.indexOf(s.id) <= 2) // Always show first 3

    return orderedStages
  }, [data])

  const maxCount = Math.max(...stages.map((s) => s.count), 1)

  const getStageColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-blue-400',
      'bg-yellow-400',
      'bg-purple-400',
      'bg-indigo-400',
      'bg-green-400',
      'bg-emerald-500',
    ]
    return colors[index] || colors[colors.length - 1]
  }

  const getConversionRate = (currentCount: number, previousCount: number) => {
    if (previousCount === 0) return 0
    return Math.round((currentCount / previousCount) * 100)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stages.map((stage, index) => {
            const widthPercentage = Math.max((stage.count / maxCount) * 100, 10)
            const prevCount = index > 0 ? stages[index - 1].count : stage.count
            const conversionRate = getConversionRate(stage.count, prevCount)

            return (
              <div key={stage.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-medium">
                    {stage.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{stage.count}</span>
                    {index > 0 && prevCount > 0 && (
                      <span
                        className={`text-xs ${
                          conversionRate >= 50
                            ? 'text-green-600'
                            : conversionRate >= 25
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        ({conversionRate}%)
                      </span>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-100 rounded-full h-8 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${getStageColor(
                        index
                      )} flex items-center`}
                      style={{
                        width: `${widthPercentage}%`,
                        marginLeft: `${((100 - widthPercentage) / 2)}%`,
                      }}
                    />
                  </div>
                </div>
                {index < stages.length - 1 && (
                  <div className="flex justify-center">
                    <svg
                      className="w-4 h-3 text-muted-foreground/40"
                      viewBox="0 0 16 12"
                      fill="currentColor"
                    >
                      <path d="M8 12L0 0h16L8 12z" />
                    </svg>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Summary stats */}
        <div className="mt-6 pt-4 border-t grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {stages[0]?.count || 0}
            </p>
            <p className="text-xs text-muted-foreground">Tổng ứng viên</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {stages[stages.length - 1]?.count || 0}
            </p>
            <p className="text-xs text-muted-foreground">Đã tuyển</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">
              {stages[0]?.count > 0
                ? `${Math.round(
                    ((stages[stages.length - 1]?.count || 0) / stages[0].count) * 100
                  )}%`
                : '0%'}
            </p>
            <p className="text-xs text-muted-foreground">Tỷ lệ tuyển</p>
          </div>
        </div>

        {/* Rejected count if available */}
        {data.find((d) => d.stage === 'REJECTED') && (
          <div className="mt-3 p-2 bg-red-50 rounded-lg flex items-center justify-between">
            <span className="text-xs text-red-700">Từ chối / Rút hồ sơ:</span>
            <span className="text-sm font-bold text-red-700">
              {data.find((d) => d.stage === 'REJECTED')?.count || 0}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
