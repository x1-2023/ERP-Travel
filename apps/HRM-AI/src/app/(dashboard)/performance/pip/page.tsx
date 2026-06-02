'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, Plus } from 'lucide-react'
import { PIP } from '@/types/performance'
import { PIP_STATUS } from '@/lib/performance/constants'

function PIPStatusBadge({ status }: { status: string }) {
  const info = PIP_STATUS[status as keyof typeof PIP_STATUS]
  const colorMap: Record<string, string> = {
    gray: 'bg-zinc-700 text-zinc-300',
    blue: 'bg-blue-500/20 text-blue-400',
    orange: 'bg-orange-500/20 text-orange-400',
    green: 'bg-green-500/20 text-green-400',
    red: 'bg-red-500/20 text-red-400',
  }

  return (
    <Badge className={colorMap[info?.color || 'gray'] || colorMap.gray}>
      {info?.label || status}
    </Badge>
  )
}

export default function PIPPage() {
  const [pips, setPips] = useState<PIP[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPIPs() {
      try {
        const res = await fetch('/api/performance/pip')
        if (res.ok) {
          const data = await res.json()
          setPips(Array.isArray(data) ? data : data.data || [])
        }
      } catch {
        setPips([])
      } finally {
        setLoading(false)
      }
    }
    loadPIPs()
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
        <h1 className="text-2xl font-bold text-amber-400">Performance Improvement Plan (PIP)</h1>
        <Button className="bg-amber-500 hover:bg-amber-600 text-black">
          <Plus className="mr-2 h-4 w-4" /> Tạo PIP
        </Button>
      </div>

      {pips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
          <AlertTriangle className="h-16 w-16 mb-4 text-zinc-700" />
          <p className="text-lg">Không có PIP nào</p>
          <p className="text-sm text-zinc-600 mt-1">Các kế hoạch cải thiện hiệu suất sẽ hiển thị ở đây</p>
        </div>
      ) : (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800">
                  <TableHead className="text-zinc-400">Nhân viên</TableHead>
                  <TableHead className="text-zinc-400">Ngày bắt đầu</TableHead>
                  <TableHead className="text-zinc-400">Ngày kết thúc</TableHead>
                  <TableHead className="text-zinc-400">Trạng thái</TableHead>
                  <TableHead className="text-zinc-400">Tiến độ</TableHead>
                  <TableHead className="text-zinc-400">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pips.map((pip) => {
                  const totalMilestones = pip.milestones?.length || 0
                  const completedMilestones = pip.milestones?.filter((m) => m.completedAt).length || 0
                  const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0

                  return (
                    <TableRow key={pip.id} className="border-zinc-800">
                      <TableCell className="text-zinc-200">
                        {pip.employee?.fullName || 'N/A'}
                        <span className="text-xs text-zinc-500 ml-2">{pip.employee?.employeeCode}</span>
                      </TableCell>
                      <TableCell className="text-zinc-400">
                        {new Date(pip.startDate).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell className="text-zinc-400">
                        {new Date(pip.endDate).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        <PIPStatusBadge status={pip.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={progress} className="h-1.5 w-16" />
                          <span className="text-xs text-zinc-500">{progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link href={`/performance/pip/${pip.id}`}>
                          <Button size="sm" variant="ghost" className="text-amber-400 hover:text-amber-300">
                            Xem
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
