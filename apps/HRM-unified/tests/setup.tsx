// tests/setup.ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll, vi } from 'vitest';
import { server } from './mocks/server';

/**
 * LAC VIET HR - Test Setup
 * Global setup for all Vitest tests
 */

// ════════════════════════════════════════════════════════════════════════════
// MSW SERVER SETUP
// ════════════════════════════════════════════════════════════════════════════

beforeAll(() => {
  // Start MSW server before all tests
  server.listen({ onUnhandledRequest: 'warn' });
});

afterEach(() => {
  // Reset handlers after each test
  server.resetHandlers();
  // Clean up React Testing Library
  cleanup();
});

afterAll(() => {
  // Close MSW server after all tests
  server.close();
});

// ════════════════════════════════════════════════════════════════════════════
// BROWSER API MOCKS
// ════════════════════════════════════════════════════════════════════════════

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  takeRecords = vi.fn().mockReturnValue([]);
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock ResizeObserver
class MockResizeObserver implements ResizeObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
});

// ════════════════════════════════════════════════════════════════════════════
// NEXT.JS MOCKS
// ════════════════════════════════════════════════════════════════════════════

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  },
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => {
    return <a href={href} {...props}>{children}</a>;
  },
}));

// ════════════════════════════════════════════════════════════════════════════
// DATE MOCKS
// ════════════════════════════════════════════════════════════════════════════

// Fixed date for consistent testing
const MOCK_DATE = new Date('2024-01-15T10:00:00.000Z');

vi.useFakeTimers();
vi.setSystemTime(MOCK_DATE);

// ════════════════════════════════════════════════════════════════════════════
// CONSOLE SUPPRESSION (Optional)
// ════════════════════════════════════════════════════════════════════════════

// Suppress specific console warnings during tests
const originalError = console.error;
console.error = (...args: unknown[]) => {
  // Suppress React act() warnings
  if (typeof args[0] === 'string' && args[0].includes('Warning: ReactDOM.render is no longer supported')) {
    return;
  }
  // Suppress specific expected errors
  if (typeof args[0] === 'string' && args[0].includes('Not implemented: navigation')) {
    return;
  }
  originalError.call(console, ...args);
};

// ════════════════════════════════════════════════════════════════════════════
// GLOBAL TEST UTILITIES
// ════════════════════════════════════════════════════════════════════════════

// Add custom matchers or utilities here
declare global {
  namespace Vi {
    interface Assertion {
      toBeWithinRange(min: number, max: number): void;
    }
  }
}

// Custom matcher example
expect.extend({
  toBeWithinRange(received: number, min: number, max: number) {
    const pass = received >= min && received <= max;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${min} - ${max}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${min} - ${max}`,
        pass: false,
      };
    }
  },
});
