/**
 * Input Component Tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';
import { Input } from '@/components/ui/input';

describe('Input', () => {
  it('should render input element', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should render as input element', () => {
    render(<Input data-testid="input" />);
    expect(screen.getByTestId('input').tagName).toBe('INPUT');
  });

  it('should accept text input', () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId('input');
    fireEvent.change(input, { target: { value: 'hello' } });
    expect(input).toHaveValue('hello');
  });

  it('should handle onChange', () => {
    const onChange = vi.fn();
    render(<Input onChange={onChange} data-testid="input" />);
    fireEvent.change(screen.getByTestId('input'), { target: { value: 'test' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('should render with type prop', () => {
    render(<Input type="password" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'password');
  });

  it('should render with number type', () => {
    render(<Input type="number" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'number');
  });

  it('should render with email type', () => {
    render(<Input type="email" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'email');
  });

  it('should be disabled when disabled prop is set', () => {
    render(<Input disabled data-testid="input" />);
    expect(screen.getByTestId('input')).toBeDisabled();
  });

  it('should apply custom className', () => {
    render(<Input className="custom-class" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveClass('custom-class');
  });

  it('should forward ref', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('should render with value prop', () => {
    render(<Input value="initial" readOnly data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveValue('initial');
  });

  it('should handle focus events', () => {
    const onFocus = vi.fn();
    render(<Input onFocus={onFocus} data-testid="input" />);
    fireEvent.focus(screen.getByTestId('input'));
    expect(onFocus).toHaveBeenCalled();
  });

  it('should handle blur events', () => {
    const onBlur = vi.fn();
    render(<Input onBlur={onBlur} data-testid="input" />);
    fireEvent.blur(screen.getByTestId('input'));
    expect(onBlur).toHaveBeenCalled();
  });

  it('should have base styles', () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('flex', 'h-8', 'w-full', 'rounded', 'border');
  });

  it('should have mono font', () => {
    render(<Input data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveClass('font-mono');
  });

  it('should accept name attribute', () => {
    render(<Input name="username" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('name', 'username');
  });

  it('should accept required attribute', () => {
    render(<Input required data-testid="input" />);
    expect(screen.getByTestId('input')).toBeRequired();
  });

  it('should handle keydown events', () => {
    const onKeyDown = vi.fn();
    render(<Input onKeyDown={onKeyDown} data-testid="input" />);
    fireEvent.keyDown(screen.getByTestId('input'), { key: 'Enter' });
    expect(onKeyDown).toHaveBeenCalled();
  });
});
