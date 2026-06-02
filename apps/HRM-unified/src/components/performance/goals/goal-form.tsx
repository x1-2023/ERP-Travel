'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { GOAL_TYPE, GOAL_PRIORITY } from '@/lib/performance/constants'
import type { Goal, KeyResult } from '@/types/performance'

interface GoalFormData {
  title: string
  description: string
  goalType: string
  category: string
  ownerId: string
  departmentId: string
  startDate: string
  endDate: string
  targetValue: number | undefined
  unit: string
  weight: number
  priority: string
  keyResults: Omit<KeyResult, 'id' | 'goalId' | 'progress' | 'order'>[]
}

interface GoalFormProps {
  goal?: Goal
  onSubmit: (data: GoalFormData) => void
  onCancel: () => void
}

export function GoalForm({ goal, onSubmit, onCancel }: GoalFormProps) {
  const [formData, setFormData] = useState<GoalFormData>({
    title: goal?.title || '',
    description: goal?.description || '',
    goalType: goal?.goalType || 'INDIVIDUAL',
    category: goal?.category || '',
    ownerId: goal?.ownerId || '',
    departmentId: goal?.departmentId || '',
    startDate: goal?.startDate?.split('T')[0] || '',
    endDate: goal?.endDate?.split('T')[0] || '',
    targetValue: goal?.targetValue,
    unit: goal?.unit || '',
    weight: goal?.weight || 0,
    priority: goal?.priority || 'MEDIUM',
    keyResults: goal?.keyResults?.map((kr) => ({
      title: kr.title,
      description: kr.description,
      targetValue: kr.targetValue,
      currentValue: kr.currentValue,
      unit: kr.unit,
      weight: kr.weight,
      dueDate: kr.dueDate,
      completedAt: kr.completedAt,
    })) || [],
  })

  const updateField = <K extends keyof GoalFormData>(key: K, value: GoalFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const addKeyResult = () => {
    setFormData((prev) => ({
      ...prev,
      keyResults: [
        ...prev.keyResults,
        { title: '', targetValue: 100, currentValue: 0, unit: '%', weight: 0 },
      ],
    }))
  }

  const removeKeyResult = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      keyResults: prev.keyResults.filter((_, i) => i !== index),
    }))
  }

  const updateKeyResult = (index: number, field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      keyResults: prev.keyResults.map((kr, i) =>
        i === index ? { ...kr, [field]: value } : kr
      ),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground">Tiêu đề</Label>
          <Input
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Nhập tiêu đề mục tiêu"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Mô tả</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Mô tả chi tiết mục tiêu"
            rows={3}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Loại mục tiêu</Label>
            <Select
              value={formData.goalType}
              onValueChange={(v) => updateField('goalType', v)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(GOAL_TYPE).map(([key, val]) => (
                  <SelectItem key={key} value={key}>
                    {val.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Độ ưu tiên</Label>
            <Select
              value={formData.priority}
              onValueChange={(v) => updateField('priority', v)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(GOAL_PRIORITY).map(([key, val]) => (
                  <SelectItem key={key} value={key}>
                    {val.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Danh mục</Label>
            <Input
              value={formData.category}
              onChange={(e) => updateField('category', e.target.value)}
              placeholder="Danh mục"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Trọng số (%)</Label>
            <Input
              type="number"
              value={formData.weight}
              onChange={(e) => updateField('weight', Number(e.target.value))}
              min={0}
              max={100}
              className="mt-1 font-data"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Người sở hữu (ID)</Label>
            <Input
              value={formData.ownerId}
              onChange={(e) => updateField('ownerId', e.target.value)}
              placeholder="ID nhân viên"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Phòng ban (ID)</Label>
            <Input
              value={formData.departmentId}
              onChange={(e) => updateField('departmentId', e.target.value)}
              placeholder="ID phòng ban"
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Ngày bắt đầu</Label>
            <Input
              type="date"
              value={formData.startDate}
              onChange={(e) => updateField('startDate', e.target.value)}
              className="mt-1 font-data"
              required
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Ngày kết thúc</Label>
            <Input
              type="date"
              value={formData.endDate}
              onChange={(e) => updateField('endDate', e.target.value)}
              className="mt-1 font-data"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Giá trị mục tiêu</Label>
            <Input
              type="number"
              value={formData.targetValue ?? ''}
              onChange={(e) =>
                updateField('targetValue', e.target.value ? Number(e.target.value) : undefined)
              }
              placeholder="100"
              className="mt-1 font-data"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Đơn vị</Label>
            <Input
              value={formData.unit}
              onChange={(e) => updateField('unit', e.target.value)}
              placeholder="%"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Kết quả then chốt (Key Results)</Label>
          <Button type="button" variant="outline" size="sm" onClick={addKeyResult}>
            <Plus className="h-3 w-3 mr-1" />
            Thêm
          </Button>
        </div>

        {formData.keyResults.map((kr, index) => (
          <div key={index} className="flex items-start gap-2 p-3 rounded-sm border bg-card">
            <div className="flex-1 space-y-2">
              <Input
                value={kr.title}
                onChange={(e) => updateKeyResult(index, 'title', e.target.value)}
                placeholder="Tiêu đề Key Result"
                className="text-sm"
              />
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  value={kr.targetValue}
                  onChange={(e) => updateKeyResult(index, 'targetValue', Number(e.target.value))}
                  placeholder="Mục tiêu"
                  className="font-data text-xs"
                />
                <Input
                  value={kr.unit || ''}
                  onChange={(e) => updateKeyResult(index, 'unit', e.target.value)}
                  placeholder="Đơn vị"
                  className="text-xs"
                />
                <Input
                  type="number"
                  value={kr.weight}
                  onChange={(e) => updateKeyResult(index, 'weight', Number(e.target.value))}
                  placeholder="Trọng số"
                  className="font-data text-xs"
                />
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeKeyResult(index)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Separator />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Huỷ
        </Button>
        <Button type="submit">
          {goal ? 'Cập nhật' : 'Tạo mục tiêu'}
        </Button>
      </div>
    </form>
  )
}
