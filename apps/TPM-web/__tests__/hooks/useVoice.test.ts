/**
 * Voice Hooks Tests
 * Tests for src/hooks/voice/useVoiceCommands.ts
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  useTranscribe,
  useProcessCommand,
  useCommandHistory,
  useVoiceSuggestions,
} from '@/hooks/voice';
import { createWrapper } from '../test-utils';

// Mock data
const mockTranscribeResponse = {
  text: 'Show me the sales report for January',
  confidence: 0.95,
  language: 'en',
};

const mockProcessCommandResponse = {
  commandId: 'cmd-1',
  intent: 'SHOW_REPORT',
  entities: { reportType: 'sales', period: 'January' },
  response: 'Here is the sales report for January',
  action: { type: 'NAVIGATE', path: '/reports/sales?period=january' },
  confidence: 0.92,
};

const mockCommandHistory = {
  data: [
    {
      id: 'cmd-1',
      text: 'Show sales report',
      intent: 'SHOW_REPORT',
      response: 'Showing sales report',
      status: 'COMPLETED',
      createdAt: '2024-02-01T10:00:00Z',
    },
    {
      id: 'cmd-2',
      text: 'Create new promotion',
      intent: 'CREATE_PROMOTION',
      response: 'Opening promotion form',
      status: 'COMPLETED',
      createdAt: '2024-02-01T09:00:00Z',
    },
  ],
  pagination: {
    page: 1,
    pageSize: 10,
    totalCount: 2,
    totalPages: 1,
  },
};

const mockVoiceSuggestions = {
  suggestions: [
    {
      text: 'Show me the dashboard',
      category: 'NAVIGATION',
      description: 'Navigate to main dashboard',
    },
    {
      text: 'Create a new promotion',
      category: 'ACTION',
      description: 'Start creating a new promotion',
    },
    {
      text: 'What is my budget utilization?',
      category: 'QUERY',
      description: 'Check current budget status',
    },
  ],
};

const server = setupServer(
  http.post('*/api/voice/transcribe', () => {
    return HttpResponse.json(mockTranscribeResponse);
  }),

  http.post('*/api/voice/process', () => {
    return HttpResponse.json(mockProcessCommandResponse);
  }),

  http.get('*/api/voice/commands', ({ request }) => {
    const url = new URL(request.url);
    const page = url.searchParams.get('page') || '1';
    const pageSize = url.searchParams.get('pageSize') || '10';

    return HttpResponse.json({
      ...mockCommandHistory,
      pagination: {
        ...mockCommandHistory.pagination,
        page: Number(page),
        pageSize: Number(pageSize),
      },
    });
  }),

  http.get('*/api/voice/suggestions', () => {
    return HttpResponse.json(mockVoiceSuggestions);
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useTranscribe', () => {
  it('should transcribe audio data', async () => {
    const { result } = renderHook(() => useTranscribe(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        audioData: 'base64-encoded-audio-data',
        format: 'wav',
        language: 'en',
      } as any);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockTranscribeResponse);
    expect(result.current.data!.text).toBe('Show me the sales report for January');
    expect(result.current.data!.confidence).toBe(0.95);
  });

  it('should handle transcription errors', async () => {
    server.use(
      http.post('*/api/voice/transcribe', () => {
        return HttpResponse.json(
          { error: { code: 'TRANSCRIPTION_FAILED', message: 'Could not transcribe audio' } },
          { status: 400 },
        );
      }),
    );

    const { result } = renderHook(() => useTranscribe(), {
      wrapper: createWrapper(),
    });

    try {
      await act(async () => {
        await result.current.mutateAsync({
          audioData: 'invalid',
          format: 'wav',
        } as any);
      });
    } catch {
      // Expected to throw
    }

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useProcessCommand', () => {
  it('should process a voice command', async () => {
    const { result } = renderHook(() => useProcessCommand(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        text: 'Show me the sales report for January',
        context: { currentPage: '/dashboard' },
      } as any);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockProcessCommandResponse);
    expect(result.current.data!.intent).toBe('SHOW_REPORT');
    expect(result.current.data!.confidence).toBe(0.92);
  });

  it('should handle processing errors', async () => {
    server.use(
      http.post('*/api/voice/process', () => {
        return HttpResponse.json(
          { error: { code: 'PROCESSING_FAILED', message: 'Command not understood' } },
          { status: 400 },
        );
      }),
    );

    const { result } = renderHook(() => useProcessCommand(), {
      wrapper: createWrapper(),
    });

    try {
      await act(async () => {
        await result.current.mutateAsync({
          text: 'unintelligible command',
        } as any);
      });
    } catch {
      // Expected to throw
    }

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useCommandHistory', () => {
  it('should fetch command history', async () => {
    const { result } = renderHook(() => useCommandHistory(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data!.data).toHaveLength(2);
    expect(result.current.data!.data[0].id).toBe('cmd-1');
    expect(result.current.data!.data[0].intent).toBe('SHOW_REPORT');
  });

  it('should fetch with pagination params', async () => {
    const { result } = renderHook(
      () => useCommandHistory({ page: 2, pageSize: 5 }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data!.pagination.page).toBe(2);
    expect(result.current.data!.pagination.pageSize).toBe(5);
  });

  it('should handle API errors', async () => {
    server.use(
      http.get('*/api/voice/commands', () => {
        return HttpResponse.json(
          { error: { code: 'SERVER_ERROR', message: 'Internal error' } },
          { status: 500 },
        );
      }),
    );

    const { result } = renderHook(() => useCommandHistory(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useVoiceSuggestions', () => {
  it('should fetch voice suggestions', async () => {
    const { result } = renderHook(() => useVoiceSuggestions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data!.suggestions).toHaveLength(3);
    expect(result.current.data!.suggestions[0].text).toBe('Show me the dashboard');
    expect(result.current.data!.suggestions[0].category).toBe('NAVIGATION');
  });

  it('should handle API errors', async () => {
    server.use(
      http.get('*/api/voice/suggestions', () => {
        return HttpResponse.json(
          { error: { code: 'SERVER_ERROR', message: 'Internal error' } },
          { status: 500 },
        );
      }),
    );

    const { result } = renderHook(() => useVoiceSuggestions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
