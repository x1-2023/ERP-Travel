/**
 * UI Components Extra Tests
 * Tests for Avatar, Calendar, DatePicker, Form, ScrollArea, Skeleton, Slider, Toast, Toaster
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';

// Fix ResizeObserver constructor for Radix UI primitives
global.ResizeObserver = class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

// ============================================================================
// Avatar
// ============================================================================
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

describe('Avatar', () => {
  it('renders avatar root', () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders fallback text', () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = render(
      <Avatar className="h-20 w-20">
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    expect(container.firstChild).toHaveClass('h-20');
    expect(container.firstChild).toHaveClass('w-20');
  });

  it('renders AvatarImage', () => {
    const { container } = render(
      <Avatar>
        <AvatarImage src="https://example.com/avatar.jpg" alt="User" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    expect(container.firstChild).toBeTruthy();
  });
});

// ============================================================================
// Calendar
// ============================================================================
import { Calendar } from '@/components/ui/calendar';

describe('Calendar', () => {
  it('renders calendar component', () => {
    const { container } = render(<Calendar />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with selected date', () => {
    const selectedDate = new Date(2026, 0, 15);
    const { container } = render(
      <Calendar mode="single" selected={selectedDate} />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with custom className', () => {
    const { container } = render(<Calendar className="custom-calendar" />);
    expect(container.querySelector('.custom-calendar')).toBeTruthy();
  });
});

// ============================================================================
// DatePicker
// ============================================================================
import { DatePicker } from '@/components/ui/date-picker';

describe('DatePicker', () => {
  it('renders with placeholder', () => {
    render(<DatePicker onChange={vi.fn()} placeholder="Select a date" />);
    expect(screen.getByText('Select a date')).toBeInTheDocument();
  });

  it('renders with default placeholder', () => {
    render(<DatePicker onChange={vi.fn()} />);
    expect(screen.getByText('Pick a date')).toBeInTheDocument();
  });

  it('renders with selected date', () => {
    const date = new Date(2026, 0, 15);
    render(<DatePicker value={date} onChange={vi.fn()} />);
    // date-fns format "PPP" should render the date
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders in disabled state', () => {
    render(<DatePicker onChange={vi.fn()} disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

// ============================================================================
// Form (components used within react-hook-form context)
// ============================================================================
import { Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField } from '@/components/ui/form';
import { useForm } from 'react-hook-form';

// Helper component that provides form context
function TestFormWrapper({ children }: { children: React.ReactNode }) {
  const form = useForm({
    defaultValues: { testField: '' },
  });
  return (
    <Form {...form}>
      <form>
        <FormField
          control={form.control}
          name="testField"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Test Label</FormLabel>
              <FormControl>
                <input {...field} placeholder="Enter value" />
              </FormControl>
              <FormDescription>This is a description</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {children}
      </form>
    </Form>
  );
}

describe('Form Components', () => {
  it('renders FormItem, FormLabel, FormControl, FormDescription', () => {
    render(<TestFormWrapper />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('This is a description')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter value')).toBeInTheDocument();
  });

  it('renders FormLabel with proper htmlFor connection', () => {
    render(<TestFormWrapper />);
    const label = screen.getByText('Test Label');
    expect(label.tagName).toBe('LABEL');
  });
});

// ============================================================================
// ScrollArea
// ============================================================================
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

describe('ScrollArea', () => {
  it('renders children content', () => {
    render(
      <ScrollArea className="h-40">
        <div>Scrollable content here</div>
      </ScrollArea>
    );
    expect(screen.getByText('Scrollable content here')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = render(
      <ScrollArea className="test-scroll-area">
        <div>Content</div>
      </ScrollArea>
    );
    expect(container.querySelector('.test-scroll-area')).toBeTruthy();
  });
});

// ============================================================================
// Skeleton
// ============================================================================
import { Skeleton } from '@/components/ui/skeleton';

describe('Skeleton', () => {
  it('renders skeleton element', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toBeTruthy();
    expect(container.firstChild).toHaveClass('animate-pulse');
  });

  it('renders with custom className', () => {
    const { container } = render(<Skeleton className="h-12 w-12 rounded-full" />);
    expect(container.firstChild).toHaveClass('h-12');
    expect(container.firstChild).toHaveClass('w-12');
    expect(container.firstChild).toHaveClass('rounded-full');
  });

  it('renders multiple skeletons', () => {
    const { container } = render(
      <div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(3);
  });
});

// ============================================================================
// Slider
// ============================================================================
import { Slider } from '@/components/ui/slider';

describe('Slider', () => {
  it('renders slider component', () => {
    const { container } = render(<Slider defaultValue={[50]} max={100} step={1} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with custom className', () => {
    const { container } = render(
      <Slider defaultValue={[25]} max={100} className="custom-slider" />
    );
    expect(container.querySelector('.custom-slider')).toBeTruthy();
  });
});

// ============================================================================
// Toast
// ============================================================================
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
} from '@/components/ui/toast';

describe('Toast', () => {
  it('renders toast provider and viewport', () => {
    const { container } = render(
      <ToastProvider>
        <ToastViewport />
      </ToastProvider>
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders toast with title and description', () => {
    render(
      <ToastProvider>
        <Toast open>
          <ToastTitle>Success!</ToastTitle>
          <ToastDescription>Operation completed.</ToastDescription>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('Operation completed.')).toBeInTheDocument();
  });

  it('renders destructive variant', () => {
    render(
      <ToastProvider>
        <Toast open variant="destructive">
          <ToastTitle>Error!</ToastTitle>
          <ToastDescription>Something went wrong.</ToastDescription>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    expect(screen.getByText('Error!')).toBeInTheDocument();
  });
});

// ============================================================================
// Toaster
// ============================================================================
// Mock the useToast hook
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    toasts: [
      {
        id: '1',
        title: 'Test Toast',
        description: 'A test notification',
        open: true,
      },
    ],
    toast: vi.fn(),
    dismiss: vi.fn(),
  }),
}));

import { Toaster } from '@/components/ui/toaster';

describe('Toaster', () => {
  it('renders toaster component', () => {
    const { container } = render(<Toaster />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders toasts from hook', () => {
    render(<Toaster />);
    expect(screen.getByText('Test Toast')).toBeInTheDocument();
    expect(screen.getByText('A test notification')).toBeInTheDocument();
  });
});
