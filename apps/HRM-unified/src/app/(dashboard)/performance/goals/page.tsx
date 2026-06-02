'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Target, Plus, Search, Filter } from 'lucide-react'
import { Goal } from '@/types/performance'
import { GOAL_TYPE, GOAL_STATUS, GOAL_PRIORITY } from '@/lib/performance/constants'

function GoalCard({ goal }: { goal: Goal }) {
  const typeInfo = GOAL_TYPE[goal.goalType as keyof typeof GOAL_TYPE]
  const statusInfo = GOAL_STATUS[goal.status as keyof typeof GOAL_STATUS]
  const priorityInfo = GOAL_PRIORITY[goal.priority as keyof typeof GOAL_PRIORITY]

  return (
    <Link href={`/performance/goals/${goal.id}`}>
      <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-medium text-zinc-100 line-clamp-2">{goal.title}</CardTitle>
            <Badge variant="outline" className="ml-2 text-xs shrink-0" style={{ color: statusInfo?.color === 'green' ? '#22c55e' : statusInfo?.color === 'blue' ? '#3b82f6' : '#a1a1aa' }}>
              {statusInfo?.label || goal.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            {typeInfo && <Badge variant="secondary" className="text-xs bg-zinc-800">{typeInfo.label}</Badge>}
            {priorityInfo && <Badge variant="secondary" className="text-xs bg-zinc-800">{priorityInfo.label}</Badge>}
          </div>
          <div>
            <div className="flex justify-between text-xs text-zinc-500 mb-1">
              <span>Tiến độ</span>
              <span>{goal.progress}%</span>
            </div>
            <Progress value={goal.progress} className="h-2" />
          </div>
          {goal.owner && (
            <p className="text-xs text-zinc-500">{goal.owner.fullName}</p>
          )}
          <div className="flex justify-between text-xs text-zinc-600">
            <span>{new Date(goal.startDate).toLocaleDateString('vi-VN')}</span>
            <span>{new Date(goal.endDate).toLocaleDateString('vi-VN')}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('my')
  const [goalType, setGoalType] = useState<string>('ALL')
  const [status, setStatus] = useState<string>('ALL')
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadGoals() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (goalType !== 'ALL') params.set('goalType', goalType)
        if (status !== 'ALL') params.set('status', status)
        if (search) params.set('search', search)
        if (tab === 'team') params.set('scope', 'team')
        if (tab === 'company') params.set('goalType', 'COMPANY')

        const res = await fetch(`/api/performance/goals?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          setGoals(Array.isArray(data) ? data : data.data || [])
        }
      } catch {
        setGoals([])
      } finally {
        setLoading(false)
      }
    }
    loadGoals()
  }, [tab, goalType, status, search])

  return (
    <div className="space-y-6 p-6 bg-zinc-950 min-h-screen text-zinc-100">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-amber-400">Mục tiêu</h1>
        <Link href="/performance/goals/new">
          <Button className="bg-amber-500 hover:bg-amber-600 text-black">
            <Plus className="mr-2 h-4 w-4" /> Tạo mục tiêu
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Tìm kiếm mục tiêu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-100"
          />
        </div>
        <Select value={goalType} onValueChange={setGoalType}>
          <SelectTrigger className="w-[160px] bg-zinc-900 border-zinc-800 text-zinc-100">
            <SelectValue placeholder="Loại mục tiêu" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            <SelectItem value="ALL">Tất cả loại</SelectItem>
            {Object.entries(GOAL_TYPE).map(([key, val]) => (
              <SelectItem key={key} value={key}>{val.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[160px] bg-zinc-900 border-zinc-800 text-zinc-100">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            <SelectItem value="ALL">Tất cả</SelectItem>
            {Object.entries(GOAL_STATUS).map(([key, val]) => (
              <SelectItem key={key} value={key}>{val.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="my" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-amber-400">
            Mục tiêu của tôi
          </TabsTrigger>
          <TabsTrigger value="team" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-amber-400">
            Mục tiêu team
          </TabsTrigger>
          <TabsTrigger value="company" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-amber-400">
            Công ty
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-48 bg-zinc-800" />
              ))}
            </div>
          ) : goals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <Target className="h-16 w-16 mb-4 text-zinc-700" />
              <p className="text-lg">Chưa có mục tiêu nào</p>
              <Link href="/performance/goals/new">
                <Button size="sm" className="mt-4 bg-amber-500 hover:bg-amber-600 text-black">
                  <Plus className="mr-1 h-4 w-4" /> Tạo mục tiêu mới
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
