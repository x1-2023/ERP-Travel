/**
 * Language Toggle Component
 */

import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

export function LanguageToggle() {
  const { language, toggleLanguage } = useUIStore();

  return (
    <button
      onClick={toggleLanguage}
      className={cn(
        'flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium',
        'border border-surface-border',
        'hover:bg-surface-hover transition-colors',
        'text-foreground-muted hover:text-foreground'
      )}
      title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
    >
      <span className={cn(
        'px-1 py-0.5 rounded text-[10px] font-bold',
        language === 'vi' ? 'bg-primary text-primary-foreground' : 'text-foreground-subtle'
      )}>
        VI
      </span>
      <span className="text-foreground-subtle">/</span>
      <span className={cn(
        'px-1 py-0.5 rounded text-[10px] font-bold',
        language === 'en' ? 'bg-primary text-primary-foreground' : 'text-foreground-subtle'
      )}>
        EN
      </span>
    </button>
  );
}

export function LanguageToggleCompact() {
  const { language, toggleLanguage } = useUIStore();

  return (
    <button
      onClick={toggleLanguage}
      className={cn(
        'flex items-center justify-center w-8 h-8 rounded-md',
        'border border-surface-border',
        'hover:bg-surface-hover transition-colors',
        'text-xs font-bold',
        'text-foreground-muted hover:text-foreground'
      )}
      title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
    >
      {language === 'vi' ? 'VI' : 'EN'}
    </button>
  );
}
