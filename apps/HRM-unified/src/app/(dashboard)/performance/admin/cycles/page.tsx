'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { RotateCcw, Plus } from 'lucide-react'
import { ReviewCycle } from '@/types/performance'
import { REVIEW_CYCLE_TYPE, REVIEW_CYCLE_STATUS } from '@/lib/performance/constants'

function ReviewCycleStatusBadge({ status }: { status: string }) {
  const info = REVIEW_CYCLE_STATUS[status as keyof typeof REVIEW_CYCLE_STATUS]
  const colorMap: Record<string, string> = {
    gray: 'bg-zinc-700 text-zinc-300',
    blue: 'bg-blue-500/20 text-blue-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    orange: 'bg-orange-500/20 text-orange-400',
    purple: 'bg-purple-500/20 text-purple-400',
    green: 'bg-green-500/20 text-green-400',
    red: 'bg-red-500/20 text-red-400',
  }

  return (
    <Badge className={colorMap[info?.color || 'gray'] || colorMap.gray}>
      {info?.label || status}
    </Badge>
  )
}

export default function CyclesPage() {
  const [cycles, setCycles] = useState<ReviewCycle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCycles() {
      try {
        const res = await fetch('/api/performance/cycles')
        if (res.ok) {
          const data = await res.json()
          setCycles(Array.isArray(data) ? data : data.data || [])
        }
      } catch {
        setCycles([])
      } finally {
        setLoading(false)
      }
    }
    loadCycles()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48 bg-zinc-800" />
        <Skeleton className="h-64 bg-zinc-800" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 bg-zinc-950 min-h-screen text-zinc-100">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-amber-400">Chu kỳ đánh giá</h1>
        <Link href="/performance/admin/cycles/new">
          <Button className="bg-amber-500 hover:bg-amber-600 text-black">
            <Plus className="mr-2 h-4 w-4" /> Tạo chu kỳ
          </Button>
        </Link>
      </div>

      {cycles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
          <RotateCcw className="h-16 w-16 mb-4 text-zinc-700" />
          <p className="text-lg">Chưa có chu kỳ đánh giá nào</p>
          <Link href="/performance/admin/cycles/new">
            <Button size="sm" className="mt-4 bg-amber-500 hover:bg-amber-600 text-black">
              <Plus className="mr-1 h-4 w-4" /> Tạo chu kỳ mới
            </Button>
          </Link>
        </div>
      ) : (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800">
                  <TableHead className="text-zinc-400">Tên</TableHead>
                  <TableHead className="text-zinc-400">Loại</TableHead>
                  <TableHead className="text-zinc-400">Năm</TableHead>
                  <TableHead className="text-zinc-400">Trạng thái</TableHead>
                  <TableHead className="text-zinc-400">Đánh giá</TableHead>
                  <TableHead className="text-zinc-400">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cycles.map((cycle) => {
                  const typeInfo = REVIEW_CYCLE_TYPE[cycle.cycleType as keyof typeof REVIEW_CYCLE_TYPE]
                  return (
                    <TableRow key={cycle.id} className="border-zinc-800">
                      <TableCell className="text-zinc-200 font-medium">{cycle.name}</TableCell>
                      <TableCell className="text-zinc-400">{typeInfo?.label || cycle.cycleType}</TableCell>
                      <TableCell className="text-zinc-400">{cycle.year}</TableCell>
                      <TableCell>
                        <ReviewCycleStatusBadge status={cycle.status} />
                      </TableCell>
                      <TableCell className="text-zinc-400">{cycle._count?.reviews || 0}</TableCell>
                      <TableCell>
                        <Link href={`/performance/admin/cycles/${cycle.id}`}>
                          <Button size="sm" variant="ghost" className="text-amber-400 hover:text-amber-300">
                            Chi tiết
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
