'use client'

import { cn } from '@/lib/utils'
import { MOOD_OPTIONS } from '@/lib/performance/constants'

interface MoodSelectorProps {
  value?: number
  onChange: (value: number) => void
  readonly?: boolean
}

export function MoodSelector({ value, onChange, readonly = false }: MoodSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      {MOOD_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          disabled={readonly}
          onClick={() => onChange(option.value)}
          className={cn(
            'flex flex-col items-center gap-0.5 p-2 rounded-sm border transition-colors',
            value === option.value
              ? 'border-primary bg-primary/10'
              : 'border-transparent bg-muted/50 hover:bg-muted',
            readonly && 'cursor-default',
            !readonly && 'cursor-pointer'
          )}
          title={option.label}
        >
          <span className="text-xl">{option.emoji}</span>
          <span className="text-[10px] text-muted-foreground">{option.label}</span>
        </button>
      ))}
    </div>
  )
}
