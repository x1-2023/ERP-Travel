/**
 * useKeyboardShortcuts Hook
 * Global keyboard shortcuts for navigation and actions
 */

import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@/stores/uiStore';
import { keyboardShortcuts } from '@/config/sidebarConfig';

interface ShortcutHandler {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  onSearchOpen?: () => void;
  onSearchClose?: () => void;
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const { enabled = true, onSearchOpen, onSearchClose } = options;
  const navigate = useNavigate();
  const { toggleSidebar } = useUIStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Define all shortcuts
  const shortcuts: ShortcutHandler[] = [
    // Navigation shortcuts (⌘1, ⌘2, ⌘3, ⌘T)
    {
      key: '1',
      metaKey: true,
      action: () => navigate('/dashboard'),
      description: 'Go to Dashboard',
    },
    {
      key: '2',
      metaKey: true,
      action: () => navigate('/budget/definition'),
      description: 'Go to Budget Definition',
    },
    {
      key: '3',
      metaKey: true,
      action: () => navigate('/calendar'),
      description: 'Go to Promotion Calendar',
    },
    {
      key: 't',
      metaKey: true,
      action: () => navigate('/planning/tpo'),
      description: 'Go to TPO - AI Suggestion',
    },
    // Utility shortcuts
    {
      key: 'k',
      metaKey: true,
      action: () => {
        setIsSearchOpen(true);
        onSearchOpen?.();
      },
      description: 'Open Quick Search',
    },
    {
      key: 'b',
      metaKey: true,
      action: () => toggleSidebar(),
      description: 'Toggle Sidebar',
    },
    {
      key: '/',
      shiftKey: true,
      action: () => setShowHelp(true),
      description: 'Show Keyboard Shortcuts Help',
    },
    {
      key: 'Escape',
      action: () => {
        if (isSearchOpen) {
          setIsSearchOpen(false);
          onSearchClose?.();
        }
        if (showHelp) {
          setShowHelp(false);
        }
      },
      description: 'Close dialogs',
    },
  ];

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Allow Escape in inputs
      if (isInput && event.key !== 'Escape') {
        return;
      }

      // Find matching shortcut
      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const metaMatch = shortcut.metaKey ? event.metaKey || event.ctrlKey : true;
        const ctrlMatch = shortcut.ctrlKey ? event.ctrlKey : true;


        if (keyMatch && metaMatch && ctrlMatch && (shortcut.shiftKey ? event.shiftKey : true)) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [enabled, shortcuts, isSearchOpen, showHelp]
  );

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [enabled, handleKeyDown]);

  // Get human-readable shortcut display
  const getShortcutDisplay = (key: string): string | undefined => {
    return keyboardShortcuts[key];
  };

  // Close search
  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    onSearchClose?.();
  }, [onSearchClose]);

  // Close help
  const closeHelp = useCallback(() => {
    setShowHelp(false);
  }, []);

  return {
    isSearchOpen,
    setIsSearchOpen,
    closeSearch,
    showHelp,
    setShowHelp,
    closeHelp,
    shortcuts: shortcuts.filter((s) => s.key !== 'Escape'),
    getShortcutDisplay,
  };
}

/**
 * Format keyboard shortcut for display
 */
export function formatShortcut(shortcut: string): string {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  return shortcut
    .replace('⌘', isMac ? '⌘' : 'Ctrl+')
    .replace('⌥', isMac ? '⌥' : 'Alt+')
    .replace('⇧', isMac ? '⇧' : 'Shift+');
}

/**
 * Shortcut help data for display
 */
export const shortcutHelpData = [
  { category: 'Navigation', shortcuts: [
    { keys: '⌘1', description: 'Go to Dashboard' },
    { keys: '⌘2', description: 'Go to Budget Definition' },
    { keys: '⌘3', description: 'Go to Promotion Calendar' },
    { keys: '⌘T', description: 'Go to TPO - AI Suggestion' },
  ]},
  { category: 'Actions', shortcuts: [
    { keys: '⌘K', description: 'Open Quick Search' },
    { keys: '⌘B', description: 'Toggle Sidebar' },
    { keys: '?', description: 'Show Keyboard Shortcuts' },
    { keys: 'Esc', description: 'Close dialogs' },
  ]},
];
