/**
 * API Client Tests
 */
import { describe, it, expect, vi, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import api, { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('api instance', () => {
  it('has correct baseURL', () => {
    expect(api.defaults.baseURL).toBe('/api');
  });

  it('has correct timeout', () => {
    expect(api.defaults.timeout).toBe(30000);
  });

  it('has correct content-type header', () => {
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });
});

describe('apiGet', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/test-endpoint', () => {
        return HttpResponse.json({
          success: true,
          data: { items: [1, 2, 3] },
        });
      })
    );
  });

  it('makes GET request and returns data', async () => {
    const result = await apiGet('/test-endpoint');
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ items: [1, 2, 3] });
  });

  it('passes query params', async () => {
    server.use(
      http.get('/api/test-endpoint', ({ request }) => {
        const url = new URL(request.url);
        const page = url.searchParams.get('page');
        return HttpResponse.json({
          success: true,
          data: { page: Number(page) },
        });
      })
    );
    const result = await apiGet('/test-endpoint', { page: 2 });
    expect(result.data).toEqual({ page: 2 });
  });

  it('handles error response', async () => {
    server.use(
      http.get('/api/test-error', () => {
        return HttpResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Not found' } },
          { status: 404 }
        );
      })
    );
    await expect(apiGet('/test-error')).rejects.toThrow('Not found');
  });
});

describe('apiPost', () => {
  beforeEach(() => {
    server.use(
      http.post('/api/test-create', async ({ request }) => {
        const body = await request.json() as Record<string, unknown>;
        return HttpResponse.json({
          success: true,
          data: { id: 'new-1', ...body },
        });
      })
    );
  });

  it('makes POST request with data', async () => {
    const result = await apiPost('/test-create', { name: 'Test' });
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({ name: 'Test' });
  });

  it('handles post without data', async () => {
    server.use(
      http.post('/api/test-action', () => {
        return HttpResponse.json({ success: true, data: { triggered: true } });
      })
    );
    const result = await apiPost('/test-action');
    expect(result.success).toBe(true);
  });
});

describe('apiPatch', () => {
  beforeEach(() => {
    server.use(
      http.patch('/api/test-update/:id', async ({ request, params }) => {
        const body = await request.json() as Record<string, unknown>;
        return HttpResponse.json({
          success: true,
          data: { id: params.id, ...body },
        });
      })
    );
  });

  it('makes PATCH request', async () => {
    const result = await apiPatch('/test-update/1', { name: 'Updated' });
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({ id: '1', name: 'Updated' });
  });
});

describe('apiDelete', () => {
  beforeEach(() => {
    server.use(
      http.delete('/api/test-delete/:id', () => {
        return HttpResponse.json({ success: true, data: null });
      })
    );
  });

  it('makes DELETE request', async () => {
    const result = await apiDelete('/test-delete/1');
    expect(result.success).toBe(true);
  });
});

describe('error handling', () => {
  it('extracts error message from response', async () => {
    server.use(
      http.get('/api/test-error-msg', () => {
        return HttpResponse.json(
          { success: false, error: { code: 'VALIDATION', message: 'Invalid input' } },
          { status: 400 }
        );
      })
    );
    await expect(apiGet('/test-error-msg')).rejects.toThrow('Invalid input');
  });

  it('falls back to generic error message', async () => {
    server.use(
      http.get('/api/test-generic-error', () => {
        return HttpResponse.error();
      })
    );
    await expect(apiGet('/test-generic-error')).rejects.toThrow();
  });
});
