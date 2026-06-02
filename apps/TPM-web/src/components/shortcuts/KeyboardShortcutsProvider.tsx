/**
 * KeyboardShortcutsProvider
 * Provides global keyboard shortcuts, help dialog, and quick search
 */

import { createContext, useContext, ReactNode } from 'react';
import {
  useKeyboardShortcuts,
  shortcutHelpData,
  formatShortcut,
} from '@/hooks/useKeyboardShortcuts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';
import { QuickSearch } from '@/components/search/QuickSearch';

interface KeyboardShortcutsContextValue {
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  closeSearch: () => void;
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;
  closeHelp: () => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextValue | null>(null);

export function useKeyboardShortcutsContext() {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcutsContext must be used within KeyboardShortcutsProvider');
  }
  return context;
}

interface KeyboardShortcutsProviderProps {
  children: ReactNode;
  onSearchOpen?: () => void;
  onSearchClose?: () => void;
}

export function KeyboardShortcutsProvider({
  children,
  onSearchOpen,
  onSearchClose,
}: KeyboardShortcutsProviderProps) {
  const {
    isSearchOpen,
    setIsSearchOpen,
    closeSearch,
    showHelp,
    setShowHelp,
    closeHelp,
  } = useKeyboardShortcuts({
    enabled: true,
    onSearchOpen,
    onSearchClose,
  });

  return (
    <KeyboardShortcutsContext.Provider
      value={{
        isSearchOpen,
        setIsSearchOpen,
        closeSearch,
        showHelp,
        setShowHelp,
        closeHelp,
      }}
    >
      {children}

      {/* Keyboard Shortcuts Help Dialog */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription>
              Use these shortcuts to navigate quickly
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {shortcutHelpData.map((category) => (
              <div key={category.category}>
                <h4 className="text-sm font-semibold text-muted-foreground mb-3">
                  {category.category}
                </h4>
                <div className="space-y-2">
                  {category.shortcuts.map((shortcut) => (
                    <div
                      key={shortcut.keys}
                      className="flex items-center justify-between py-1.5"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <kbd className="inline-flex items-center gap-1 px-2 py-1 text-xs font-mono bg-muted rounded border">
                        {formatShortcut(shortcut.keys)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-xs text-muted-foreground text-center border-t pt-4">
            Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Esc</kbd> to close
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Search Modal (⌘K) */}
      <QuickSearch open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </KeyboardShortcutsContext.Provider>
  );
}
