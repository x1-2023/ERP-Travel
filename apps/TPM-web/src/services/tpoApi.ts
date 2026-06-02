/**
 * TPO Engine API Client
 * Connects Promo Master Frontend to TPO AI Engine
 */

import type {
  ROIPredictionRequest,
  ROIPredictionResponse,
  BudgetOptimizationRequest,
  BudgetOptimizationResponse,
  PromotionSuggestionRequest,
  PromotionSuggestionResponse,
  WhatIfRequest,
  WhatIfResponse,
  MechanicsResponse,
  ChannelsResponse,
  HealthResponse,
} from '@/types/tpo';

const TPO_API_URL = import.meta.env.VITE_TPO_API_URL || 'http://localhost:8001/api/v1';

class TPOApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = TPO_API_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `TPO API Error: ${response.status}`);
    }

    return response.json();
  }

  // Health Check
  async healthCheck(): Promise<HealthResponse> {
    return this.request('/health');
  }

  // ROI Prediction
  async predictROI(data: ROIPredictionRequest): Promise<ROIPredictionResponse> {
    return this.request('/predict/roi', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Budget Optimization
  async optimizeBudget(data: BudgetOptimizationRequest): Promise<BudgetOptimizationResponse> {
    return this.request('/optimize/budget', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Promotion Suggestions
  async suggestPromotions(data: PromotionSuggestionRequest): Promise<PromotionSuggestionResponse> {
    return this.request('/suggest/promotions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // What-If Simulation
  async simulateWhatIf(data: WhatIfRequest): Promise<WhatIfResponse> {
    return this.request('/simulate/whatif', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get Mechanic Types
  async getMechanics(): Promise<MechanicsResponse> {
    return this.request('/mechanics');
  }

  // Get Channel Types
  async getChannels(): Promise<ChannelsResponse> {
    return this.request('/channels');
  }
}

export const tpoApi = new TPOApiClient();
export default tpoApi;
