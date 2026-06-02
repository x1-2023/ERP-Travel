'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ArrowLeft, Target, Calendar, User, TrendingUp, ChevronRight, Plus } from 'lucide-react'
import { Goal, KeyResult } from '@/types/performance'
import { GOAL_TYPE, GOAL_STATUS, GOAL_PRIORITY } from '@/lib/performance/constants'

function KeyResultItem({ kr }: { kr: KeyResult }) {
  return (
    <div className="p-3 bg-zinc-800 rounded-lg border border-zinc-700">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-zinc-200">{kr.title}</span>
        <span className="text-xs text-zinc-500">{kr.currentValue}/{kr.targetValue} {kr.unit}</span>
      </div>
      <Progress value={kr.progress} className="h-1.5" />
      <div className="flex justify-between mt-1">
        <span className="text-xs text-zinc-600">Trọng số: {kr.weight}%</span>
        <span className="text-xs text-zinc-500">{kr.progress}%</span>
      </div>
    </div>
  )
}

export default function GoalDetailPage() {
  const params = useParams()
  const [goal, setGoal] = useState<Goal | null>(null)
  const [loading, setLoading] = useState(true)
  const [progressValue, setProgressValue] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    async function loadGoal() {
      try {
        const res = await fetch(`/api/performance/goals/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setGoal(data)
          setProgressValue(String(data.currentValue || 0))
        }
      } catch {
        // Handle error
      } finally {
        setLoading(false)
      }
    }
    loadGoal()
  }, [params.id])

  const handleUpdateProgress = async () => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/performance/goals/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentValue: Number(progressValue) }),
      })
      if (res.ok) {
        const updated = await res.json()
        setGoal(updated)
      }
    } catch {
      // Handle error
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64 bg-zinc-800" />
        <Skeleton className="h-64 bg-zinc-800" />
        <Skeleton className="h-48 bg-zinc-800" />
      </div>
    )
  }

  if (!goal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-zinc-500">
        <Target className="h-16 w-16 mb-4 text-zinc-700" />
        <p>Không tìm thấy mục tiêu</p>
        <Link href="/performance/goals">
          <Button variant="ghost" className="mt-4 text-amber-400">Quay lại</Button>
        </Link>
      </div>
    )
  }

  const typeInfo = GOAL_TYPE[goal.goalType as keyof typeof GOAL_TYPE]
  const statusInfo = GOAL_STATUS[goal.status as keyof typeof GOAL_STATUS]
  const priorityInfo = GOAL_PRIORITY[goal.priority as keyof typeof GOAL_PRIORITY]

  return (
    <div className="space-y-6 p-6 bg-zinc-950 min-h-screen text-zinc-100">
      <div className="flex items-center gap-4">
        <Link href="/performance/goals">
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-amber-400">{goal.title}</h1>
          <div className="flex gap-2 mt-1">
            {typeInfo && <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">{typeInfo.label}</Badge>}
            {statusInfo && <Badge variant="outline" className="border-zinc-700 text-zinc-300">{statusInfo.label}</Badge>}
            {priorityInfo && <Badge variant="outline" className="border-zinc-700 text-zinc-300">{priorityInfo.label}</Badge>}
          </div>
        </div>
      </div>

      {/* Goal Cascade */}
      {(goal.parentGoal || (goal.childGoals && goal.childGoals.length > 0)) && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-sm text-zinc-400">Cấu trúc mục tiêu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {goal.parentGoal && (
              <Link href={`/performance/goals/${goal.parentGoal.id}`} className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300">
                <ChevronRight className="h-3 w-3 rotate-180" />
                {goal.parentGoal.title}
              </Link>
            )}
            <div className="flex items-center gap-2 text-sm text-amber-400 font-medium pl-4">
              <Target className="h-3 w-3" />
              {goal.title}
            </div>
            {goal.childGoals?.map((child) => (
              <Link key={child.id} href={`/performance/goals/${child.id}`} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-300 pl-8">
                <ChevronRight className="h-3 w-3" />
                {child.title}
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100">Chi tiết</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {goal.description && (
                <p className="text-sm text-zinc-400">{goal.description}</p>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Calendar className="h-4 w-4" />
                  <span>Bắt đầu: {new Date(goal.startDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-500">
                  <Calendar className="h-4 w-4" />
                  <span>Kết thúc: {new Date(goal.endDate).toLocaleDateString('vi-VN')}</span>
                </div>
                {goal.owner && (
                  <div className="flex items-center gap-2 text-zinc-500">
                    <User className="h-4 w-4" />
                    <span>{goal.owner.fullName}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-zinc-500">
                  <TrendingUp className="h-4 w-4" />
                  <span>Trọng số: {goal.weight}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-zinc-100">Tiến độ</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-black">
                    Cập nhật
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border-zinc-800">
                  <DialogHeader>
                    <DialogTitle className="text-zinc-100">Cập nhật tiến độ</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">Giá trị hiện tại</label>
                      <Input
                        type="number"
                        value={progressValue}
                        onChange={(e) => setProgressValue(e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-zinc-100"
                      />
                    </div>
                    <Button onClick={handleUpdateProgress} disabled={updating} className="w-full bg-amber-500 hover:bg-amber-600 text-black">
                      {updating ? 'Đang lưu...' : 'Lưu'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">
                    {goal.currentValue || 0} / {goal.targetValue || 100} {goal.unit}
                  </span>
                  <span className="text-amber-400 font-bold">{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Key Results */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-zinc-100">Key Results</CardTitle>
              <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300">
                <Plus className="mr-1 h-3 w-3" /> Thêm
              </Button>
            </CardHeader>
            <CardContent>
              {goal.keyResults && goal.keyResults.length > 0 ? (
                <div className="space-y-3">
                  {goal.keyResults.map((kr) => (
                    <KeyResultItem key={kr.id} kr={kr} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-zinc-600">
                  <p>Chưa có key result nào</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-sm text-zinc-400">Thông tin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Loại</span>
                <span className="text-zinc-300">{typeInfo?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Trạng thái</span>
                <span className="text-zinc-300">{statusInfo?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Ưu tiên</span>
                <span className="text-zinc-300">{priorityInfo?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Trọng số</span>
                <span className="text-zinc-300">{goal.weight}%</span>
              </div>
              {goal.score !== undefined && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Điểm</span>
                  <span className="text-amber-400 font-bold">{goal.score}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-zinc-500">Tạo lúc</span>
                <span className="text-zinc-300">{new Date(goal.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </CardContent>
          </Card>

          {/* Child Goals */}
          {goal.childGoals && goal.childGoals.length > 0 && (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-sm text-zinc-400">Mục tiêu con ({goal.childGoals.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {goal.childGoals.map((child) => (
                  <Link key={child.id} href={`/performance/goals/${child.id}`} className="block p-2 rounded bg-zinc-800 hover:bg-zinc-750 transition-colors">
                    <p className="text-sm text-zinc-300 truncate">{child.title}</p>
                    <Progress value={child.progress} className="h-1 mt-1" />
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
