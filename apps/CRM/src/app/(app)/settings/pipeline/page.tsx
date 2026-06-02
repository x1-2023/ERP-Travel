'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { DEFAULT_STAGES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useSetting, useUpdateSetting } from '@/hooks/use-settings'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from '@/i18n'

interface StageConfig {
  id: string
  name: string
  probability: number
  color: string
  isWon: boolean
  isLost: boolean
  order: number
}

const PRESET_COLORS = [
  '#6B7280', '#3B82F6', '#8B5CF6', '#F59E0B', '#10B981',
  '#EF4444', '#06B6D4', '#F97316', '#EC4899', '#14B8A6',
]

export default function PipelineSettingsPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const { data: pipelineSettings } = useSetting('pipeline')
  const mutation = useUpdateSetting('pipeline')
  const { toast } = useToast()

  const [stages, setStages] = useState<StageConfig[]>(
    DEFAULT_STAGES.map((s, idx) => ({
      id: `stage_${idx}`,
      ...s,
    }))
  )

  // Sync from API when data arrives
  useEffect(() => {
    if (pipelineSettings?.stages?.length) {
      setStages(
        pipelineSettings.stages.map((s: any) => ({
          id: s.id,
          name: s.name,
          probability: s.probability,
          color: s.color,
          isWon: s.isWon ?? false,
          isLost: s.isLost ?? false,
          order: s.order,
        }))
      )
    }
  }, [pipelineSettings])

  const addStage = () => {
    const newStage: StageConfig = {
      id: `stage_${Date.now()}`,
      name: t('settings.newStage'),
      probability: 50,
      color: '#3B82F6',
      isWon: false,
      isLost: false,
      order: stages.length,
    }
    setStages([...stages, newStage])
  }

  const removeStage = (id: string) => {
    setStages(stages.filter((s) => s.id !== id).map((s, idx) => ({ ...s, order: idx })))
  }

  const updateStage = (id: string, field: keyof StageConfig, value: string | number | boolean) => {
    setStages(
      stages.map((s) => {
        if (s.id !== id) return s
        const updated = { ...s, [field]: value }
        // If marking as Won, unmark Lost (and vice versa)
        if (field === 'isWon' && value) updated.isLost = false
        if (field === 'isLost' && value) updated.isWon = false
        return updated
      })
    )
  }

  const moveStage = (id: string, direction: 'up' | 'down') => {
    const idx = stages.findIndex((s) => s.id === id)
    if (idx < 0) return
    const newIdx = direction === 'up' ? idx - 1 : idx + 1
    if (newIdx < 0 || newIdx >= stages.length) return

    const reordered = [...stages]
    const [moved] = reordered.splice(idx, 1)
    reordered.splice(newIdx, 0, moved)
    setStages(reordered.map((s, i) => ({ ...s, order: i })))
  }

  const handleSave = () => {
    const payload = {
      stages: stages.map((s) => ({
        id: s.id,
        name: s.name,
        color: s.color,
        probability: s.probability,
        order: s.order,
        isWon: s.isWon,
        isLost: s.isLost,
      })),
    }
    mutation.mutate(payload as any, {
      onSuccess: () => toast({ description: 'Đã lưu cấu hình pipeline!' }),
      onError: () => toast({ description: t('settings.pipelineSaveError'), variant: 'destructive' }),
    })
  }

  return (
    <PageShell
      title={t('settings.pipelineConfig')}
      description="Tùy chỉnh các giai đoạn trong phễu bán hàng"
      actions={
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] hover:bg-[var(--crm-bg-subtle)]"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          {t('common.back')}
        </Button>
      }
    >
      <Card className="bg-[var(--crm-bg-card)] border-[var(--crm-border)] p-3">
        <div className="space-y-3">
          {stages.map((stage, idx) => (
            <div
              key={stage.id}
              className="flex items-start gap-3 p-4 rounded-lg bg-[var(--glass-bg)] border border-[var(--crm-border-subtle)]"
            >
              {/* Order + Move buttons */}
              <div className="flex flex-col items-center gap-1 pt-1">
                <span className="text-xs text-[var(--crm-text-muted)] font-mono w-5 text-center">{idx + 1}</span>
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveStage(stage.id, 'up')}
                    disabled={idx === 0}
                    className="p-0.5 text-[var(--crm-text-muted)] hover:text-[var(--crm-text-secondary)] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => moveStage(stage.id, 'down')}
                    disabled={idx === stages.length - 1}
                    className="p-0.5 text-[var(--crm-text-muted)] hover:text-[var(--crm-text-secondary)] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Color picker */}
              <div className="space-y-1.5 shrink-0">
                <Label className="text-[var(--crm-text-muted)] text-[10px]">Màu</Label>
                <div className="flex gap-1 flex-wrap w-20">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => updateStage(stage.id, 'color', c)}
                      className={cn(
                        'w-4 h-4 rounded-full border-2 transition-transform',
                        stage.color === c
                          ? 'border-white scale-110'
                          : 'border-transparent hover:scale-105'
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Name */}
              <div className="flex-1 space-y-1.5">
                <Label className="text-[var(--crm-text-muted)] text-[10px]">Tên giai đoạn</Label>
                <Input
                  value={stage.name}
                  onChange={(e) => updateStage(stage.id, 'name', e.target.value)}
                  className="bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] h-8 text-sm"
                />
              </div>

              {/* Probability */}
              <div className="w-24 space-y-1.5">
                <Label className="text-[var(--crm-text-muted)] text-[10px]">{t('settings.probability')}</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={stage.probability}
                  onChange={(e) =>
                    updateStage(stage.id, 'probability', Math.min(100, Math.max(0, Number(e.target.value))))
                  }
                  className="bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] h-8 text-sm text-right"
                />
              </div>

              {/* Won / Lost toggles */}
              <div className="flex flex-col gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={stage.isWon}
                    onCheckedChange={(v) => updateStage(stage.id, 'isWon', v)}
                    className="data-[state=checked]:bg-[#10B981] h-4 w-8"
                  />
                  <span className="text-[10px] text-[var(--crm-text-muted)]">Won</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={stage.isLost}
                    onCheckedChange={(v) => updateStage(stage.id, 'isLost', v)}
                    className="data-[state=checked]:bg-[#EF4444] h-4 w-8"
                  />
                  <span className="text-[10px] text-[var(--crm-text-muted)]">Lost</span>
                </div>
              </div>

              {/* Remove */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeStage(stage.id)}
                disabled={stages.length <= 2}
                className="h-8 w-8 text-[var(--crm-text-muted)] hover:text-red-400 hover:bg-red-400/10 shrink-0 mt-3"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>

        <Separator className="bg-[var(--crm-border)] my-4" />

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={addStage}
            className="border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] hover:bg-[var(--crm-bg-subtle)]"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            {t('settings.addStage')}
          </Button>

          <Button
            onClick={handleSave}
            className="bg-[#10B981] hover:bg-[#10B981]/90 text-white"
          >
            {mutation.isPending ? t('common.saving') : t('settings.saveChanges')}
          </Button>
        </div>
      </Card>
    </PageShell>
  )
}
