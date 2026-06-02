/**
 * Domain Hooks Tests
 * Tests for useBaselines, useGeographicUnits, useNavigation, useTPO,
 * useClaimsAI, useSidebarCollapse, useCurrency
 */

import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { createWrapper } from '../test-utils';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Baselines
import {
  baselineKeys,
  useBaselines,
  useBaseline,
  useCreateBaseline,
  useUpdateBaseline,
  useDeleteBaseline,
} from '@/hooks/useBaselines';

// Geographic Units
import {
  geographicUnitKeys,
  useGeographicUnits,
  useGeographicUnitsTree,
  useGeographicUnit,
  useCreateGeographicUnit,
  useUpdateGeographicUnit,
  useDeleteGeographicUnit,
  flattenGeographicTree,
} from '@/hooks/useGeographicUnits';

// Navigation
import { useNavigation } from '@/hooks/useNavigation';

// TPO hooks
import {
  useTPOHealth,
  useTPOMechanics,
  useTPOChannels,
  useROIPrediction,
  useBudgetOptimization,
  usePromotionSuggestions,
  useWhatIfSimulation,
  useTPO,
} from '@/hooks/useTPO';

// Claims AI
import {
  claimsAIKeys,
  useClaimsAIStats,
  usePendingClaims,
  useClaimMatch,
  useProcessClaim,
  useBatchProcessClaims,
} from '@/hooks/useClaimsAI';

// Sidebar Collapse
import { useSidebarCollapse } from '@/hooks/useSidebarCollapse';

// Currency
import {
  CurrencyProvider,
  useCurrency,
  formatCompactCurrency,
} from '@/hooks/useCurrency';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'bypass' });
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ══════════════════════════════════════════════════════════════════════════════
// Baselines Hooks
// ══════════════════════════════════════════════════════════════════════════════

describe('baselineKeys', () => {
  it('should generate correct all key', () => {
    expect(baselineKeys.all).toEqual(['baselines']);
  });

  it('should generate correct lists key', () => {
    expect(baselineKeys.lists()).toEqual(['baselines', 'list']);
  });

  it('should generate correct list key with filters', () => {
    const filters = { year: 2026, period: 'Q1' };
    expect(baselineKeys.list(filters)).toEqual(['baselines', 'list', filters]);
  });

  it('should generate correct detail key', () => {
    expect(baselineKeys.detail('bl-1')).toEqual(['baselines', 'detail', 'bl-1']);
  });
});

