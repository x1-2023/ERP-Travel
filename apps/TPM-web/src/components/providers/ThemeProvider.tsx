/**
 * Theme Provider - Applies theme class to HTML element
 */

import { useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove previous theme classes
    root.classList.remove('light', 'dark');

    // Handle legacy 'system' value from localStorage - convert to 'light'
    const effectiveTheme = (theme === 'light' || theme === 'dark') ? theme : 'light';

    // Update store if we had to convert from legacy value
    if (effectiveTheme !== theme) {
      setTheme(effectiveTheme);
    }

    root.classList.add(effectiveTheme);
  }, [theme, setTheme]);

  return <>{children}</>;
}
