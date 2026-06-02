// tests/utils/test-utils.tsx
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * LAC VIET HR - Custom Test Utilities
 * Provides wrapped render function with common providers
 */

// ════════════════════════════════════════════════════════════════════════════════
// PROVIDERS
// ════════════════════════════════════════════════════════════════════════════════

interface AllProvidersProps {
  children: React.ReactNode;
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

function AllProviders({ children }: AllProvidersProps) {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// CUSTOM RENDER
// ════════════════════════════════════════════════════════════════════════════════

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withUser?: boolean;
}

function customRender(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  const { withUser = true, ...renderOptions } = options || {};

  const result = render(ui, {
    wrapper: AllProviders,
    ...renderOptions,
  });

  return {
    ...result,
    user: withUser ? userEvent.setup() : undefined,
  };
}

// ════════════════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Wait for component to finish loading
 */
async function waitForLoadingToFinish() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Create mock props with required fields
 */
function createMockProps<T extends object>(overrides: Partial<T> = {}): T {
  return overrides as T;
}

/**
 * Create mock event
 */
function createMockEvent<T extends Event>(
  type: string,
  properties: Partial<T> = {}
): T {
  const event = new Event(type, { bubbles: true, cancelable: true }) as T;
  Object.assign(event, properties);
  return event;
}

// ════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════════

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };
export {
  createTestQueryClient,
  waitForLoadingToFinish,
  createMockProps,
  createMockEvent,
};
