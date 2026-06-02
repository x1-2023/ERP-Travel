/**
 * CurrencyDisplay Component
 * Displays currency with compact format and clickable VND/USD toggle
 */

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Types
export type CurrencyCode = 'VND' | 'USD';

interface CurrencyDisplayProps {
  /** Amount in VND (base currency) */
  amount: number;
  /** Additional CSS classes */
  className?: string;
  /** CSS classes for the value part */
  valueClassName?: string;
  /** CSS classes for the currency badge */
  badgeClassName?: string;
  /** Show currency toggle badge */
  showToggle?: boolean;
  /** Default currency to display */
  defaultCurrency?: CurrencyCode;
  /** Exchange rate (VND per 1 USD), if not provided will use default */
  exchangeRate?: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

// Default exchange rate
const DEFAULT_EXCHANGE_RATE = 25000;

// Smart number formatting - removes trailing .0
function formatNum(num: number, decimals: number = 1): string {
  const fixed = num.toFixed(decimals);
  // Remove trailing .0 or .00
  return fixed.replace(/\.0+$/, '');
}

// Format number with compact units
function formatCompact(
  amount: number,
  currency: CurrencyCode,
  exchangeRate: number
): { display: string; fullValue: string } {
  // Guard against undefined/null/NaN
  if (amount == null || isNaN(amount)) {
    return { display: '-', fullValue: '-' };
  }

  const convertedAmount = currency === 'VND' ? amount : amount / exchangeRate;

  // Full value for tooltip
  const fullValue = currency === 'VND'
    ? `${convertedAmount.toLocaleString('vi-VN')} ₫`
    : `$${convertedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (currency === 'VND') {
    // Vietnamese: số + đơn vị (50 tỷ, 1.5 triệu)
    if (Math.abs(convertedAmount) >= 1e12) {
      return { display: `${formatNum(convertedAmount / 1e12)} nghìn tỷ`, fullValue };
    }
    if (Math.abs(convertedAmount) >= 1e9) {
      return { display: `${formatNum(convertedAmount / 1e9)} tỷ`, fullValue };
    }
    if (Math.abs(convertedAmount) >= 1e6) {
      return { display: `${formatNum(convertedAmount / 1e6)} triệu`, fullValue };
    }
    if (Math.abs(convertedAmount) >= 1e3) {
      return { display: `${formatNum(convertedAmount / 1e3, 0)}K`, fullValue };
    }
    return { display: `${convertedAmount.toLocaleString('vi-VN')} ₫`, fullValue };
  } else {
    // USD: $2M, $1.5K (all in one string)
    if (Math.abs(convertedAmount) >= 1e9) {
      return { display: `$${formatNum(convertedAmount / 1e9, 2)}B`, fullValue };
    }
    if (Math.abs(convertedAmount) >= 1e6) {
      return { display: `$${formatNum(convertedAmount / 1e6, 2)}M`, fullValue };
    }
    if (Math.abs(convertedAmount) >= 1e3) {
      return { display: `$${formatNum(convertedAmount / 1e3)}K`, fullValue };
    }
    return { display: `$${formatNum(convertedAmount, 0)}`, fullValue };
  }
}

export function CurrencyDisplay({
  amount,
  className,
  valueClassName,
  badgeClassName,
  showToggle = true,
  defaultCurrency = 'VND',
  exchangeRate = DEFAULT_EXCHANGE_RATE,
  size = 'md',
}: CurrencyDisplayProps) {
  const [currency, setCurrency] = useState<CurrencyCode>(defaultCurrency);

  const toggleCurrency = useCallback(() => {
    setCurrency((prev) => (prev === 'VND' ? 'USD' : 'VND'));
  }, []);

  const formatted = formatCompact(amount, currency, exchangeRate);

  const sizeClasses = {
    sm: {
      value: 'text-sm font-semibold',
      unit: 'text-xs',
      badge: 'text-[10px] px-1 py-0.5',
    },
    md: {
      value: 'text-base font-bold',
      unit: 'text-xs',
      badge: 'text-[10px] px-1.5 py-0.5',
    },
    lg: {
      value: 'text-lg font-bold',
      unit: 'text-sm',
      badge: 'text-xs px-2 py-1',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('inline-flex items-baseline gap-1.5', className)}>
            {/* Value with unit combined */}
            <span className={cn(sizes.value, 'whitespace-nowrap', valueClassName)}>
              {formatted.display}
            </span>

            {/* Currency Toggle Badge */}
            {showToggle && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCurrency();
                }}
                className={cn(
                  'rounded font-medium transition-all flex-shrink-0',
                  'hover:scale-105 active:scale-95',
                  currency === 'VND'
                    ? 'bg-red-500/15 text-red-600 dark:text-red-400 hover:bg-red-500/25'
                    : 'bg-green-500/15 text-green-600 dark:text-green-400 hover:bg-green-500/25',
                  sizes.badge,
                  badgeClassName
                )}
              >
                {currency}
              </button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <p className="font-medium">{formatted.fullValue}</p>
          {showToggle && (
            <p className="text-muted-foreground mt-0.5">
              Click {currency === 'VND' ? 'USD' : 'VND'} để chuyển đổi
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Simple currency formatter function (for inline use)
 */
export function formatCurrencyCompact(
  amount: number | undefined | null,
  currency: CurrencyCode = 'VND',
  exchangeRate: number = DEFAULT_EXCHANGE_RATE
): string {
  if (amount == null || isNaN(amount)) {
    return '-';
  }
  const { display } = formatCompact(amount, currency, exchangeRate);
  return display;
}

/**
 * CurrencyToggle - Standalone toggle button
 */
export function CurrencyToggle({
  currency,
  onChange,
  className,
}: {
  currency: CurrencyCode;
  onChange: (currency: CurrencyCode) => void;
  className?: string;
}) {
  return (
    <div className={cn('inline-flex rounded-lg bg-muted p-0.5', className)}>
      <button
        onClick={() => onChange('VND')}
        className={cn(
          'px-3 py-1 text-xs font-medium rounded-md transition-all',
          currency === 'VND'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        VND
      </button>
      <button
        onClick={() => onChange('USD')}
        className={cn(
          'px-3 py-1 text-xs font-medium rounded-md transition-all',
          currency === 'USD'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        USD
      </button>
    </div>
  );
}
