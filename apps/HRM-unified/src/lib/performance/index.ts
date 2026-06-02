// src/lib/performance/index.ts
// Performance Management Module - Main export

// Services
export * from './services'

// Re-export factory functions for convenience
export {
  createGoalService,
  createReviewCycleService,
  createPerformanceReviewService,
  createFeedbackService,
  createCompetencyService,
} from './services'
