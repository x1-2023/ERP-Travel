/**
 * Tests for ThemeToggle component
 */

/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle, ThemeToggleCompact } from '@/components/ui/ThemeToggle';
import { useUIStore } from '@/stores/uiStore';

// Mock the store
vi.mock('@/stores/uiStore', () => ({
  useUIStore: vi.fn(),
}));

describe('ThemeToggle', () => {
  const mockSetTheme = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('ThemeToggle (full)', () => {
    it('renders light and dark theme options', () => {
      (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle />);

      expect(screen.getByTitle('Light')).toBeInTheDocument();
      expect(screen.getByTitle('Dark')).toBeInTheDocument();
    });

    it('shows labels when showLabel is true', () => {
      (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle showLabel />);

      expect(screen.getByText('Light')).toBeInTheDocument();
      expect(screen.getByText('Dark')).toBeInTheDocument();
    });

    it('highlights the current theme', () => {
      (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle />);

      const lightButton = screen.getByTitle('Light');
      expect(lightButton).toHaveClass('bg-primary');
    });

    it('calls setTheme when clicking a theme option', () => {
      (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle />);

      fireEvent.click(screen.getByTitle('Light'));
      expect(mockSetTheme).toHaveBeenCalledWith('light');
    });
  });

  describe('ThemeToggleCompact', () => {
    it('renders with current theme icon', () => {
      (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggleCompact />);

      const button = screen.getByTitle('Theme: Dark. Click to change.');
      expect(button).toBeInTheDocument();
    });

    it('toggles from light to dark on click', () => {
      (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggleCompact />);

      const button = screen.getByTitle('Theme: Light. Click to change.');
      fireEvent.click(button);

      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    it('toggles from dark to light on click', () => {
      (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggleCompact />);

      const button = screen.getByTitle('Theme: Dark. Click to change.');
      fireEvent.click(button);

      expect(mockSetTheme).toHaveBeenCalledWith('light');
    });
  });
});
