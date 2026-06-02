'use client';
import { formatCurrency } from '@/lib/compensation/utils';

interface CurrencyDisplayProps { amount: number; currency?: string; className?: string; }

export function CurrencyDisplay({ amount, currency = 'VND', className }: CurrencyDisplayProps) {
  return <span className={className}>{formatCurrency(amount, currency)}</span>;
}
