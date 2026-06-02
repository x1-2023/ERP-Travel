// tests/lib/payroll/pit-calculator.test.ts
// Unit tests cho PIT Calculator - Thuế TNCN Việt Nam

import { describe, it, expect } from 'vitest'
import {
  calculatePIT,
  calculatePITAmount,
  calculateMonthlyPITFromAnnual,
  estimateAnnualPIT,
  getTaxBracket,
  getMarginalTaxRate,
  calculateGrossFromNet,
  validateDependentCount,
  formatPITResult,
} from '@/lib/payroll/pit-calculator'
import { PIT_DEDUCTIONS, PIT_BRACKETS } from '@/lib/payroll/constants'

describe('PIT Calculator - Thuế TNCN Việt Nam', () => {
  // ══════════════════════════════════════════════════════════════════════
  // BASIC CALCULATIONS
  // ══════════════════════════════════════════════════════════════════════

  describe('calculatePIT', () => {
    it('should return 0 PIT when income is below personal deduction', () => {
      const result = calculatePIT({
        taxableIncome: 10_000_000,
        dependentCount: 0,
      })
      
      expect(result.pitAmount).toBe(0)
      expect(result.assessableIncome).toBe(0)
      expect(result.effectiveRate).toBe(0)
    })

    it('should calculate correctly for income just above personal deduction', () => {
      // 15M income - 11M deduction = 4M assessable (bracket 1: 5%)
      const result = calculatePIT({
        taxableIncome: 15_000_000,
        dependentCount: 0,
      })
      
      expect(result.assessableIncome).toBe(4_000_000)
      expect(result.pitAmount).toBe(200_000) // 4M x 5% = 200k
    })

    it('should calculate correctly for income spanning multiple brackets', () => {
      // 30M income - 11M deduction = 19M assessable
      // Bracket 1: 5M x 5% = 250k
      // Bracket 2: 5M x 10% = 500k
      // Bracket 3: 8M x 15% = 1.2M
      // Bracket 4: 1M x 20% = 200k
      // Total: 250k + 500k + 1.2M + 200k = 2.15M
      const result = calculatePIT({
        taxableIncome: 30_000_000,
        dependentCount: 0,
      })
      
      expect(result.assessableIncome).toBe(19_000_000)
      expect(result.pitAmount).toBe(2_150_000)
    })

    it('should apply dependent deduction correctly', () => {
      // 30M - 11M personal - 4.4M dependent = 14.6M assessable
      const result = calculatePIT({
        taxableIncome: 30_000_000,
        dependentCount: 1,
      })
      
      expect(result.dependentDeduction).toBe(4_400_000)
      expect(result.totalDeductions).toBe(15_400_000)
      expect(result.assessableIncome).toBe(14_600_000)
    })

    it('should handle multiple dependents', () => {
      const result = calculatePIT({
        taxableIncome: 50_000_000,
        dependentCount: 3,
      })
      
      expect(result.dependentCount).toBe(3)
      expect(result.dependentDeduction).toBe(13_200_000) // 4.4M x 3
      expect(result.totalDeductions).toBe(24_200_000) // 11M + 13.2M
    })

    it('should handle very high income (bracket 7)', () => {
      // 200M - 11M = 189M assessable
      // Should hit all brackets including 35%
      const result = calculatePIT({
        taxableIncome: 200_000_000,
        dependentCount: 0,
      })
      
      expect(result.assessableIncome).toBe(189_000_000)
      expect(result.bracketDetails.length).toBe(7)
      expect(result.bracketDetails[6].rate).toBe(0.35)
      expect(result.pitAmount).toBeGreaterThan(50_000_000)
    })

    it('should never return negative PIT', () => {
      const result = calculatePIT({
        taxableIncome: 0,
        dependentCount: 5,
      })
      
      expect(result.pitAmount).toBe(0)
      expect(result.assessableIncome).toBe(0)
    })

    it('should include bracket details in result', () => {
      const result = calculatePIT({
        taxableIncome: 20_000_000,
        dependentCount: 0,
      })
      
      expect(result.bracketDetails).toBeDefined()
      expect(Array.isArray(result.bracketDetails)).toBe(true)
      expect(result.bracketDetails[0].bracket).toBe(1)
      expect(result.bracketDetails[0].rate).toBe(0.05)
    })

    it('should calculate effective tax rate correctly', () => {
      const result = calculatePIT({
        taxableIncome: 50_000_000,
        dependentCount: 0,
      })
      
      const expectedRate = (result.pitAmount / 50_000_000) * 100
      expect(result.effectiveRate).toBeCloseTo(expectedRate, 1)
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // HELPER FUNCTIONS
  // ══════════════════════════════════════════════════════════════════════

  describe('calculatePITAmount', () => {
    it('should return only the PIT amount', () => {
      const amount = calculatePITAmount(30_000_000, 1)
      expect(typeof amount).toBe('number')
      expect(amount).toBeGreaterThanOrEqual(0)
    })

    it('should default to 0 dependents', () => {
      const amount = calculatePITAmount(30_000_000)
      const result = calculatePIT({ taxableIncome: 30_000_000, dependentCount: 0 })
      expect(amount).toBe(result.pitAmount)
    })
  })

  describe('calculateMonthlyPITFromAnnual', () => {
    it('should divide annual income by 12', () => {
      const result = calculateMonthlyPITFromAnnual(360_000_000, 0)
      const monthlyResult = calculatePIT({ taxableIncome: 30_000_000, dependentCount: 0 })
      
      expect(result.taxableIncome).toBe(30_000_000)
      expect(result.pitAmount).toBe(monthlyResult.pitAmount)
    })
  })

  describe('estimateAnnualPIT', () => {
    it('should multiply monthly PIT by 12', () => {
      const annual = estimateAnnualPIT(30_000_000, 0)
      const monthly = calculatePITAmount(30_000_000, 0)
      
      expect(annual).toBe(monthly * 12)
    })
  })

  describe('getTaxBracket', () => {
    it('should return null for zero income', () => {
      expect(getTaxBracket(0)).toBeNull()
    })

    it('should return null for negative income', () => {
      expect(getTaxBracket(-1_000_000)).toBeNull()
    })

    it('should return correct bracket for each income level', () => {
      expect(getTaxBracket(3_000_000)?.rate).toBe(0.05)  // Bracket 1
      expect(getTaxBracket(7_000_000)?.rate).toBe(0.10)  // Bracket 2
      expect(getTaxBracket(15_000_000)?.rate).toBe(0.15) // Bracket 3
      expect(getTaxBracket(25_000_000)?.rate).toBe(0.20) // Bracket 4
      expect(getTaxBracket(45_000_000)?.rate).toBe(0.25) // Bracket 5
      expect(getTaxBracket(65_000_000)?.rate).toBe(0.30) // Bracket 6
      expect(getTaxBracket(100_000_000)?.rate).toBe(0.35) // Bracket 7
    })

    it('should return highest bracket for very high income', () => {
      expect(getTaxBracket(1_000_000_000)?.rate).toBe(0.35)
    })
  })

  describe('getMarginalTaxRate', () => {
    it('should return 0 for income below deduction threshold', () => {
      expect(getMarginalTaxRate(10_000_000, 0)).toBe(0)
    })

    it('should return correct marginal rate', () => {
      // 50M - 11M = 39M assessable -> bracket 5 (25%)
      expect(getMarginalTaxRate(50_000_000, 0)).toBe(25)
    })

    it('should consider dependents in calculation', () => {
      // 50M - 11M - 4.4M = 34.6M -> bracket 5 (25%)
      expect(getMarginalTaxRate(50_000_000, 1)).toBe(25)
      
      // 50M - 11M - 8.8M = 30.2M -> bracket 4 (20%)
      expect(getMarginalTaxRate(50_000_000, 2)).toBe(20)
    })
  })

  describe('calculateGrossFromNet', () => {
    it('should calculate gross salary from net target', () => {
      const targetNet = 30_000_000
      const gross = calculateGrossFromNet(targetNet, 0)
      
      // Verify by calculating net from gross
      const insurance = gross * 0.105
      const taxableIncome = gross - insurance
      const pit = calculatePITAmount(taxableIncome, 0)
      const calculatedNet = gross - insurance - pit
      
      // Should be within 1000 VND tolerance
      expect(Math.abs(calculatedNet - targetNet)).toBeLessThanOrEqual(1000)
    })

    it('should consider dependents', () => {
      const withDependents = calculateGrossFromNet(30_000_000, 2)
      const withoutDependents = calculateGrossFromNet(30_000_000, 0)
      
      // Gross with dependents should be lower (less tax needed)
      expect(withDependents).toBeLessThan(withoutDependents)
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // VALIDATION & FORMATTING
  // ══════════════════════════════════════════════════════════════════════

  describe('validateDependentCount', () => {
    it('should accept valid counts', () => {
      expect(validateDependentCount(0)).toBe(true)
      expect(validateDependentCount(1)).toBe(true)
      expect(validateDependentCount(5)).toBe(true)
    })

    it('should reject negative counts', () => {
      expect(validateDependentCount(-1)).toBe(false)
    })

    it('should reject non-integer counts', () => {
      expect(validateDependentCount(1.5)).toBe(false)
    })
  })

  describe('formatPITResult', () => {
    it('should return formatted string', () => {
      const result = calculatePIT({
        taxableIncome: 30_000_000,
        dependentCount: 1,
      })
      
      const formatted = formatPITResult(result)
      
      expect(typeof formatted).toBe('string')
      expect(formatted).toContain('Thu nhập chịu thuế')
      expect(formatted).toContain('Giảm trừ bản thân')
      expect(formatted).toContain('Thuế TNCN')
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // EDGE CASES & REGRESSION
  // ══════════════════════════════════════════════════════════════════════

  describe('Edge Cases', () => {
    it('should handle exact bracket boundaries', () => {
      // Exactly at bracket 1 boundary (5M assessable)
      const result = calculatePIT({
        taxableIncome: 16_000_000, // 16M - 11M = 5M
        dependentCount: 0,
      })
      
      expect(result.assessableIncome).toBe(5_000_000)
      expect(result.pitAmount).toBe(250_000) // 5M x 5%
    })

    it('should handle very small assessable income', () => {
      const result = calculatePIT({
        taxableIncome: 11_100_000, // Just 100k above deduction
        dependentCount: 0,
      })
      
      expect(result.assessableIncome).toBe(100_000)
      expect(result.pitAmount).toBe(5_000) // 100k x 5%
    })

    it('should handle custom deductions', () => {
      const result = calculatePIT({
        taxableIncome: 30_000_000,
        dependentCount: 0,
        personalDeduction: 12_000_000, // Custom higher deduction
      })
      
      expect(result.personalDeduction).toBe(12_000_000)
      expect(result.assessableIncome).toBe(18_000_000)
    })

    it('should handle custom brackets', () => {
      const customBrackets = [
        { from: 0, to: 10_000_000, rate: 0.10 },
        { from: 10_000_000, to: Infinity, rate: 0.20 },
      ]
      
      const result = calculatePIT({
        taxableIncome: 30_000_000,
        dependentCount: 0,
        customBrackets,
      })
      
      // 19M assessable: 10M x 10% + 9M x 20% = 1M + 1.8M = 2.8M
      expect(result.pitAmount).toBe(2_800_000)
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // CONSTANTS VALIDATION
  // ══════════════════════════════════════════════════════════════════════

  describe('Constants', () => {
    it('should have correct PIT deductions', () => {
      expect(PIT_DEDUCTIONS.PERSONAL).toBe(11_000_000)
      expect(PIT_DEDUCTIONS.DEPENDENT).toBe(4_400_000)
    })

    it('should have 7 PIT brackets', () => {
      expect(PIT_BRACKETS.length).toBe(7)
    })

    it('should have progressive rates from 5% to 35%', () => {
      expect(PIT_BRACKETS[0].rate).toBe(0.05)
      expect(PIT_BRACKETS[6].rate).toBe(0.35)
    })

    it('should have contiguous brackets', () => {
      for (let i = 1; i < PIT_BRACKETS.length; i++) {
        expect(PIT_BRACKETS[i].from).toBe(PIT_BRACKETS[i - 1].to)
      }
    })
  })
})
