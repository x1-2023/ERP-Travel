/**
 * Auth Components Tests
 * Tests for ProtectedRoute
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '../test-utils';

// Stable function references
const stableFetchUser = vi.fn().mockResolvedValue(undefined);

const mockState = {
  isAuthenticated: true,
  user: { id: '1', name: 'Test User', role: 'ADMIN' } as any,
  accessToken: 'test-token',
  fetchUser: stableFetchUser,
};

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => mockState,
}));

vi.mock('@/components/shared/LoadingSpinner', () => ({
  LoadingSpinner: ({ fullScreen }: any) => (
    <div data-testid="loading-spinner">Loading</div>
  ),
}));

// Mock Navigate to prevent infinite navigation loops in tests
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to}>Redirecting to {to}</div>,
    useLocation: () => ({ pathname: '/test', search: '', hash: '', state: null, key: 'default' }),
  };
});

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    stableFetchUser.mockClear();
    mockState.isAuthenticated = true;
    mockState.user = { id: '1', name: 'Test User', role: 'ADMIN' };
    mockState.accessToken = 'test-token';
    mockState.fetchUser = stableFetchUser;
  });

  it('renders children when authenticated', async () => {
    await act(async () => {
      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );
    });
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', async () => {
    mockState.isAuthenticated = false;
    mockState.accessToken = '';
    mockState.user = null;

    await act(async () => {
      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );
    });

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Redirecting to /login')).toBeInTheDocument();
  });

  it('redirects to unauthorized when role does not match', async () => {
    mockState.user = { id: '1', name: 'Test User', role: 'VIEWER' };

    await act(async () => {
      render(
        <ProtectedRoute requiredRole={['ADMIN']}>
          <div>Admin Content</div>
        </ProtectedRoute>
      );
    });

    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    expect(screen.getByText('Redirecting to /unauthorized')).toBeInTheDocument();
  });

  it('renders children when role matches', async () => {
    await act(async () => {
      render(
        <ProtectedRoute requiredRole={['ADMIN', 'MANAGER']}>
          <div>Admin Content</div>
        </ProtectedRoute>
      );
    });

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('calls fetchUser when accessToken exists but user is null', async () => {
    mockState.user = null;
    mockState.accessToken = 'test-token';
    mockState.isAuthenticated = false;

    await act(async () => {
      render(
        <ProtectedRoute>
          <div>Content</div>
        </ProtectedRoute>
      );
    });

    expect(stableFetchUser).toHaveBeenCalled();
  });

  it('does not call fetchUser when user already exists', async () => {
    await act(async () => {
      render(
        <ProtectedRoute>
          <div>Content</div>
        </ProtectedRoute>
      );
    });

    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(stableFetchUser).not.toHaveBeenCalled();
  });
});
