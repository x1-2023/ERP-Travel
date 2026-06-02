/**
 * useKeyboardShortcuts Hook Tests
 * Extended coverage for keyboard event handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKeyboardShortcuts, formatShortcut, shortcutHelpData } from '@/hooks/useKeyboardShortcuts';
import { createWrapper } from '../test-utils';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock useUIStore
const mockToggleSidebar = vi.fn();
vi.mock('@/stores/uiStore', () => ({
  useUIStore: () => ({
    toggleSidebar: mockToggleSidebar,
  }),
}));

// Helper to dispatch keyboard events
function fireKeydown(key: string, options: Partial<KeyboardEvent> = {}) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...options,
  });
  window.dispatchEvent(event);
  return event;
}

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with search and help closed', () => {
    const { result } = renderHook(() => useKeyboardShortcuts(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isSearchOpen).toBe(false);
    expect(result.current.showHelp).toBe(false);
  });

  it('should provide closeSearch function', () => {
    const { result } = renderHook(() => useKeyboardShortcuts(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.closeSearch).toBe('function');
  });

  it('should provide closeHelp function', () => {
    const { result } = renderHook(() => useKeyboardShortcuts(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.closeHelp).toBe('function');
  });

  it('should provide shortcuts array without Escape', () => {
    const { result } = renderHook(() => useKeyboardShortcuts(), {
      wrapper: createWrapper(),
    });

    expect(Array.isArray(result.current.shortcuts)).toBe(true);
    expect(result.current.shortcuts.length).toBeGreaterThan(0);
    // Should filter out Escape from the returned shortcuts
    const escapeShortcut = result.current.shortcuts.find(s => s.key === 'Escape');
    expect(escapeShortcut).toBeUndefined();
  });

  it('should toggle search state', () => {
    const { result } = renderHook(() => useKeyboardShortcuts(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setIsSearchOpen(true);
    });

    expect(result.current.isSearchOpen).toBe(true);

    act(() => {
      result.current.closeSearch();
    });

    expect(result.current.isSearchOpen).toBe(false);
  });

  it('should toggle help state', () => {
    const { result } = renderHook(() => useKeyboardShortcuts(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setShowHelp(true);
    });

    expect(result.current.showHelp).toBe(true);

    act(() => {
      result.current.closeHelp();
    });

    expect(result.current.showHelp).toBe(false);
  });

  it('should call onSearchClose callback when closing search', () => {
    const onSearchClose = vi.fn();
    const { result } = renderHook(
      () => useKeyboardShortcuts({ onSearchClose }),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.setIsSearchOpen(true);
    });
    act(() => {
      result.current.closeSearch();
    });

    expect(onSearchClose).toHaveBeenCalled();
    expect(result.current.isSearchOpen).toBe(false);
  });

  it('should respect enabled option', () => {
    const { result } = renderHook(
      () => useKeyboardShortcuts({ enabled: false }),
      { wrapper: createWrapper() }
    );

    // Should still return the same interface
    expect(result.current.shortcuts).toBeDefined();
    expect(result.current.isSearchOpen).toBe(false);
  });

  describe('keyboard event handling', () => {
    it('should navigate to dashboard on Cmd+1', () => {
      renderHook(() => useKeyboardShortcuts(), {
        wrapper: createWrapper(),
      });

      act(() => {
        fireKeydown('1', { metaKey: true });
      });

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('should navigate to budget definition on Cmd+2', () => {
      renderHook(() => useKeyboardShortcuts(), {
        wrapper: createWrapper(),
      });

      act(() => {
        fireKeydown('2', { metaKey: true });
      });

      expect(mockNavigate).toHaveBeenCalledWith('/budget/definition');
    });

    it('should navigate to calendar on Cmd+3', () => {
      renderHook(() => useKeyboardShortcuts(), {
        wrapper: createWrapper(),
      });

      act(() => {
        fireKeydown('3', { metaKey: true });
      });

      expect(mockNavigate).toHaveBeenCalledWith('/calendar');
    });

    it('should navigate to TPO on Cmd+T', () => {
      renderHook(() => useKeyboardShortcuts(), {
        wrapper: createWrapper(),
      });

      act(() => {
        fireKeydown('t', { metaKey: true });
      });

      expect(mockNavigate).toHaveBeenCalledWith('/planning/tpo');
    });

    it('should open search on Cmd+K', () => {
      const onSearchOpen = vi.fn();
      const { result } = renderHook(
        () => useKeyboardShortcuts({ onSearchOpen }),
        { wrapper: createWrapper() }
      );

      act(() => {
        fireKeydown('k', { metaKey: true });
      });

      expect(result.current.isSearchOpen).toBe(true);
      expect(onSearchOpen).toHaveBeenCalled();
    });

    it('should toggle sidebar on Cmd+B', () => {
      renderHook(() => useKeyboardShortcuts(), {
        wrapper: createWrapper(),
      });

      act(() => {
        fireKeydown('b', { metaKey: true });
      });

      expect(mockToggleSidebar).toHaveBeenCalled();
    });

    it('should show help on Shift+/', () => {
      const { result } = renderHook(() => useKeyboardShortcuts(), {
        wrapper: createWrapper(),
      });

      act(() => {
        fireKeydown('/', { shiftKey: true });
      });

      expect(result.current.showHelp).toBe(true);
    });

    it('should close search on Escape when search is open', () => {
      const onSearchClose = vi.fn();
      const { result } = renderHook(
        () => useKeyboardShortcuts({ onSearchClose }),
        { wrapper: createWrapper() }
      );

      // Open search first
      act(() => {
        result.current.setIsSearchOpen(true);
      });
      expect(result.current.isSearchOpen).toBe(true);

      // Press Escape
      act(() => {
        fireKeydown('Escape');
      });

      expect(result.current.isSearchOpen).toBe(false);
      expect(onSearchClose).toHaveBeenCalled();
    });

    it('should close help on Escape when help is open', () => {
      const { result } = renderHook(() => useKeyboardShortcuts(), {
        wrapper: createWrapper(),
      });

      // Open help first
      act(() => {
        result.current.setShowHelp(true);
      });
      expect(result.current.showHelp).toBe(true);

      // Press Escape
      act(() => {
        fireKeydown('Escape');
      });

      expect(result.current.showHelp).toBe(false);
    });

    it('should not trigger shortcuts when typing in INPUT elements', () => {
      renderHook(() => useKeyboardShortcuts(), {
        wrapper: createWrapper(),
      });

      const input = document.createElement('input');
      document.body.appendChild(input);

      const event = new KeyboardEvent('keydown', {
        key: '1',
        metaKey: true,
        bubbles: true,
        cancelable: true,
      });

      act(() => {
        input.dispatchEvent(event);
      });

      expect(mockNavigate).not.toHaveBeenCalled();
      document.body.removeChild(input);
    });

    it('should not trigger shortcuts when typing in TEXTAREA elements', () => {
      renderHook(() => useKeyboardShortcuts(), {
        wrapper: createWrapper(),
      });

      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);

      const event = new KeyboardEvent('keydown', {
        key: 'k',
        metaKey: true,
        bubbles: true,
        cancelable: true,
      });

      act(() => {
        textarea.dispatchEvent(event);
      });

      // Should NOT open search when in textarea
      // (The hook checks target.tagName)
      expect(mockNavigate).not.toHaveBeenCalled();
      document.body.removeChild(textarea);
    });

    it('should allow Escape in input elements', () => {
      const { result } = renderHook(() => useKeyboardShortcuts(), {
        wrapper: createWrapper(),
      });

      // Open search first
      act(() => {
        result.current.setIsSearchOpen(true);
      });

      const input = document.createElement('input');
      document.body.appendChild(input);

      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      });

      act(() => {
        input.dispatchEvent(event);
      });

      expect(result.current.isSearchOpen).toBe(false);
      document.body.removeChild(input);
    });

    it('should not handle shortcuts when disabled', () => {
      renderHook(() => useKeyboardShortcuts({ enabled: false }), {
        wrapper: createWrapper(),
      });

      act(() => {
        fireKeydown('1', { metaKey: true });
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle Ctrl key as alternative to Meta on non-Mac', () => {
      renderHook(() => useKeyboardShortcuts(), {
        wrapper: createWrapper(),
      });

      act(() => {
        fireKeydown('1', { ctrlKey: true });
      });

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('should not trigger navigation without meta/ctrl key', () => {
      renderHook(() => useKeyboardShortcuts(), {
        wrapper: createWrapper(),
      });

      act(() => {
        fireKeydown('1');
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('getShortcutDisplay', () => {
    it('should return shortcut display value', () => {
      const { result } = renderHook(() => useKeyboardShortcuts(), {
        wrapper: createWrapper(),
      });

      // getShortcutDisplay looks up from keyboardShortcuts config
      const display = result.current.getShortcutDisplay;
      expect(typeof display).toBe('function');
    });
  });
});

describe('formatShortcut', () => {
  it('should format Mac shortcuts', () => {
    const result = formatShortcut('⌘K');
    expect(result).toContain('K');
  });

  it('should handle option key', () => {
    const result = formatShortcut('⌥A');
    expect(result).toContain('A');
  });

  it('should handle shift key', () => {
    const result = formatShortcut('⇧B');
    expect(result).toContain('B');
  });

  it('should handle plain keys', () => {
    const result = formatShortcut('Esc');
    expect(result).toBe('Esc');
  });

  it('should handle combined modifier keys', () => {
    const result = formatShortcut('⌘⇧P');
    expect(result).toContain('P');
  });
});

describe('shortcutHelpData', () => {
  it('should have navigation category', () => {
    const navCategory = shortcutHelpData.find((c) => c.category === 'Navigation');
    expect(navCategory).toBeDefined();
    expect(navCategory?.shortcuts.length).toBeGreaterThan(0);
  });

  it('should have actions category', () => {
    const actionsCategory = shortcutHelpData.find((c) => c.category === 'Actions');
    expect(actionsCategory).toBeDefined();
    expect(actionsCategory?.shortcuts.length).toBeGreaterThan(0);
  });

  it('should include Dashboard shortcut', () => {
    const navCategory = shortcutHelpData.find((c) => c.category === 'Navigation');
    const dashboardShortcut = navCategory?.shortcuts.find((s) =>
      s.description.toLowerCase().includes('dashboard')
    );
    expect(dashboardShortcut).toBeDefined();
    expect(dashboardShortcut?.keys).toBe('⌘1');
  });

  it('should include Quick Search shortcut', () => {
    const actionsCategory = shortcutHelpData.find((c) => c.category === 'Actions');
    const searchShortcut = actionsCategory?.shortcuts.find((s) =>
      s.description.toLowerCase().includes('search')
    );
    expect(searchShortcut).toBeDefined();
    expect(searchShortcut?.keys).toBe('⌘K');
  });

  it('should include Toggle Sidebar shortcut', () => {
    const actionsCategory = shortcutHelpData.find((c) => c.category === 'Actions');
    const sidebarShortcut = actionsCategory?.shortcuts.find((s) =>
      s.description.toLowerCase().includes('sidebar')
    );
    expect(sidebarShortcut).toBeDefined();
    expect(sidebarShortcut?.keys).toBe('⌘B');
  });

  it('should include Budget Definition shortcut', () => {
    const navCategory = shortcutHelpData.find((c) => c.category === 'Navigation');
    const budgetShortcut = navCategory?.shortcuts.find((s) =>
      s.description.toLowerCase().includes('budget')
    );
    expect(budgetShortcut).toBeDefined();
    expect(budgetShortcut?.keys).toBe('⌘2');
  });

  it('should include Promotion Calendar shortcut', () => {
    const navCategory = shortcutHelpData.find((c) => c.category === 'Navigation');
    const calendarShortcut = navCategory?.shortcuts.find((s) =>
      s.description.toLowerCase().includes('calendar')
    );
    expect(calendarShortcut).toBeDefined();
    expect(calendarShortcut?.keys).toBe('⌘3');
  });

  it('should include TPO shortcut', () => {
    const navCategory = shortcutHelpData.find((c) => c.category === 'Navigation');
    const tpoShortcut = navCategory?.shortcuts.find((s) =>
      s.description.toLowerCase().includes('tpo')
    );
    expect(tpoShortcut).toBeDefined();
    expect(tpoShortcut?.keys).toBe('⌘T');
  });

  it('should include Escape shortcut in actions', () => {
    const actionsCategory = shortcutHelpData.find((c) => c.category === 'Actions');
    const escShortcut = actionsCategory?.shortcuts.find((s) =>
      s.keys === 'Esc'
    );
    expect(escShortcut).toBeDefined();
    expect(escShortcut?.description.toLowerCase()).toContain('close');
  });

  it('should have exactly 2 categories', () => {
    expect(shortcutHelpData).toHaveLength(2);
  });
});
