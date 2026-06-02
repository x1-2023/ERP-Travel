'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Heart, Plus, GripVertical, Edit } from 'lucide-react'
import { CoreValue } from '@/types/performance'

export default function ValuesPage() {
  const [values, setValues] = useState<CoreValue[]>([])
  const [loading, setLoading] = useState(true)
  const [editValue, setEditValue] = useState<CoreValue | null>(null)

  useEffect(() => {
    async function loadValues() {
      try {
        const res = await fetch('/api/performance/values')
        if (res.ok) {
          const data = await res.json()
          setValues(Array.isArray(data) ? data : data.values || [])
        }
      } catch {
        setValues([])
      } finally {
        setLoading(false)
      }
    }
    loadValues()
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
        <h1 className="text-2xl font-bold text-amber-400">Giá trị cốt lõi</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-black">
              <Plus className="mr-2 h-4 w-4" /> Thêm giá trị
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-zinc-100">Thêm giá trị cốt lõi</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Tên</label>
                <Input placeholder="VD: Đổi mới sáng tạo" className="bg-zinc-800 border-zinc-700 text-zinc-100" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Mô tả</label>
                <Textarea placeholder="Mô tả giá trị..." className="bg-zinc-800 border-zinc-700 text-zinc-100" rows={3} />
              </div>
              <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black">Lưu</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {values.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
          <Heart className="h-16 w-16 mb-4 text-zinc-700" />
          <p className="text-lg">Chưa có giá trị cốt lõi nào</p>
          <p className="text-sm text-zinc-600 mt-1">Định nghĩa giá trị cốt lõi của công ty để đánh giá nhân viên</p>
        </div>
      ) : (
        <div className="space-y-3">
          {values
            .sort((a, b) => a.order - b.order)
            .map((value) => (
              <Card key={value.id} className="bg-zinc-900 border-zinc-800">
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 cursor-grab text-zinc-600 hover:text-zinc-400">
                      <GripVertical className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-red-400" />
                          <span className="font-medium text-zinc-200">{value.name}</span>
                          <Badge className={value.isActive ? 'bg-green-500/20 text-green-400 text-xs' : 'bg-zinc-700 text-zinc-400 text-xs'}>
                            {value.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-zinc-200" onClick={() => setEditValue(value)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                      {value.description && (
                        <p className="text-sm text-zinc-500 mt-1">{value.description}</p>
                      )}
                      {value.indicators && Object.keys(value.indicators).length > 0 && (
                        <div className="mt-3 space-y-2">
                          {Object.entries(value.indicators).map(([level, indicators]) => (
                            <div key={level} className="text-xs">
                              <span className="text-amber-400 font-medium">Level {level}:</span>
                              <ul className="list-disc list-inside ml-2 text-zinc-500 mt-1">
                                {indicators.map((indicator, idx) => (
                                  <li key={idx}>{indicator}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  )
}
