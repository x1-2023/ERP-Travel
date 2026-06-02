'use client';

import * as React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  variant?: 'icon' | 'full' | 'compact';
  className?: string;
}

export function ThemeToggle({ variant = 'icon', className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className={className} disabled>
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  // Full variant - shows all options as buttons
  if (variant === 'full') {
    return (
      <div className={cn('flex items-center gap-1 p-1 bg-muted rounded-lg', className)}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme('light')}
          className={cn(
            'flex items-center gap-2 px-3 rounded-md',
            theme === 'light' && 'bg-background shadow-sm'
          )}
        >
          <Sun className="h-4 w-4" />
          <span className="text-sm">Sáng</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme('dark')}
          className={cn(
            'flex items-center gap-2 px-3 rounded-md',
            theme === 'dark' && 'bg-background shadow-sm'
          )}
        >
          <Moon className="h-4 w-4" />
          <span className="text-sm">Tối</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme('system')}
          className={cn(
            'flex items-center gap-2 px-3 rounded-md',
            theme === 'system' && 'bg-background shadow-sm'
          )}
        >
          <Monitor className="h-4 w-4" />
          <span className="text-sm">Tự động</span>
        </Button>
      </div>
    );
  }

  // Compact variant - just shows current theme icon and cycles through
  if (variant === 'compact') {
    const cycleTheme = () => {
      if (theme === 'light') setTheme('dark');
      else if (theme === 'dark') setTheme('system');
      else setTheme('light');
    };

    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={cycleTheme}
        className={className}
        title={`Theme: ${theme === 'light' ? 'Sáng' : theme === 'dark' ? 'Tối' : 'Hệ thống'}`}
      >
        {theme === 'light' && <Sun className="h-5 w-5" />}
        {theme === 'dark' && <Moon className="h-5 w-5" />}
        {theme === 'system' && <Monitor className="h-5 w-5" />}
        <span className="sr-only">Chuyển đổi theme</span>
      </Button>
    );
  }

  // Default icon variant with dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Chuyển đổi theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Sáng</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Tối</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="mr-2 h-4 w-4" />
          <span>Hệ thống</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
