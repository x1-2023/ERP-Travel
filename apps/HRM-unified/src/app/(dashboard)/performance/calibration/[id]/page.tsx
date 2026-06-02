'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Scale, BarChart3, CheckCircle } from 'lucide-react'
import { CalibrationSession, CalibrationDecision } from '@/types/performance'
import { RATING_SCALE } from '@/lib/performance/constants'

export default function CalibrationDetailPage() {
  const params = useParams()
  const [session, setSession] = useState<CalibrationSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch(`/api/performance/calibration/${params.id}`)
        if (res.ok) {
          setSession(await res.json())
        }
      } catch {
        // Handle error
      } finally {
        setLoading(false)
      }
    }
    loadSession()
  }, [params.id])

  const handleComplete = async () => {
    try {
      const res = await fetch(`/api/performance/calibration/${params.id}/complete`, {
        method: 'POST',
      })
      if (res.ok) {
        setSession(await res.json())
      }
    } catch {
      // Handle error
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64 bg-zinc-800" />
        <Skeleton className="h-48 bg-zinc-800" />
        <Skeleton className="h-64 bg-zinc-800" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-zinc-500">
        <Scale className="h-16 w-16 mb-4 text-zinc-700" />
        <p>Không tìm thấy phiên calibration</p>
        <Link href="/performance/calibration">
          <Button variant="ghost" className="mt-4 text-amber-400">Quay lại</Button>
        </Link>
      </div>
    )
  }

  // Rating distribution from decisions
  const distribution = RATING_SCALE.map((scale) => ({
    ...scale,
    originalCount: session.decisions?.filter((d) => d.originalRating === scale.value).length || 0,
    calibratedCount: session.decisions?.filter((d) => d.calibratedRating === scale.value).length || 0,
  }))

  return (
    <div className="space-y-6 p-6 bg-zinc-950 min-h-screen text-zinc-100">
      <div className="flex items-center gap-4">
        <Link href="/performance/calibration">
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-amber-400">{session.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            {session.department && <span className="text-sm text-zinc-400">{session.department.name}</span>}
            <Badge className={session.completedAt ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}>
              {session.completedAt ? 'Hoàn thành' : 'Đang diễn ra'}
            </Badge>
          </div>
        </div>
        {!session.completedAt && (
          <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700 text-white">
            <CheckCircle className="mr-2 h-4 w-4" /> Hoàn thành Calibration
          </Button>
        )}
      </div>

      {/* Rating Distribution Chart */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Phân bố đánh giá
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {distribution.map((d) => (
              <div key={d.value} className="flex items-center gap-3">
                <span className="text-sm text-zinc-400 w-28">{d.label} ({d.value})</span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-4 bg-zinc-800 rounded overflow-hidden relative">
                    <div
                      className="h-full rounded opacity-50"
                      style={{
                        width: `${session.decisions?.length ? (d.originalCount / session.decisions.length) * 100 : 0}%`,
                        backgroundColor: d.color,
                      }}
                    />
                  </div>
                  <div className="flex-1 h-4 bg-zinc-800 rounded overflow-hidden">
                    <div
                      className="h-full rounded"
                      style={{
                        width: `${session.decisions?.length ? (d.calibratedCount / session.decisions.length) * 100 : 0}%`,
                        backgroundColor: d.color,
                      }}
                    />
                  </div>
                </div>
                <span className="text-xs text-zinc-500 w-16">{d.originalCount} / {d.calibratedCount}</span>
              </div>
            ))}
            <div className="flex items-center gap-3 pt-2 text-xs text-zinc-600">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-zinc-500 opacity-50" /> Trước</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-zinc-500" /> Sau calibration</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Decisions Table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">Danh sách nhân viên</CardTitle>
        </CardHeader>
        <CardContent>
          {session.decisions && session.decisions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800">
                  <TableHead className="text-zinc-400">Nhân viên</TableHead>
                  <TableHead className="text-zinc-400">Đánh giá ban đầu</TableHead>
                  <TableHead className="text-zinc-400">Đánh giá calibrated</TableHead>
                  <TableHead className="text-zinc-400">Thay đổi</TableHead>
                  <TableHead className="text-zinc-400">Lý do</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {session.decisions.map((decision) => {
                  const diff = decision.calibratedRating - decision.originalRating
                  return (
                    <TableRow key={decision.id} className="border-zinc-800">
                      <TableCell className="text-zinc-200">{decision.employee?.fullName || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-zinc-600">{decision.originalRating}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-amber-500/20 text-amber-400">{decision.calibratedRating}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className={diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-zinc-500'}>
                          {diff > 0 ? `+${diff}` : diff === 0 ? '0' : diff}
                        </span>
                      </TableCell>
                      <TableCell className="text-zinc-400 text-sm max-w-xs truncate">
                        {decision.reason || '-'}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-zinc-500">
              <Scale className="h-12 w-12 mx-auto mb-3 text-zinc-700" />
              <p>Chưa có quyết định nào</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {session.notes && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100 text-sm">Ghi chú</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-300 whitespace-pre-wrap">{session.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
