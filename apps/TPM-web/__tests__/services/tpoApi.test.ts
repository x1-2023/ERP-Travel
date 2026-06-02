/**
 * TPO API Client Tests
 * Tests for src/services/tpoApi.ts
 */

import { describe, it, expect, vi, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const TPO_BASE_URL = 'http://localhost:8001/api/v1';

// Mock data
const mockHealthResponse = {
  status: 'healthy',
  service: 'tpo-engine',
  version: '1.0.0',
};

const mockROIResponse = {
  predicted_roi: 25.5,
  predicted_incremental_sales: 500000,
  predicted_incremental_profit: 125000,
  sales_uplift: {
    baseline_daily_sales: 10000,
    predicted_daily_sales: 13500,
    uplift_percent: 35,
    uplift_volume: 3500,
    confidence: 0.85,
  },
  estimated_redemption_rate: 0.72,
  estimated_cost: 100000,
  estimated_revenue: 625000,
  confidence_score: 0.82,
  key_drivers: ['High discount rate', 'Peak season'],
  risk_factors: ['Market saturation'],
  optimization_suggestions: ['Reduce duration by 1 week'],
};

const mockBudgetOptimizationResponse = {
  total_budget: 1000000,
  optimized_allocations: [
    {
      channel: 'MT',
      allocated_budget: 600000,
      expected_roi: 30,
      expected_sales_uplift: 25,
      allocation_percent: 60,
      priority_rank: 1,
    },
  ],
  total_expected_roi: 28,
  total_expected_sales: 5000000,
  total_expected_profit: 1400000,
  improvement_vs_equal_split: 15,
  recommendations: ['Focus on MT channel'],
};

const mockSuggestionsResponse = {
  suggestions: [
    {
      rank: 1,
      mechanic_type: 'DISCOUNT',
      discount_percent: 15,
      rebate_amount: 0,
      free_goods_ratio: 0,
      predicted_roi: 28,
      predicted_sales_uplift: 22,
      predicted_cost: 150000,
      suggested_duration_days: 14,
      best_start_day: 'Monday',
      rationale: 'Optimal discount for MT channel',
      confidence: 0.87,
    },
  ],
  best_suggestion_index: 0,
  market_insights: ['Growing segment'],
  seasonal_factors: ['Peak season approaching'],
  competitive_context: 'Low competition',
};

const mockWhatIfResponse = {
  comparisons: [
    {
      scenario_id: 'sc-1',
      scenario_name: 'Aggressive Discount',
      predicted_roi: 20,
      predicted_sales: 1000000,
      predicted_profit: 200000,
      predicted_cost: 500000,
      sales_uplift_percent: 30,
      volume_uplift: 5000,
      confidence_score: 0.8,
      downside_risk: -5,
      upside_potential: 10,
      rank_by_roi: 1,
      rank_by_volume: 1,
      rank_by_profit: 1,
    },
  ],
  best_roi_scenario: 'sc-1',
  best_volume_scenario: 'sc-1',
  best_profit_scenario: 'sc-1',
  recommended_scenario: 'sc-1',
  recommendation_rationale: 'Best overall performance',
  key_insights: ['Discount works well here'],
  trade_offs: ['Higher cost vs higher revenue'],
};

const mockMechanicsResponse = {
  mechanics: [
    { type: 'DISCOUNT', name: 'Discount', description: 'Price discount', typical_uplift: '15-25%' },
    { type: 'REBATE', name: 'Rebate', description: 'Cash rebate', typical_uplift: '10-20%' },
  ],
};

const mockChannelsResponse = {
  channels: [
    { type: 'MT', name: 'Modern Trade', description: 'Supermarkets', roi_multiplier: 1.2 },
    { type: 'GT', name: 'General Trade', description: 'Traditional shops', roi_multiplier: 0.9 },
  ],
};

// MSW server
const server = setupServer(
  http.get(`${TPO_BASE_URL}/health`, () => {
    return HttpResponse.json(mockHealthResponse);
  }),

  http.post(`${TPO_BASE_URL}/predict/roi`, () => {
    return HttpResponse.json(mockROIResponse);
  }),

  http.post(`${TPO_BASE_URL}/optimize/budget`, () => {
    return HttpResponse.json(mockBudgetOptimizationResponse);
  }),

  http.post(`${TPO_BASE_URL}/suggest/promotions`, () => {
    return HttpResponse.json(mockSuggestionsResponse);
  }),

  http.post(`${TPO_BASE_URL}/simulate/whatif`, () => {
    return HttpResponse.json(mockWhatIfResponse);
  }),

  http.get(`${TPO_BASE_URL}/mechanics`, () => {
    return HttpResponse.json(mockMechanicsResponse);
  }),

  http.get(`${TPO_BASE_URL}/channels`, () => {
    return HttpResponse.json(mockChannelsResponse);
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Dynamically import so that the mock env is set up
let tpoApi: typeof import('@/services/tpoApi').tpoApi;

beforeEach(async () => {
  // Re-import to get fresh instance
  const module = await import('@/services/tpoApi');
  tpoApi = module.tpoApi;
});

describe('TPOApiClient', () => {
  describe('healthCheck', () => {
    it('calls /health endpoint and returns health data', async () => {
      const result = await tpoApi.healthCheck();

      expect(result).toEqual(mockHealthResponse);
      expect(result.status).toBe('healthy');
      expect(result.service).toBe('tpo-engine');
      expect(result.version).toBe('1.0.0');
    });
  });

  describe('predictROI', () => {
    it('sends POST to /predict/roi and returns prediction', async () => {
      const request = {
        mechanic_type: 'DISCOUNT' as const,
        discount_percent: 15,
        channel: 'MT' as const,
        product_category: 'Beverages',
        start_date: '2024-03-01',
        end_date: '2024-03-15',
        budget_amount: 100000,
      };

      const result = await tpoApi.predictROI(request);

      expect(result).toEqual(mockROIResponse);
      expect(result.predicted_roi).toBe(25.5);
      expect(result.confidence_score).toBe(0.82);
      expect(result.key_drivers).toHaveLength(2);
    });
  });

  describe('optimizeBudget', () => {
    it('sends POST to /optimize/budget and returns allocations', async () => {
      const request = {
        total_budget: 1000000,
        channels: ['MT' as const, 'GT' as const],
        product_category: 'Beverages',
        start_date: '2024-03-01',
        end_date: '2024-03-31',
        optimization_goal: 'roi' as const,
      };

      const result = await tpoApi.optimizeBudget(request);

      expect(result).toEqual(mockBudgetOptimizationResponse);
      expect(result.total_budget).toBe(1000000);
      expect(result.optimized_allocations).toHaveLength(1);
      expect(result.optimized_allocations[0].channel).toBe('MT');
    });
  });

  describe('suggestPromotions', () => {
    it('sends POST to /suggest/promotions and returns suggestions', async () => {
      const request = {
        channel: 'MT' as const,
        product_category: 'Beverages',
        budget_range_min: 50000,
        budget_range_max: 200000,
        target_roi: 20,
      };

      const result = await tpoApi.suggestPromotions(request);

      expect(result).toEqual(mockSuggestionsResponse);
      expect(result.suggestions).toHaveLength(1);
      expect(result.suggestions[0].rank).toBe(1);
      expect(result.best_suggestion_index).toBe(0);
    });
  });

  describe('simulateWhatIf', () => {
    it('sends POST to /simulate/whatif and returns comparisons', async () => {
      const request = {
        scenarios: [
          {
            scenario_id: 'sc-1',
            scenario_name: 'Aggressive Discount',
            mechanic_type: 'DISCOUNT' as const,
            discount_percent: 20,
            channel: 'MT' as const,
            product_category: 'Beverages',
            budget_amount: 500000,
            duration_days: 14,
          },
        ],
        comparison_date: '2024-03-01',
        include_sensitivity_analysis: true,
      };

      const result = await tpoApi.simulateWhatIf(request);

      expect(result).toEqual(mockWhatIfResponse);
      expect(result.comparisons).toHaveLength(1);
      expect(result.recommended_scenario).toBe('sc-1');
    });
  });

  describe('getMechanics', () => {
    it('calls /mechanics endpoint and returns mechanic types', async () => {
      const result = await tpoApi.getMechanics();

      expect(result).toEqual(mockMechanicsResponse);
      expect(result.mechanics).toHaveLength(2);
      expect(result.mechanics[0].type).toBe('DISCOUNT');
    });
  });

  describe('getChannels', () => {
    it('calls /channels endpoint and returns channel types', async () => {
      const result = await tpoApi.getChannels();

      expect(result).toEqual(mockChannelsResponse);
      expect(result.channels).toHaveLength(2);
      expect(result.channels[0].type).toBe('MT');
    });
  });

  describe('error handling', () => {
    it('throws an error with detail message on API failure', async () => {
      server.use(
        http.get(`${TPO_BASE_URL}/health`, () => {
          return HttpResponse.json(
            { detail: 'Service unavailable' },
            { status: 503 },
          );
        }),
      );

      await expect(tpoApi.healthCheck()).rejects.toThrow('Service unavailable');
    });

    it('throws a generic error when no detail is provided', async () => {
      server.use(
        http.get(`${TPO_BASE_URL}/health`, () => {
          return new HttpResponse(null, { status: 500 });
        }),
      );

      await expect(tpoApi.healthCheck()).rejects.toThrow('TPO API Error: 500');
    });

    it('includes Content-Type header in requests', async () => {
      let capturedHeaders: Headers | null = null;

      server.use(
        http.post(`${TPO_BASE_URL}/predict/roi`, ({ request }) => {
          capturedHeaders = new Headers(request.headers);
          return HttpResponse.json(mockROIResponse);
        }),
      );

      await tpoApi.predictROI({
        mechanic_type: 'DISCOUNT',
        channel: 'MT',
        product_category: 'Beverages',
        start_date: '2024-03-01',
        end_date: '2024-03-15',
        budget_amount: 100000,
      });

      expect(capturedHeaders!.get('Content-Type')).toBe('application/json');
    });
  });
});
