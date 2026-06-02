/**
 * UI Store Tests (Real Zustand Store)
 * Tests the actual useUIStore from src/stores/uiStore.ts
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '@/stores/uiStore';

describe('useUIStore', () => {
  beforeEach(() => {
    // Reset store to defaults before each test
    useUIStore.setState({
      sidebarOpen: true,
      theme: 'light',
      language: 'vi',
      isMobile: false,
    });
  });

  describe('initial state', () => {
    it('should have sidebar open by default', () => {
      expect(useUIStore.getState().sidebarOpen).toBe(true);
    });

    it('should have light theme by default', () => {
      expect(useUIStore.getState().theme).toBe('light');
    });

    it('should have Vietnamese language by default', () => {
      expect(useUIStore.getState().language).toBe('vi');
    });

    it('should not be mobile by default', () => {
      expect(useUIStore.getState().isMobile).toBe(false);
    });
  });

  describe('sidebar operations', () => {
    it('should toggle sidebar from open to closed', () => {
      useUIStore.getState().toggleSidebar();
      expect(useUIStore.getState().sidebarOpen).toBe(false);
    });

    it('should toggle sidebar from closed to open', () => {
      useUIStore.getState().toggleSidebar();
      expect(useUIStore.getState().sidebarOpen).toBe(false);

      useUIStore.getState().toggleSidebar();
      expect(useUIStore.getState().sidebarOpen).toBe(true);
    });

    it('should set sidebar open state to false', () => {
      useUIStore.getState().setSidebarOpen(false);
      expect(useUIStore.getState().sidebarOpen).toBe(false);
    });

    it('should set sidebar open state to true', () => {
      useUIStore.getState().setSidebarOpen(false);
      useUIStore.getState().setSidebarOpen(true);
      expect(useUIStore.getState().sidebarOpen).toBe(true);
    });

    it('should set sidebar open with same value (idempotent)', () => {
      useUIStore.getState().setSidebarOpen(true);
      expect(useUIStore.getState().sidebarOpen).toBe(true);
    });
  });

  describe('theme operations', () => {
    it('should set theme to dark', () => {
      useUIStore.getState().setTheme('dark');
      expect(useUIStore.getState().theme).toBe('dark');
    });

    it('should set theme to light', () => {
      useUIStore.getState().setTheme('dark');
      useUIStore.getState().setTheme('light');
      expect(useUIStore.getState().theme).toBe('light');
    });

    it('should not affect other state when setting theme', () => {
      useUIStore.getState().setTheme('dark');
      expect(useUIStore.getState().sidebarOpen).toBe(true);
      expect(useUIStore.getState().language).toBe('vi');
      expect(useUIStore.getState().isMobile).toBe(false);
    });
  });

  describe('language operations', () => {
    it('should set language to English', () => {
      useUIStore.getState().setLanguage('en');
      expect(useUIStore.getState().language).toBe('en');
    });

    it('should set language to Vietnamese', () => {
      useUIStore.getState().setLanguage('en');
      useUIStore.getState().setLanguage('vi');
      expect(useUIStore.getState().language).toBe('vi');
    });

    it('should toggle language from vi to en', () => {
      expect(useUIStore.getState().language).toBe('vi');

      useUIStore.getState().toggleLanguage();
      expect(useUIStore.getState().language).toBe('en');
    });

    it('should toggle language from en to vi', () => {
      useUIStore.getState().setLanguage('en');

      useUIStore.getState().toggleLanguage();
      expect(useUIStore.getState().language).toBe('vi');
    });

    it('should toggle language back and forth', () => {
      useUIStore.getState().toggleLanguage();
      expect(useUIStore.getState().language).toBe('en');

      useUIStore.getState().toggleLanguage();
      expect(useUIStore.getState().language).toBe('vi');
    });
  });

  describe('mobile operations', () => {
    it('should set mobile state to true', () => {
      useUIStore.getState().setIsMobile(true);
      expect(useUIStore.getState().isMobile).toBe(true);
    });

    it('should set mobile state to false', () => {
      useUIStore.getState().setIsMobile(true);
      useUIStore.getState().setIsMobile(false);
      expect(useUIStore.getState().isMobile).toBe(false);
    });

    it('should not affect other state when setting mobile', () => {
      useUIStore.getState().setIsMobile(true);
      expect(useUIStore.getState().sidebarOpen).toBe(true);
      expect(useUIStore.getState().theme).toBe('light');
      expect(useUIStore.getState().language).toBe('vi');
    });
  });

  describe('combined operations', () => {
    it('should handle multiple state changes', () => {
      useUIStore.getState().toggleSidebar();
      useUIStore.getState().setTheme('dark');
      useUIStore.getState().setLanguage('en');
      useUIStore.getState().setIsMobile(true);

      const state = useUIStore.getState();
      expect(state.sidebarOpen).toBe(false);
      expect(state.theme).toBe('dark');
      expect(state.language).toBe('en');
      expect(state.isMobile).toBe(true);
    });
  });
});
