'use client';

import { cn } from '@/lib/utils';
import { SKILL_LEVELS } from '@/lib/learning/constants';

interface SkillRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  showLabel?: boolean;
  required?: number;
}

export function SkillRating({ value, onChange, readonly = false, showLabel = false, required }: SkillRatingProps) {
  const levelInfo = SKILL_LEVELS.find((l) => l.value === value);
  const gap = required ? value - required : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange?.(level)}
            className={cn(
              'w-6 h-6 rounded-sm transition-all',
              level <= value ? 'bg-primary' : 'bg-muted',
              !readonly && 'hover:scale-110 cursor-pointer',
              required && level <= required && level > value && 'bg-red-200'
            )}
          />
        ))}
        {showLabel && levelInfo && <span className="ml-2 text-sm text-muted-foreground">{levelInfo.label}</span>}
        {required !== undefined && (
          <span className={cn('ml-2 text-xs font-medium', gap >= 0 ? 'text-green-600' : 'text-red-600')}>
            {gap >= 0 ? `+${gap}` : gap}
          </span>
        )}
      </div>
      {showLabel && levelInfo && <p className="text-xs text-muted-foreground">{levelInfo.description}</p>}
    </div>
  );
}
