// src/lib/compliance/tax/index.ts
// Vietnam Personal Income Tax (TNCN) Module - Main export

// Constants and types
export * from './constants'

// Calculator
export {
  TaxCalculator,
  calculateAnnualTax,
  formatTaxAmount,
  formatTaxRate,
  grossToNet,
  netToGross,
  getTaxBracketInfo,
} from './calculator'
export type { TaxCalculatorOptions, MonthlyIncomeData } from './calculator'
