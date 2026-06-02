import { COMPA_RATIO_RANGES, DEFAULT_MERIT_MATRIX, INSURANCE_RATES } from './constants';

export function calculateCompaRatio(currentSalary: number, midSalary: number): number {
  if (midSalary === 0) return 0;
  return Number((currentSalary / midSalary).toFixed(2));
}

export function getCompaRatioLabel(compaRatio: number): { label: string; color: string } {
  const range = COMPA_RATIO_RANGES.find(r => compaRatio >= r.min && compaRatio < r.max);
  return range || { label: 'N/A', color: 'gray' };
}

export function getMeritIncrease(performanceRating: number, compaRatio: number, matrix?: typeof DEFAULT_MERIT_MATRIX): number {
  const data = matrix || DEFAULT_MERIT_MATRIX;
  const entry = data.find(
    m => m.performanceRating === performanceRating && compaRatio >= m.compaRatioMin && compaRatio < m.compaRatioMax
  );
  return entry?.meritIncreasePercent || 0;
}

export function calculateNewSalary(currentSalary: number, increasePercent: number): number {
  return Math.round(currentSalary * (1 + increasePercent / 100));
}

export function formatCurrency(amount: number, currency: string = 'VND'): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(amount);
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

export function calculateInsuranceContribution(
  salary: number,
  type: 'BHXH' | 'BHYT' | 'BHTN',
  role: 'employer' | 'employee'
): number {
  const rate = INSURANCE_RATES[type];
  const baseSalary = Math.min(salary, rate.ceiling);
  return Math.round(baseSalary * rate[role] / 100);
}

export function calculateTotalInsurance(salary: number, role: 'employer' | 'employee'): number {
  return (
    calculateInsuranceContribution(salary, 'BHXH', role) +
    calculateInsuranceContribution(salary, 'BHYT', role) +
    calculateInsuranceContribution(salary, 'BHTN', role)
  );
}

export function getSalaryRangePosition(salary: number, min: number, max: number): number {
  if (max === min) return 50;
  return Math.min(100, Math.max(0, ((salary - min) / (max - min)) * 100));
}
