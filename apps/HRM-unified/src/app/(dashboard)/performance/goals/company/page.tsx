'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Building2, Target, ChevronDown, ChevronRight } from 'lucide-react'
import { Goal } from '@/types/performance'
import { GOAL_STATUS } from '@/lib/performance/constants'

function GoalCascadeItem({ goal, level = 0 }: { goal: Goal; level?: number }) {
  const [expanded, setExpanded] = useState(level < 2)
  const statusInfo = GOAL_STATUS[goal.status as keyof typeof GOAL_STATUS]
  const hasChildren = goal.childGoals && goal.childGoals.length > 0

  return (
    <div className="space-y-1">
      <div
        className="flex items-center gap-2 p-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:border-zinc-600 transition-colors"
        style={{ marginLeft: `${level * 24}px` }}
      >
        {hasChildren ? (
          <button onClick={() => setExpanded(!expanded)} className="text-zinc-500 hover:text-zinc-300">
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        ) : (
          <div className="w-4" />
        )}
        <Target className="h-4 w-4 text-amber-400 shrink-0" />
        <Link href={`/performance/goals/${goal.id}`} className="flex-1 min-w-0">
          <span className="text-sm font-medium text-zinc-200 hover:text-amber-400 truncate block">{goal.title}</span>
        </Link>
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-24">
            <Progress value={goal.progress} className="h-1.5" />
          </div>
          <span className="text-xs text-zinc-500 w-10 text-right">{goal.progress}%</span>
          <Badge variant="outline" className="text-xs border-zinc-700">
            {statusInfo?.label || goal.status}
          </Badge>
        </div>
      </div>
      {expanded && hasChildren && (
        <div className="space-y-1">
          {goal.childGoals!.map((child) => (
            <GoalCascadeItem key={child.id} goal={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function CompanyOKRsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadGoals() {
      try {
        const res = await fetch('/api/performance/goals?goalType=COMPANY&includeChildren=true')
        if (res.ok) {
          const data = await res.json()
          setGoals(Array.isArray(data) ? data : data.goals || [])
        }
      } catch {
        setGoals([])
      } finally {
        setLoading(false)
      }
    }
    loadGoals()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64 bg-zinc-800" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-14 bg-zinc-800" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 bg-zinc-950 min-h-screen text-zinc-100">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-amber-400">OKRs Công ty</h1>
      </div>

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
          <Building2 className="h-16 w-16 mb-4 text-zinc-700" />
          <p className="text-lg">Chưa có OKRs công ty</p>
          <p className="text-sm text-zinc-600 mt-1">Các mục tiêu cấp công ty sẽ hiển thị ở đây</p>
        </div>
      ) : (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Cấu trúc OKRs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {goals.map((goal) => (
              <GoalCascadeItem key={goal.id} goal={goal} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
