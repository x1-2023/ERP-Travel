/**
 * TPO Engine Type Definitions
 * Matches the FastAPI schemas in tpo-engine
 */

// === Enums ===

export type MechanicType = 'DISCOUNT' | 'REBATE' | 'FREE_GOODS' | 'BUNDLE' | 'BOGO';
export type ChannelType = 'GT' | 'MT' | 'HORECA' | 'ECOMMERCE' | 'WHOLESALE';
export type OptimizationGoal = 'roi' | 'volume' | 'profit';

// === ROI Prediction ===

export interface ROIPredictionRequest {
  mechanic_type: MechanicType;
  discount_percent?: number;
  rebate_amount?: number;
  free_goods_ratio?: number;
  channel: ChannelType;
  region?: string;
  product_category: string;
  product_ids?: string[];
  start_date: string; // YYYY-MM-DD
  end_date: string;
  budget_amount: number;
  baseline_sales?: number;
  previous_promo_lift?: number;
}

export interface SalesUpliftPrediction {
  baseline_daily_sales: number;
  predicted_daily_sales: number;
  uplift_percent: number;
  uplift_volume: number;
  confidence: number;
}

export interface ROIPredictionResponse {
  predicted_roi: number;
  predicted_incremental_sales: number;
  predicted_incremental_profit: number;
  sales_uplift: SalesUpliftPrediction;
  estimated_redemption_rate: number;
  estimated_cost: number;
  estimated_revenue: number;
  confidence_score: number;
  key_drivers: string[];
  risk_factors: string[];
  optimization_suggestions: string[];
}

// === Budget Optimization ===

export interface BudgetOptimizationRequest {
  total_budget: number;
  channels: ChannelType[];
  product_category: string;
  start_date: string;
  end_date: string;
  min_channel_allocation?: number;
  max_channel_allocation?: number;
  optimization_goal?: OptimizationGoal;
}

export interface ChannelAllocation {
  channel: ChannelType;
  allocated_budget: number;
  expected_roi: number;
  expected_sales_uplift: number;
  allocation_percent: number;
  priority_rank: number;
}

export interface BudgetOptimizationResponse {
  total_budget: number;
  optimized_allocations: ChannelAllocation[];
  total_expected_roi: number;
  total_expected_sales: number;
  total_expected_profit: number;
  improvement_vs_equal_split: number;
  recommendations: string[];
}

// === Promotion Suggestions ===

export interface PromotionSuggestionRequest {
  channel: ChannelType;
  product_category: string;
  budget_range_min: number;
  budget_range_max: number;
  target_roi?: number;
  target_uplift?: number;
  preferred_mechanics?: MechanicType[];
  excluded_mechanics?: MechanicType[];
  max_suggestions?: number;
}

export interface SuggestedPromotion {
  rank: number;
  mechanic_type: MechanicType;
  discount_percent: number;
  rebate_amount: number;
  free_goods_ratio: number;
  predicted_roi: number;
  predicted_sales_uplift: number;
  predicted_cost: number;
  suggested_duration_days: number;
  best_start_day: string;
  rationale: string;
  confidence: number;
}

export interface PromotionSuggestionResponse {
  suggestions: SuggestedPromotion[];
  best_suggestion_index: number;
  market_insights: string[];
  seasonal_factors: string[];
  competitive_context?: string;
}

// === What-If Simulation ===

export interface WhatIfScenario {
  scenario_id: string;
  scenario_name: string;
  mechanic_type: MechanicType;
  discount_percent?: number;
  rebate_amount?: number;
  free_goods_ratio?: number;
  channel: ChannelType;
  product_category: string;
  budget_amount: number;
  duration_days: number;
}

export interface WhatIfRequest {
  scenarios: WhatIfScenario[];
  comparison_date: string;
  include_sensitivity_analysis?: boolean;
}

export interface ScenarioComparison {
  scenario_id: string;
  scenario_name: string;
  predicted_roi: number;
  predicted_sales: number;
  predicted_profit: number;
  predicted_cost: number;
  sales_uplift_percent: number;
  volume_uplift: number;
  confidence_score: number;
  downside_risk: number;
  upside_potential: number;
  rank_by_roi: number;
  rank_by_volume: number;
  rank_by_profit: number;
  sensitivity_to_discount?: number;
  sensitivity_to_duration?: number;
  break_even_uplift?: number;
}

export interface WhatIfResponse {
  comparisons: ScenarioComparison[];
  best_roi_scenario: string;
  best_volume_scenario: string;
  best_profit_scenario: string;
  recommended_scenario: string;
  recommendation_rationale: string;
  key_insights: string[];
  trade_offs: string[];
}

// === Reference Data ===

export interface MechanicInfo {
  type: MechanicType;
  name: string;
  description: string;
  typical_uplift: string;
}

export interface ChannelInfo {
  type: ChannelType;
  name: string;
  description: string;
  roi_multiplier: number;
}

export interface MechanicsResponse {
  mechanics: MechanicInfo[];
}

export interface ChannelsResponse {
  channels: ChannelInfo[];
}

// === Health Check ===

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
}
