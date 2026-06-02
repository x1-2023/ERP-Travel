// =============================================================================
// Tests for src/mocks/setup.ts and src/mocks/browser.ts
// These files import msw/browser which is not available in test (node) env,
// so we mock the MSW module and verify the files export correctly.
// =============================================================================

import { describe, it, expect, vi } from 'vitest';

// Mock msw/browser since it's browser-only and unavailable in jsdom/node
vi.mock('msw/browser', () => ({
  setupWorker: vi.fn((...handlers: any[]) => ({
    start: vi.fn(),
    stop: vi.fn(),
    use: vi.fn(),
    resetHandlers: vi.fn(),
    handlers,
  })),
}));

// Mock handlers to avoid importing the full handler chain with side effects
vi.mock('@/mocks/handlers', () => ({
  handlers: [
    { info: { method: 'GET', path: '/api/test' } },
    { info: { method: 'POST', path: '/api/test' } },
  ],
}));

describe('mocks/setup.ts', () => {
  it('should export worker from setup', async () => {
    const setupModule = await import('@/mocks/setup');
    expect(setupModule).toHaveProperty('worker');
    expect(setupModule.worker).toBeDefined();
  });
});

describe('mocks/browser.ts', () => {
  it('should export worker from browser', async () => {
    const browserModule = await import('@/mocks/browser');
    expect(browserModule).toHaveProperty('worker');
    expect(browserModule.worker).toBeDefined();
  });
});
