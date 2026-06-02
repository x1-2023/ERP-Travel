/**
 * Tests for ThemeProvider component
 */

/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { useUIStore } from '@/stores/uiStore';

// Mock the store
vi.mock('@/stores/uiStore', () => ({
  useUIStore: vi.fn(),
}));

describe('ThemeProvider', () => {
  const mockSetTheme = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.classList.remove('light', 'dark');
  });

  afterEach(() => {
    document.documentElement.classList.remove('light', 'dark');
    vi.clearAllMocks();
  });

  it('applies light class when theme is light', () => {
    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) => {
      const state = { theme: 'light', setTheme: mockSetTheme };
      return selector ? selector(state) : state;
    });

    render(
      <ThemeProvider>
        <div>Test content</div>
      </ThemeProvider>
    );

    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('applies dark class when theme is dark', () => {
    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) => {
      const state = { theme: 'dark', setTheme: mockSetTheme };
      return selector ? selector(state) : state;
    });

    render(
      <ThemeProvider>
        <div>Test content</div>
      </ThemeProvider>
    );

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });

  it('converts system theme to light and calls setTheme', () => {
    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) => {
      const state = { theme: 'system', setTheme: mockSetTheme };
      return selector ? selector(state) : state;
    });

    render(
      <ThemeProvider>
        <div>Test content</div>
      </ThemeProvider>
    );

    // Provider converts 'system' to 'light' and calls setTheme
    expect(mockSetTheme).toHaveBeenCalledWith('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });

  it('renders children correctly', () => {
    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) => {
      const state = { theme: 'dark', setTheme: mockSetTheme };
      return selector ? selector(state) : state;
    });

    const { getByText } = render(
      <ThemeProvider>
        <div>Test content</div>
      </ThemeProvider>
    );

    expect(getByText('Test content')).toBeInTheDocument();
  });
});
