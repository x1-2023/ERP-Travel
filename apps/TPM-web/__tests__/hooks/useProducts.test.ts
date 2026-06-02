/**
 * useProducts Hook Tests
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useProducts, useProduct, useProductOptions } from '@/hooks/useProducts';
import { createWrapper } from '../test-utils';
import { server } from '../mocks/server';
import { mockProducts } from '../mocks/handlers';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useProducts', () => {
  it('should fetch products list', async () => {
    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.products).toHaveLength(mockProducts.length);
  });

  it('should handle search filter', async () => {
    const { result } = renderHook(() => useProducts({ search: 'Product' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.products).toBeDefined();
  });

  it('should handle pagination', async () => {
    const { result } = renderHook(() => useProducts({ page: 1, pageSize: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.metadata).toBeDefined();
  });

  it('should handle category filter', async () => {
    const { result } = renderHook(() => useProducts({ categoryId: 'cat-1' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.products).toBeDefined();
  });
});

describe('useProduct', () => {
  it('should fetch single product', async () => {
    const { result } = renderHook(() => useProduct('prod-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.name).toBe('Product A');
  });

  it('should not fetch when ID is empty', async () => {
    const { result } = renderHook(() => useProduct(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

describe('useProductOptions', () => {
  it('should fetch product options for dropdown', async () => {
    const { result } = renderHook(() => useProductOptions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.[0]).toHaveProperty('value');
    expect(result.current.data?.[0]).toHaveProperty('label');
  });
});
