'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ExportPage() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Export dữ liệu</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Danh sách nhân viên</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Xuất danh sách toàn bộ nhân viên ra file Excel.</p>
            <Button onClick={() => window.open('/api/admin/export/employees', '_blank')}>Xuất Excel</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Bảng chấm công</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="w-24" />
              <Input type="number" min={1} max={12} value={month} onChange={e => setMonth(Number(e.target.value))} className="w-20" />
            </div>
            <Button onClick={() => window.open(`/api/admin/export/attendance?year=${year}&month=${month}`, '_blank')}>Xuất Excel</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Audit Logs</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Xuất nhật ký hoạt động hệ thống (30 ngày gần nhất).</p>
            <Button onClick={() => window.open('/api/admin/export/audit', '_blank')}>Xuất Excel</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
