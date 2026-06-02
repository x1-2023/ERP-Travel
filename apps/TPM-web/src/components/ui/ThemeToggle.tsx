/**
 * Theme Toggle Component
 */

import { Sun, Moon } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, setTheme } = useUIStore();

  const themes = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
  ];

  return (
    <div
      className={cn(
        'flex items-center gap-1 p-1 rounded bg-surface border border-surface-border',
        className
      )}
    >
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            'flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors',
            theme === value
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground-muted hover:text-foreground hover:bg-surface-hover'
          )}
          title={label}
        >
          <Icon className="h-3.5 w-3.5" />
          {showLabel && <span>{label}</span>}
        </button>
      ))}
    </div>
  );
}

// Compact version for header/navbar
export function ThemeToggleCompact({ className }: { className?: string }) {
  const { theme, setTheme } = useUIStore();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const Icon = theme === 'dark' ? Moon : Sun;
  const label = theme === 'dark' ? 'Dark' : 'Light';

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium',
        'text-foreground-muted hover:text-foreground hover:bg-surface-hover',
        'transition-colors',
        className
      )}
      title={`Theme: ${label}. Click to change.`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
