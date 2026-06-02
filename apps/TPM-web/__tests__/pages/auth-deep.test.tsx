/**
 * Deep Tests for Auth Pages
 * Covers: Login (form interaction, submit, fill demo, error display),
 *         Register (form interaction, password mismatch, submit),
 *         ForgotPassword (form submit, sent state transition)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test-utils';

// Mock auth store
const mockLogin = vi.fn().mockResolvedValue({});
const mockRegister = vi.fn().mockResolvedValue({});
const mockClearError = vi.fn();
vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    login: mockLogin,
    register: mockRegister,
    logout: vi.fn(),
    isLoading: false,
    isAuthenticated: false,
    user: null,
    error: null,
    clearError: mockClearError,
  }),
}));

const mockToast = vi.fn();
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: mockToast }),
  toast: vi.fn(),
}));

import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';

beforeEach(() => {
  vi.clearAllMocks();
});

// ============================================================================
// LOGIN DEEP TESTS
// ============================================================================

describe('Login - Deep Tests', () => {
  it('pre-fills email with admin credentials', () => {
    render(<Login />);
    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    expect(emailInput.value).toBe('admin@your-domain.com');
  });

  it('pre-fills password with admin credentials', () => {
    render(<Login />);
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    expect(passwordInput.value).toBe('admin123');
  });

  it('allows changing email', () => {
    render(<Login />);
    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
    expect(emailInput.value).toBe('user@test.com');
  });

  it('allows changing password', () => {
    render(<Login />);
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    fireEvent.change(passwordInput, { target: { value: 'newpassword' } });
    expect(passwordInput.value).toBe('newpassword');
  });

  it('renders forgot password link', () => {
    render(<Login />);
    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
  });

  it('renders sign up link', () => {
    render(<Login />);
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });

  it('renders demo credentials info', () => {
    render(<Login />);
    expect(screen.getByText('Test Accounts:')).toBeInTheDocument();
    expect(screen.getByText(/Admin: admin@your-domain.com/)).toBeInTheDocument();
    expect(screen.getByText(/Manager: manager@your-domain.com/)).toBeInTheDocument();
  });

  it('renders Fill Admin Credentials button', () => {
    render(<Login />);
    expect(screen.getByText('Fill Admin Credentials')).toBeInTheDocument();
  });

  it('fills admin credentials on button click', () => {
    render(<Login />);
    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;

    // Clear first
    fireEvent.change(emailInput, { target: { value: '' } });
    fireEvent.change(passwordInput, { target: { value: '' } });

    // Click fill button
    fireEvent.click(screen.getByText('Fill Admin Credentials'));
    expect(emailInput.value).toBe('admin@your-domain.com');
    expect(passwordInput.value).toBe('admin123');
  });

  it('calls login on form submit', async () => {
    render(<Login />);
    const submitButton = screen.getByRole('button', { name: 'Sign in' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockClearError).toHaveBeenCalled();
      expect(mockLogin).toHaveBeenCalledWith('admin@your-domain.com', 'admin123');
    });
  });

  it('email input has correct type', () => {
    render(<Login />);
    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    expect(emailInput.type).toBe('email');
  });

  it('password input has correct type', () => {
    render(<Login />);
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    expect(passwordInput.type).toBe('password');
  });

  it('email input has correct placeholder', () => {
    render(<Login />);
    expect(screen.getByPlaceholderText('name@company.com')).toBeInTheDocument();
  });
});

// ============================================================================
// REGISTER DEEP TESTS
// ============================================================================

describe('Register - Deep Tests', () => {
  it('renders all form fields', () => {
    render(<Register />);
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
  });

  it('renders Create account button', () => {
    render(<Register />);
    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument();
  });

  it('renders Sign in link', () => {
    render(<Register />);
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });

  it('allows typing in all fields', () => {
    render(<Register />);
    const nameInput = screen.getByLabelText('Full Name') as HTMLInputElement;
    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const confirmInput = screen.getByLabelText('Confirm Password') as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'pass123' } });
    fireEvent.change(confirmInput, { target: { value: 'pass123' } });

    expect(nameInput.value).toBe('John Doe');
    expect(emailInput.value).toBe('john@test.com');
    expect(passwordInput.value).toBe('pass123');
    expect(confirmInput.value).toBe('pass123');
  });

  it('shows error toast on password mismatch', async () => {
    render(<Register />);
    const nameInput = screen.getByLabelText('Full Name') as HTMLInputElement;
    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const confirmInput = screen.getByLabelText('Confirm Password') as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'John' } });
    fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'pass123' } });
    fireEvent.change(confirmInput, { target: { value: 'pass456' } });

    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'destructive',
          title: 'Error',
          description: 'Passwords do not match',
        })
      );
    });
  });

  it('calls register when passwords match', async () => {
    render(<Register />);
    const nameInput = screen.getByLabelText('Full Name') as HTMLInputElement;
    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const confirmInput = screen.getByLabelText('Confirm Password') as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'John' } });
    fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'pass123' } });
    fireEvent.change(confirmInput, { target: { value: 'pass123' } });

    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(mockClearError).toHaveBeenCalled();
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'John',
        email: 'john@test.com',
        password: 'pass123',
        companyId: 'default',
      });
    });
  });

  it('has correct placeholder texts', () => {
    render(<Register />);
    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('name@company.com')).toBeInTheDocument();
  });

  it('name input has text type', () => {
    render(<Register />);
    const nameInput = screen.getByLabelText('Full Name') as HTMLInputElement;
    expect(nameInput.type).toBe('text');
  });
});

// ============================================================================
// FORGOT PASSWORD DEEP TESTS
// ============================================================================

describe('ForgotPassword - Deep Tests', () => {
  it('renders heading', () => {
    render(<ForgotPassword />);
    expect(screen.getByText('Forgot your password?')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<ForgotPassword />);
    expect(screen.getByText("Enter your email and we'll send you reset instructions.")).toBeInTheDocument();
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

  it('allows typing email', () => {
    render(<ForgotPassword />);
    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
    expect(emailInput.value).toBe('user@test.com');
  });

  it('transitions to sent state after submit', async () => {
    render(<ForgotPassword />);
    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'user@test.com' } });

    const submitButton = screen.getByRole('button', { name: 'Send reset link' });
    fireEvent.click(submitButton);

    // Should show "Sending..." during loading
    expect(screen.getByText('Sending...')).toBeInTheDocument();

    // Wait for sent state
    await waitFor(() => {
      expect(screen.getByText('Check your email')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Should show the email address
    expect(screen.getByText('user@test.com')).toBeInTheDocument();
  });

  it('email input has correct placeholder', () => {
    render(<ForgotPassword />);
    expect(screen.getByPlaceholderText('name@company.com')).toBeInTheDocument();
  });

  it('email input has correct type', () => {
    render(<ForgotPassword />);
    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    expect(emailInput.type).toBe('email');
  });
});