describe('useBaselines', () => {
  it('should fetch baselines list', async () => {
    const { result } = renderHook(() => useBaselines(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.baselines).toHaveLength(1);
    expect(result.current.data?.metadata).toBeDefined();
  });

  it('should fetch baselines with filters', async () => {
    const { result } = renderHook(
      () => useBaselines({ year: 2026, period: 'Q1' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.baselines).toBeDefined();
  });
});

describe('useBaseline', () => {
  it('should fetch single baseline', async () => {
    const { result } = renderHook(() => useBaseline('bl-1'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });

  it('should not fetch when ID is empty', async () => {
    const { result } = renderHook(() => useBaseline(''), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

describe('useCreateBaseline', () => {
  it('should create a baseline', async () => {
    const { result } = renderHook(() => useCreateBaseline(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ year: 2026, period: 'Q2', baselineType: 'VOLUME' } as any);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useUpdateBaseline', () => {
  it('should update a baseline', async () => {
    const { result } = renderHook(() => useUpdateBaseline(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ id: 'bl-1', data: { value: 12000 } as any });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useDeleteBaseline', () => {
  it('should delete a baseline', async () => {
    const { result } = renderHook(() => useDeleteBaseline(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate('bl-1');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Geographic Units Hooks
// ══════════════════════════════════════════════════════════════════════════════

describe('geographicUnitKeys', () => {
  it('should generate correct all key', () => {
    expect(geographicUnitKeys.all).toEqual(['geographic-units']);
  });

  it('should generate correct lists key', () => {
    expect(geographicUnitKeys.lists()).toEqual(['geographic-units', 'list']);
  });

  it('should generate correct list key with filters', () => {
    const filters = { level: 'COUNTRY' };
    expect(geographicUnitKeys.list(filters)).toEqual(['geographic-units', 'list', filters]);
  });

  it('should generate correct tree key', () => {
    expect(geographicUnitKeys.tree()).toEqual(['geographic-units', 'tree']);
  });

  it('should generate correct details key', () => {
    expect(geographicUnitKeys.details()).toEqual(['geographic-units', 'detail']);
  });

  it('should generate correct detail key', () => {
    expect(geographicUnitKeys.detail('geo-1')).toEqual(['geographic-units', 'detail', 'geo-1']);
  });
});

describe('useGeographicUnits', () => {
  it('should fetch geographic units list', async () => {
    const { result } = renderHook(() => useGeographicUnits(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].code).toBe('VN');
  });

  it('should fetch geographic units with filters', async () => {
    const { result } = renderHook(
      () => useGeographicUnits({ level: 'COUNTRY', search: 'Vietnam' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });
});

describe('useGeographicUnitsTree', () => {
  it('should fetch geographic units tree', async () => {
    const { result } = renderHook(() => useGeographicUnitsTree(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });
});

describe('useGeographicUnit', () => {
  it('should fetch single geographic unit', async () => {
    const { result } = renderHook(() => useGeographicUnit('geo-1'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.code).toBe('VN');
    expect(result.current.data?.name).toBe('Vietnam');
  });

  it('should not fetch when ID is empty', async () => {
    const { result } = renderHook(() => useGeographicUnit(''), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

describe('useCreateGeographicUnit', () => {
  it('should create a geographic unit', async () => {
    const { result } = renderHook(() => useCreateGeographicUnit(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ code: 'HN', name: 'Hanoi', level: 'PROVINCE' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useUpdateGeographicUnit', () => {
  it('should update a geographic unit', async () => {
    const { result } = renderHook(() => useUpdateGeographicUnit(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ id: 'geo-1', data: { name: 'Vietnam Updated' } });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useDeleteGeographicUnit', () => {
  it('should delete a geographic unit', async () => {
    const { result } = renderHook(() => useDeleteGeographicUnit(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate('geo-1');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('flattenGeographicTree', () => {
  it('should flatten a tree with no children', () => {
    const units = [
      { id: 'geo-1', code: 'VN', name: 'Vietnam', level: 'COUNTRY' as const, isActive: true, sortOrder: 1, createdAt: '', updatedAt: '' },
    ];

    const result = flattenGeographicTree(units);

    expect(result).toHaveLength(1);
    expect(result[0].depth).toBe(0);
  });

  it('should flatten a tree with children', () => {
    const units = [
      {
        id: 'geo-1', code: 'VN', name: 'Vietnam', level: 'COUNTRY' as const, isActive: true, sortOrder: 1, createdAt: '', updatedAt: '',
        children: [
          { id: 'geo-2', code: 'HN', name: 'Hanoi', level: 'REGION' as const, isActive: true, sortOrder: 1, createdAt: '', updatedAt: '' },
          { id: 'geo-3', code: 'HCM', name: 'Ho Chi Minh', level: 'REGION' as const, isActive: true, sortOrder: 2, createdAt: '', updatedAt: '' },
        ],
      },
    ];

    const result = flattenGeographicTree(units);

    expect(result).toHaveLength(3);
    expect(result[0].depth).toBe(0);
    expect(result[1].depth).toBe(1);
    expect(result[2].depth).toBe(1);
  });

  it('should handle empty array', () => {
    const result = flattenGeographicTree([]);
    expect(result).toHaveLength(0);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Navigation Hook
// ══════════════════════════════════════════════════════════════════════════════

describe('useNavigation', () => {
  it('should return navigation utilities', () => {
    const { result } = renderHook(() => useNavigation(), { wrapper: createWrapper() });

    expect(result.current.currentPath).toBeDefined();
    expect(typeof result.current.isActive).toBe('function');
    expect(typeof result.current.isChildActive).toBe('function');
    expect(typeof result.current.getActiveSection).toBe('function');
    expect(typeof result.current.getActiveItem).toBe('function');
    expect(typeof result.current.navigateTo).toBe('function');
    expect(result.current.breadcrumbs).toBeDefined();
    expect(Array.isArray(result.current.breadcrumbs)).toBe(true);
  });

  it('should check if path is active', () => {
    const { result } = renderHook(() => useNavigation(), { wrapper: createWrapper() });

    // Default path in BrowserRouter test is '/'
    expect(result.current.isActive('/')).toBe(true);
    expect(result.current.isActive('/nonexistent')).toBe(false);
  });

  it('should provide getActiveSection', () => {
    const { result } = renderHook(() => useNavigation(), { wrapper: createWrapper() });

    // Will return null or a section ID depending on the current path
    const section = result.current.getActiveSection();
    expect(section === null || typeof section === 'string').toBe(true);
  });

  it('should provide getActiveItem', () => {
    const { result } = renderHook(() => useNavigation(), { wrapper: createWrapper() });

    const item = result.current.getActiveItem();
    expect(item === null || typeof item === 'object').toBe(true);
  });

  it('should provide navigateTo function', () => {
    const { result } = renderHook(() => useNavigation(), { wrapper: createWrapper() });

    // Should not throw
    act(() => {
      result.current.navigateTo('/dashboard');
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// TPO Hooks
// ══════════════════════════════════════════════════════════════════════════════

describe('useTPOHealth', () => {
  it('should fetch TPO health status', async () => {
    server.use(
      http.get('*/api/v1/health', () => {
        return HttpResponse.json({ status: 'healthy', version: '1.0.0' });
      })
    );

    const { result } = renderHook(() => useTPOHealth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.status).toBe('healthy');
  });
});

describe('useTPOMechanics', () => {
  it('should fetch mechanics list', async () => {
    server.use(
      http.get('*/api/v1/mechanics', () => {
        return HttpResponse.json({ mechanics: [{ id: 'mech-1', name: 'Discount', code: 'DISCOUNT' }] });
      })
    );

    const { result } = renderHook(() => useTPOMechanics(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(1);
  });
});

describe('useTPOChannels', () => {
  it('should fetch channels list', async () => {
    server.use(
      http.get('*/api/v1/channels', () => {
        return HttpResponse.json({ channels: [{ id: 'ch-1', name: 'Modern Trade', code: 'MT' }] });
      })
    );

    const { result } = renderHook(() => useTPOChannels(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(1);
  });
});

describe('useROIPrediction', () => {
  it('should provide predict function and state', async () => {
    server.use(
      http.post('*/api/v1/predict/roi', () => {
        return HttpResponse.json({ roi: 25.5, confidence: 0.85 });
      })
    );

    const { result } = renderHook(() => useROIPrediction(), { wrapper: createWrapper() });

    expect(result.current.result).toBeNull();
    expect(typeof result.current.predict).toBe('function');
    expect(result.current.isLoading).toBe(false);

    await act(async () => {
      result.current.predict({
        mechanic: 'DISCOUNT',
        channel: 'MT',
        budget: 100000000,
        duration: 30,
      } as any);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.result).toBeDefined();
    });
  });

  it('should reset state', async () => {
    const { result } = renderHook(() => useROIPrediction(), { wrapper: createWrapper() });

    act(() => {
      result.current.reset();
    });

    expect(result.current.result).toBeNull();
  });
});

describe('useBudgetOptimization', () => {
  it('should provide optimize function', async () => {
    server.use(
      http.post('*/api/v1/optimize/budget', () => {
        return HttpResponse.json({ optimizedBudget: 95000000, savings: 5000000 });
      })
    );

    const { result } = renderHook(() => useBudgetOptimization(), { wrapper: createWrapper() });

    expect(result.current.result).toBeNull();
    expect(typeof result.current.optimize).toBe('function');

    await act(async () => {
      result.current.optimize({
        totalBudget: 100000000,
        constraints: {},
      } as any);
    });

    await waitFor(() => {
      expect(result.current.result).toBeDefined();
    });
  });

  it('should reset state', () => {
    const { result } = renderHook(() => useBudgetOptimization(), { wrapper: createWrapper() });

    act(() => {
      result.current.reset();
    });

    expect(result.current.result).toBeNull();
  });
});

describe('usePromotionSuggestions', () => {
  it('should provide getSuggestions function', async () => {
    server.use(
      http.post('*/api/v1/suggest/promotions', () => {
        return HttpResponse.json({ suggestions: [{ id: 'sug-1', type: 'DISCOUNT', confidence: 0.9 }] });
      })
    );

    const { result } = renderHook(() => usePromotionSuggestions(), { wrapper: createWrapper() });

    expect(result.current.suggestions).toBeNull();
    expect(typeof result.current.getSuggestions).toBe('function');

    await act(async () => {
      result.current.getSuggestions({
        channel: 'MT',
        budget: 100000000,
      } as any);
    });

    await waitFor(() => {
      expect(result.current.suggestions).toBeDefined();
    });
  });

  it('should reset state', () => {
    const { result } = renderHook(() => usePromotionSuggestions(), { wrapper: createWrapper() });

    act(() => {
      result.current.reset();
    });

    expect(result.current.suggestions).toBeNull();
  });
});

describe('useWhatIfSimulation', () => {
  it('should provide simulate function', async () => {
    server.use(
      http.post('*/api/v1/simulate/whatif', () => {
        return HttpResponse.json({ scenarios: [{ name: 'Base', roi: 20 }] });
      })
    );

    const { result } = renderHook(() => useWhatIfSimulation(), { wrapper: createWrapper() });

    expect(result.current.result).toBeNull();
    expect(typeof result.current.simulate).toBe('function');

    await act(async () => {
      result.current.simulate({
        baseScenario: { budget: 100000000 },
      } as any);
    });

    await waitFor(() => {
      expect(result.current.result).toBeDefined();
    });
  });

  it('should reset state', () => {
    const { result } = renderHook(() => useWhatIfSimulation(), { wrapper: createWrapper() });

    act(() => {
      result.current.reset();
    });

    expect(result.current.result).toBeNull();
  });
});

describe('useTPO', () => {
  it('should combine all TPO hooks', async () => {
    server.use(
      http.get('*/api/v1/health', () => {
        return HttpResponse.json({ status: 'healthy', version: '1.0.0' });
      }),
      http.get('*/api/v1/mechanics', () => {
        return HttpResponse.json({ mechanics: [{ id: 'mech-1', name: 'Discount' }] });
      }),
      http.get('*/api/v1/channels', () => {
        return HttpResponse.json({ channels: [{ id: 'ch-1', name: 'Modern Trade' }] });
      })
    );

    const { result } = renderHook(() => useTPO(), { wrapper: createWrapper() });

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.mechanics).toBeDefined();
    expect(result.current.channels).toBeDefined();
    expect(typeof result.current.roi.predict).toBe('function');
    expect(typeof result.current.budget.optimize).toBe('function');
    expect(typeof result.current.suggestions.getSuggestions).toBe('function');
    expect(typeof result.current.whatIf.simulate).toBe('function');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Claims AI Hooks
// ══════════════════════════════════════════════════════════════════════════════

describe('claimsAIKeys', () => {
  it('should generate correct all key', () => {
    expect(claimsAIKeys.all).toEqual(['claims-ai']);
  });

  it('should generate correct stats key', () => {
    expect(claimsAIKeys.stats()).toEqual(['claims-ai', 'stats']);
  });

  it('should generate correct pending key', () => {
    const filters = { page: 1, limit: 10 };
    expect(claimsAIKeys.pending(filters)).toEqual(['claims-ai', 'pending', filters]);
  });

  it('should generate correct match key', () => {
    expect(claimsAIKeys.match('claim-1')).toEqual(['claims-ai', 'match', 'claim-1']);
  });
});

describe('useClaimsAIStats', () => {
  it('should fetch claims AI stats', async () => {
    const { result } = renderHook(() => useClaimsAIStats(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });
});

describe('usePendingClaims', () => {
  it('should fetch pending claims', async () => {
    const { result } = renderHook(() => usePendingClaims(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.claims).toBeDefined();
    expect(result.current.data?.pagination).toBeDefined();
  });

  it('should fetch pending claims with pagination', async () => {
    const { result } = renderHook(
      () => usePendingClaims({ page: 1, limit: 10 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.claims).toBeDefined();
  });
});

describe('useClaimMatch', () => {
  it('should fetch claim match', async () => {
    const { result } = renderHook(() => useClaimMatch('claim-1'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });

  it('should not fetch when claimId is empty', async () => {
    const { result } = renderHook(() => useClaimMatch(''), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

describe('useProcessClaim', () => {
  it('should process a claim', async () => {
    const { result } = renderHook(() => useProcessClaim(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate('claim-1');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useBatchProcessClaims', () => {
  it('should batch process claims', async () => {
    const { result } = renderHook(() => useBatchProcessClaims(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate(['claim-1', 'claim-2', 'claim-3']);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Sidebar Collapse Hook
// ══════════════════════════════════════════════════════════════════════════════

describe('useSidebarCollapse', () => {
  it('should return sidebar collapse state and functions', () => {
    const { result } = renderHook(() => useSidebarCollapse());

    expect(result.current.expandedSections).toBeDefined();
    expect(Array.isArray(result.current.expandedSections)).toBe(true);
    expect(typeof result.current.toggleSection).toBe('function');
    expect(typeof result.current.isSectionExpanded).toBe('function');
    expect(typeof result.current.expandAll).toBe('function');
    expect(typeof result.current.collapseAll).toBe('function');
    expect(typeof result.current.resetToDefaults).toBe('function');
  });

  it('should toggle a section', () => {
    const { result } = renderHook(() => useSidebarCollapse());

    const initialLength = result.current.expandedSections.length;
    const wasExpanded = result.current.isSectionExpanded('overview');

    act(() => {
      result.current.toggleSection('overview');
    });

    if (wasExpanded) {
      expect(result.current.isSectionExpanded('overview')).toBe(false);
    } else {
      expect(result.current.isSectionExpanded('overview')).toBe(true);
    }
  });

  it('should collapse all sections', () => {
    const { result } = renderHook(() => useSidebarCollapse());

    act(() => {
      result.current.collapseAll();
    });

    expect(result.current.expandedSections).toHaveLength(0);
  });

  it('should expand all sections', () => {
    const { result } = renderHook(() => useSidebarCollapse());

    act(() => {
      result.current.expandAll();
    });

    expect(result.current.expandedSections.length).toBeGreaterThan(0);
  });

  it('should reset to defaults', () => {
    const { result } = renderHook(() => useSidebarCollapse());

    act(() => {
      result.current.collapseAll();
    });

    act(() => {
      result.current.resetToDefaults();
    });

    // Should have some expanded sections (those with defaultExpanded: true)
    expect(result.current.expandedSections.length).toBeGreaterThan(0);
  });

  it('should persist to localStorage', () => {
    const { result } = renderHook(() => useSidebarCollapse());

    act(() => {
      result.current.collapseAll();
    });

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'sidebar-expanded-sections',
      JSON.stringify([])
    );
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Currency Hook
// ══════════════════════════════════════════════════════════════════════════════

describe('formatCompactCurrency', () => {
  it('should format VND in billions (ty)', () => {
    const result = formatCompactCurrency(5000000000, 'VND');
    expect(result).toContain('5.0');
    expect(result).toContain('t');
  });

  it('should format VND in millions (trieu)', () => {
    const result = formatCompactCurrency(5000000, 'VND');
    expect(result).toContain('5.0');
    expect(result).toContain('tri');
  });

  it('should format VND in thousands', () => {
    const result = formatCompactCurrency(5000, 'VND');
    expect(result).toContain('5');
    expect(result).toContain('K');
  });

  it('should format USD in millions', () => {
    const result = formatCompactCurrency(5000000, 'USD', 1);
    expect(result).toContain('$');
    expect(result).toContain('M');
  });

  it('should format USD in thousands', () => {
    const result = formatCompactCurrency(5000, 'USD', 1);
    expect(result).toContain('$');
    expect(result).toContain('K');
  });

  it('should format small USD amounts', () => {
    const result = formatCompactCurrency(500, 'USD', 1);
    expect(result).toContain('$');
  });

  it('should format VND in trillions (nghin ty)', () => {
    const result = formatCompactCurrency(5000000000000, 'VND');
    expect(result).toContain('5.0');
    expect(result).toContain('ngh');
  });

  it('should format USD in billions', () => {
    const result = formatCompactCurrency(5000000000, 'USD', 1);
    expect(result).toContain('$');
    expect(result).toContain('B');
  });
});

describe('useCurrency', () => {
  it('should throw when used outside CurrencyProvider', () => {
    expect(() => {
      renderHook(() => useCurrency());
    }).toThrow('useCurrency must be used within a CurrencyProvider');
  });

  it('should provide currency context within CurrencyProvider', async () => {
    // Mock fetch for exchange rate API
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ rates: { VND: 25000 } }),
    });

    function createCurrencyWrapper() {
      const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
      return ({ children }: { children: React.ReactNode }) =>
        React.createElement(QueryClientProvider, { client: qc },
          React.createElement(CurrencyProvider, null, children)
        );
    }

    const { result } = renderHook(() => useCurrency(), { wrapper: createCurrencyWrapper() });

    // Wait for initial exchange rate fetch to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.currency).toBe('VND');
    expect(typeof result.current.setCurrency).toBe('function');
    expect(typeof result.current.toggleCurrency).toBe('function');
    expect(typeof result.current.convert).toBe('function');
    expect(typeof result.current.formatCompact).toBe('function');
    expect(typeof result.current.formatWithUnit).toBe('function');

    // Test toggle
    act(() => {
      result.current.toggleCurrency();
    });

    expect(result.current.currency).toBe('USD');

    act(() => {
      result.current.toggleCurrency();
    });

    expect(result.current.currency).toBe('VND');

    // Test convert
    const converted = result.current.convert(25000, 'VND');
    expect(converted).toBe(25000);

    // Test setCurrency
    act(() => {
      result.current.setCurrency('USD');
    });

    expect(result.current.currency).toBe('USD');

    global.fetch = originalFetch;
  });
});
