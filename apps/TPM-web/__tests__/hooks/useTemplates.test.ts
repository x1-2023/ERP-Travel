/**
 * useTemplates Hook Tests
 * Tests for planning template hooks
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { createWrapper } from '../test-utils';
import { server } from '../mocks/server';

import {
  templateKeys,
  useTemplates,
  useTemplate,
  useTemplateVersions,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  useApplyTemplate,
} from '@/hooks/planning/useTemplates';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ══════════════════════════════════════════════════════════════════════════════
// Query Key Factory Tests
// ══════════════════════════════════════════════════════════════════════════════

describe('templateKeys', () => {
  it('should generate correct all key', () => {
    expect(templateKeys.all).toEqual(['templates']);
  });

  it('should generate correct lists key', () => {
    expect(templateKeys.lists()).toEqual(['templates', 'list']);
  });

  it('should generate correct list key with params', () => {
    const params = { page: 1, pageSize: 10 };
    expect(templateKeys.list(params)).toEqual(['templates', 'list', params]);
  });

  it('should generate correct details key', () => {
    expect(templateKeys.details()).toEqual(['templates', 'detail']);
  });

  it('should generate correct detail key with id', () => {
    expect(templateKeys.detail('tmpl-1')).toEqual(['templates', 'detail', 'tmpl-1']);
  });

  it('should generate correct versions key', () => {
    expect(templateKeys.versions('tmpl-1')).toEqual(['templates', 'versions', 'tmpl-1']);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Query Hooks
// ══════════════════════════════════════════════════════════════════════════════

describe('useTemplates', () => {
  it('should fetch templates list', async () => {
    const { result } = renderHook(() => useTemplates(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.summary).toBeDefined();
  });

  it('should fetch templates with params', async () => {
    const { result } = renderHook(
      () => useTemplates({ page: 1, pageSize: 10 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toBeDefined();
    expect(result.current.data?.pagination).toBeDefined();
  });
});

describe('useTemplate', () => {
  it('should fetch single template', async () => {
    const { result } = renderHook(() => useTemplate('tmpl-1'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data.code).toBe('TMPL-001');
    expect(result.current.data?.data.name).toBe('Template A');
  });

  it('should not fetch when ID is empty', async () => {
    const { result } = renderHook(() => useTemplate(''), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

describe('useTemplateVersions', () => {
  it('should fetch template versions', async () => {
    const { result } = renderHook(() => useTemplateVersions('tmpl-1'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data.versions).toHaveLength(1);
    expect(result.current.data?.data.totalVersions).toBe(1);
  });

  it('should not fetch when ID is empty', async () => {
    const { result } = renderHook(() => useTemplateVersions(''), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Mutation Hooks
// ══════════════════════════════════════════════════════════════════════════════

describe('useCreateTemplate', () => {
  it('should create a template', async () => {
    const { result } = renderHook(() => useCreateTemplate(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ code: 'TMPL-002', name: 'New Template', type: 'DISCOUNT' } as any);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useUpdateTemplate', () => {
  it('should update a template', async () => {
    const { result } = renderHook(() => useUpdateTemplate(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ id: 'tmpl-1', name: 'Updated Template' } as any);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useDeleteTemplate', () => {
  it('should delete a template', async () => {
    const { result } = renderHook(() => useDeleteTemplate(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate('tmpl-1');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useApplyTemplate', () => {
  it('should apply a template to create a promotion', async () => {
    const { result } = renderHook(() => useApplyTemplate(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ id: 'tmpl-1', customerId: 'cust-1', startDate: '2026-01-01', endDate: '2026-03-31' } as any);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
