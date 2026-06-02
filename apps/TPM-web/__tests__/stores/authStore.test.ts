/**
 * Auth Store Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAuthStore, selectUser, selectIsAuthenticated, selectIsLoading } from '@/stores/authStore';

// Mock the api module
const mockPost = vi.fn();
const mockGet = vi.fn();

vi.mock('@/lib/api', () => ({
  default: {
    post: (...args: unknown[]) => mockPost(...args),
    get: (...args: unknown[]) => mockGet(...args),
  },
}));

describe('authStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('setTokens', () => {
    it('should set tokens and mark as authenticated', () => {
      useAuthStore.getState().setTokens('access-token', 'refresh-token');

      const state = useAuthStore.getState();
      expect(state.accessToken).toBe('access-token');
      expect(state.refreshToken).toBe('refresh-token');
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('setUser', () => {
    it('should set user data', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ADMIN',
      };

      useAuthStore.getState().setUser(mockUser);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
    });
  });

  describe('logout', () => {
    it('should reset state to initial values', () => {
      // First set some state
      useAuthStore.setState({
        user: { id: '1', email: 'test@example.com', name: 'Test', role: 'ADMIN' },
        accessToken: 'token',
        refreshToken: 'refresh',
        isAuthenticated: true,
      });

      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      useAuthStore.setState({ error: 'Some error' });

      useAuthStore.getState().clearError();

      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe('selectors', () => {
    it('selectUser should return user', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ADMIN',
      };
      useAuthStore.setState({ user: mockUser });

      expect(selectUser(useAuthStore.getState())).toEqual(mockUser);
    });

    it('selectIsAuthenticated should return isAuthenticated', () => {
      useAuthStore.setState({ isAuthenticated: true });

      expect(selectIsAuthenticated(useAuthStore.getState())).toBe(true);
    });

    it('selectIsLoading should return isLoading', () => {
      useAuthStore.setState({ isLoading: true });

      expect(selectIsLoading(useAuthStore.getState())).toBe(true);
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            user: { id: 'user-1', email: 'admin@example.com', name: 'Admin User', role: 'ADMIN' },
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
          },
        },
      });

      await useAuthStore.getState().login('admin@example.com', 'password');
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toBeDefined();
      expect(state.user?.email).toBe('admin@example.com');
      expect(state.accessToken).toBe('mock-access-token');
      expect(state.refreshToken).toBe('mock-refresh-token');
      expect(state.isLoading).toBe(false);
    });

    it('should set loading during login', async () => {
      // Use a delayed mock to check intermediate loading state
      let resolveLogin: (value: unknown) => void;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });

      mockPost.mockReturnValueOnce(loginPromise);

      const loginCall = useAuthStore.getState().login('admin@example.com', 'password');

      // State should be loading
      expect(useAuthStore.getState().isLoading).toBe(true);
      expect(useAuthStore.getState().error).toBeNull();

      // Resolve the login
      resolveLogin!({
        data: {
          success: true,
          data: {
            user: { id: 'user-1', email: 'admin@example.com', name: 'Admin', role: 'ADMIN' },
            accessToken: 'token',
            refreshToken: 'refresh',
          },
        },
      });

      await loginCall;
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('should handle login failure', async () => {
      mockPost.mockRejectedValueOnce(new Error('Invalid email or password'));

      await expect(
        useAuthStore.getState().login('wrong@example.com', 'wrong')
      ).rejects.toThrow('Invalid email or password');

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Invalid email or password');
    });

    it('should handle non-Error login failure', async () => {
      mockPost.mockRejectedValueOnce('string error');

      await expect(
        useAuthStore.getState().login('wrong@example.com', 'wrong')
      ).rejects.toBe('string error');

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe('Login failed');
    });

    it('should call api.post with correct arguments', async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            user: { id: 'user-1', email: 'admin@example.com', name: 'Admin', role: 'ADMIN' },
            accessToken: 'token',
            refreshToken: 'refresh',
          },
        },
      });

      await useAuthStore.getState().login('admin@example.com', 'password');

      expect(mockPost).toHaveBeenCalledWith('/auth/login', {
        email: 'admin@example.com',
        password: 'password',
      });
    });
  });

  describe('register', () => {
    it('should register and then login', async () => {
      // First call is register, second call is login (called by register internally)
      mockPost
        .mockResolvedValueOnce({
          data: { success: true },
        })
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: {
              user: { id: 'user-1', email: 'new@example.com', name: 'New User', role: 'USER' },
              accessToken: 'new-token',
              refreshToken: 'new-refresh',
            },
          },
        });

      await useAuthStore.getState().register({
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
        companyId: 'comp-1',
      });

      expect(mockPost).toHaveBeenCalledTimes(2);
      expect(mockPost).toHaveBeenNthCalledWith(1, '/auth/register', {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
        companyId: 'comp-1',
      });
      expect(mockPost).toHaveBeenNthCalledWith(2, '/auth/login', {
        email: 'new@example.com',
        password: 'password123',
      });

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.email).toBe('new@example.com');
    });

    it('should handle register failure', async () => {
      mockPost.mockRejectedValueOnce(new Error('Registration failed'));

      await expect(
        useAuthStore.getState().register({
          email: 'new@example.com',
          password: 'password123',
          name: 'New User',
          companyId: 'comp-1',
        })
      ).rejects.toThrow('Registration failed');

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Registration failed');
    });

    it('should set loading during register', async () => {
      let resolveRegister: (value: unknown) => void;
      const registerPromise = new Promise((resolve) => {
        resolveRegister = resolve;
      });

      mockPost.mockReturnValueOnce(registerPromise);

      const registerCall = useAuthStore.getState().register({
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
        companyId: 'comp-1',
      });

      expect(useAuthStore.getState().isLoading).toBe(true);

      // Mock the login call that register triggers after success
      mockPost.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            user: { id: 'user-1', email: 'new@example.com', name: 'New User', role: 'USER' },
            accessToken: 'token',
            refreshToken: 'refresh',
          },
        },
      });

      resolveRegister!({ data: { success: true } });

      await registerCall;
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('fetchUser', () => {
    it('should fetch and set user data', async () => {
      mockGet.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            id: 'user-1',
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'ADMIN',
            company: { id: 'comp-1', name: 'Company' },
          },
        },
      });

      useAuthStore.getState().setTokens('token', 'refresh');
      await useAuthStore.getState().fetchUser();

      const state = useAuthStore.getState();
      expect(state.user).toBeDefined();
      expect(state.user?.email).toBe('admin@example.com');
      expect(state.user?.name).toBe('Admin User');
      expect(state.user?.role).toBe('ADMIN');
    });

    it('should call api.get with correct endpoint', async () => {
      mockGet.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            id: 'user-1',
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'ADMIN',
          },
        },
      });

      await useAuthStore.getState().fetchUser();

      expect(mockGet).toHaveBeenCalledWith('/auth/me');
    });

    it('should logout on fetchUser failure', async () => {
      mockGet.mockRejectedValueOnce(new Error('Unauthorized'));

      // Set some auth state first
      useAuthStore.setState({
        user: { id: 'user-1', email: 'admin@example.com', name: 'Admin', role: 'ADMIN' },
        accessToken: 'token',
        refreshToken: 'refresh',
        isAuthenticated: true,
      });

      await useAuthStore.getState().fetchUser();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });
});
