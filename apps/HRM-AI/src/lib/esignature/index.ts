// src/lib/esignature/index.ts
// E-Signature Module - Main export

// Types
export * from './types'

// Providers
export { VNPTCAProvider, createVNPTCAProvider } from './providers/vnpt-ca'
export {
  VNPTCAProductionProvider,
  vnptCAProductionProvider,
  createVNPTCAProductionProvider,
} from './providers/vnpt-ca-production'

// Signature Services
export { SignatureService, createSignatureService } from './signature-service'
export { ESignatureProductionService, createESignatureProductionService } from './signature-service-production'
