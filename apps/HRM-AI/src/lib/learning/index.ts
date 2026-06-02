// src/lib/learning/index.ts
// Learning Management Module - Main export

// Services
export * from './services'

// Re-export factory functions for convenience
export {
  createCourseService,
  createEnrollmentService,
  createLearningPathService,
  createAssessmentService,
  createCertificateService,
} from './services'
