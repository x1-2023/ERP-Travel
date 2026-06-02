/**
 * App Tests
 * Tests for src/App.tsx - the root application component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '@/App';

// Mock BrowserRouter
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="browser-router">{children}</div>
    ),
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/', state: null, key: 'default', search: '', hash: '' }),
    Routes: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Route: () => null,
    Navigate: () => null,
    Outlet: () => null,
  };
});

// Mock ThemeProvider
vi.mock('@/components/providers/ThemeProvider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
}));

// Mock KeyboardShortcutsProvider
vi.mock('@/components/shortcuts/KeyboardShortcutsProvider', () => ({
  KeyboardShortcutsProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="keyboard-shortcuts-provider">{children}</div>
  ),
}));

// Mock Toaster
vi.mock('@/components/ui/toaster', () => ({
  Toaster: () => <div data-testid="toaster">Toaster</div>,
}));

// Mock AppRouter
vi.mock('@/router', () => ({
  default: () => <div data-testid="app-router">AppRouter</div>,
}));

describe('App', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });

  it('wraps children with ThemeProvider', () => {
    render(<App />);
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
  });

  it('wraps children with BrowserRouter', () => {
    render(<App />);
    expect(screen.getByTestId('browser-router')).toBeInTheDocument();
  });

  it('wraps children with KeyboardShortcutsProvider', () => {
    render(<App />);
    expect(screen.getByTestId('keyboard-shortcuts-provider')).toBeInTheDocument();
  });

  it('renders AppRouter', () => {
    render(<App />);
    expect(screen.getByTestId('app-router')).toBeInTheDocument();
  });

  it('renders Toaster', () => {
    render(<App />);
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });

  it('nests providers in the correct order (Theme > Router > Shortcuts)', () => {
    render(<App />);

    const themeProvider = screen.getByTestId('theme-provider');
    const browserRouter = screen.getByTestId('browser-router');
    const shortcutsProvider = screen.getByTestId('keyboard-shortcuts-provider');

    // ThemeProvider should contain BrowserRouter
    expect(themeProvider.contains(browserRouter)).toBe(true);
    // BrowserRouter should contain KeyboardShortcutsProvider
    expect(browserRouter.contains(shortcutsProvider)).toBe(true);
    // KeyboardShortcutsProvider should contain AppRouter
    expect(shortcutsProvider.contains(screen.getByTestId('app-router'))).toBe(true);
  });
});
