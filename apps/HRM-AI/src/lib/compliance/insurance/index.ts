// src/lib/compliance/insurance/index.ts
// Vietnam Social Insurance (BHXH) Module - Main export

// Constants and types
export * from './constants'

// Calculator
export { InsuranceCalculator, calculateBatchInsurance, formatInsuranceAmount } from './calculator'
export type { WageRegion, EmployeeInsuranceInput, BatchInsuranceResult } from './calculator'

// Report generators
export { generateC12Report, saveC12Report, generateC12ExcelData, formatC12ForDisplay } from './reports/c12-generator'
export type { C12ReportData, C12ReportEmployee } from './reports/c12-generator'

export { generateD02Report, saveD02Report, generateD02ExcelData, formatD02ForDisplay } from './reports/d02-generator'
export type { D02ReportData, D02Employee } from './reports/d02-generator'

export { generateD03Report, saveD03Report, generateD03ExcelData, formatD03ForDisplay } from './reports/d03-generator'
export type { D03ReportData, D03Employee } from './reports/d03-generator'
