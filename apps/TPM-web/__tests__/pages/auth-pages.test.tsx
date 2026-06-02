/**
 * Auth Pages & Error Pages Smoke Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';

// Mock auth store
vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    isLoading: false,
    isAuthenticated: false,
    user: null,
    error: null,
    clearError: vi.fn(),
  }),
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: vi.fn() }),
  toast: vi.fn(),
}));

import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import NotFound from '@/pages/errors/NotFound';

describe('Login Page', () => {
  it('renders email and password fields', () => {
    render(<Login />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('renders sign in button', () => {
    render(<Login />);
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('renders forgot password link', () => {
    render(<Login />);
    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
  });

  it('renders sign up link', () => {
    render(<Login />);
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });

  it('renders demo credentials section', () => {
    render(<Login />);
    expect(screen.getByText('Test Accounts:')).toBeInTheDocument();
    expect(screen.getByText('Fill Admin Credentials')).toBeInTheDocument();
  });

  it('pre-fills admin credentials', () => {
    render(<Login />);
    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    expect(emailInput.value).toBe('admin@your-domain.com');
  });
});

describe('Register Page', () => {
  it('renders registration form fields', () => {
    render(<Register />);
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
  });

  it('renders create account button', () => {
    render(<Register />);
    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument();
  });

  it('renders sign in link', () => {
    render(<Register />);
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });
});

describe('ForgotPassword Page', () => {
  it('renders forgot password heading', () => {
    render(<ForgotPassword />);
    expect(screen.getByText('Forgot your password?')).toBeInTheDocument();
  });

  it('renders email input', () => {
    render(<ForgotPassword />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders send reset link button', () => {
    render(<ForgotPassword />);
    expect(screen.getByRole('button', { name: 'Send reset link' })).toBeInTheDocument();
  });

  it('renders back to login link', () => {
    render(<ForgotPassword />);
    expect(screen.getByText('Back to login')).toBeInTheDocument();
  });
});

describe('NotFound Page', () => {
  it('renders 404 text', () => {
    render(<NotFound />);
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('renders page not found message', () => {
    render(<NotFound />);
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    expect(screen.getByText("The page you're looking for doesn't exist.")).toBeInTheDocument();
  });

  it('renders go home button', () => {
    render(<NotFound />);
    expect(screen.getByText('Go Home')).toBeInTheDocument();
  });
});
