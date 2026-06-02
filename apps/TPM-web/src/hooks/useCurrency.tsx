/**
 * Currency Hook - Manages currency state and exchange rate
 */

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';

// Types
export type CurrencyCode = 'VND' | 'USD';

interface ExchangeRate {
  rate: number; // VND per 1 USD
  updatedAt: Date;
}

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  toggleCurrency: () => void;
  exchangeRate: ExchangeRate;
  isLoading: boolean;
  convert: (amountVND: number, toCurrency: CurrencyCode) => number;
  formatCompact: (amount: number, currency?: CurrencyCode) => string;
  formatWithUnit: (amount: number, currency?: CurrencyCode) => { value: string; unit: string };
}

// Default exchange rate (fallback)
const DEFAULT_RATE = 25000; // 1 USD = 25,000 VND

// Context
const CurrencyContext = createContext<CurrencyContextType | null>(null);

// Provider Component
export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyCode>('VND');
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate>({
    rate: DEFAULT_RATE,
    updatedAt: new Date(),
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch exchange rate from API
  const fetchExchangeRate = useCallback(async () => {
    setIsLoading(true);
    try {
      // Using exchangerate-api.com (free tier)
      const response = await fetch(
        'https://api.exchangerate-api.com/v4/latest/USD'
      );

      if (response.ok) {
        const data = await response.json();
        const vndRate = data.rates?.VND;

        if (vndRate) {
          setExchangeRate({
            rate: vndRate,
            updatedAt: new Date(),
          });
        }
      }
    } catch (error) {
      console.warn('Failed to fetch exchange rate, using default:', error);
      // Keep using existing rate
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch rate on mount and every 30 minutes
  useEffect(() => {
    fetchExchangeRate();
    const interval = setInterval(fetchExchangeRate, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchExchangeRate]);

  // Toggle between VND and USD
  const toggleCurrency = useCallback(() => {
    setCurrency((prev) => (prev === 'VND' ? 'USD' : 'VND'));
  }, []);

  // Convert amount
  const convert = useCallback(
    (amountVND: number, toCurrency: CurrencyCode): number => {
      if (toCurrency === 'VND') return amountVND;
      return amountVND / exchangeRate.rate;
    },
    [exchangeRate.rate]
  );

  // Format compact number with units
  const formatCompact = useCallback(
    (amount: number, curr: CurrencyCode = currency): string => {
      const convertedAmount = curr === 'VND' ? amount : amount / exchangeRate.rate;

      if (curr === 'VND') {
        // Vietnamese units: nghìn (K), triệu (M), tỷ (B)
        if (Math.abs(convertedAmount) >= 1e12) {
          return `${(convertedAmount / 1e12).toFixed(1)} nghìn tỷ`;
        }
        if (Math.abs(convertedAmount) >= 1e9) {
          return `${(convertedAmount / 1e9).toFixed(1)} tỷ`;
        }
        if (Math.abs(convertedAmount) >= 1e6) {
          return `${(convertedAmount / 1e6).toFixed(1)} triệu`;
        }
        if (Math.abs(convertedAmount) >= 1e3) {
          return `${(convertedAmount / 1e3).toFixed(0)}K`;
        }
        return convertedAmount.toLocaleString('vi-VN');
      } else {
        // USD units: K, M, B
        if (Math.abs(convertedAmount) >= 1e9) {
          return `$${(convertedAmount / 1e9).toFixed(2)}B`;
        }
        if (Math.abs(convertedAmount) >= 1e6) {
          return `$${(convertedAmount / 1e6).toFixed(2)}M`;
        }
        if (Math.abs(convertedAmount) >= 1e3) {
          return `$${(convertedAmount / 1e3).toFixed(1)}K`;
        }
        return `$${convertedAmount.toFixed(0)}`;
      }
    },
    [currency, exchangeRate.rate]
  );

  // Format with separate value and unit
  const formatWithUnit = useCallback(
    (amount: number, curr: CurrencyCode = currency): { value: string; unit: string } => {
      const convertedAmount = curr === 'VND' ? amount : amount / exchangeRate.rate;

      if (curr === 'VND') {
        if (Math.abs(convertedAmount) >= 1e12) {
          return { value: (convertedAmount / 1e12).toFixed(1), unit: 'nghìn tỷ' };
        }
        if (Math.abs(convertedAmount) >= 1e9) {
          return { value: (convertedAmount / 1e9).toFixed(1), unit: 'tỷ' };
        }
        if (Math.abs(convertedAmount) >= 1e6) {
          return { value: (convertedAmount / 1e6).toFixed(1), unit: 'triệu' };
        }
        if (Math.abs(convertedAmount) >= 1e3) {
          return { value: (convertedAmount / 1e3).toFixed(0), unit: 'K' };
        }
        return { value: convertedAmount.toLocaleString('vi-VN'), unit: '₫' };
      } else {
        if (Math.abs(convertedAmount) >= 1e9) {
          return { value: (convertedAmount / 1e9).toFixed(2), unit: 'B' };
        }
        if (Math.abs(convertedAmount) >= 1e6) {
          return { value: (convertedAmount / 1e6).toFixed(2), unit: 'M' };
        }
        if (Math.abs(convertedAmount) >= 1e3) {
          return { value: (convertedAmount / 1e3).toFixed(1), unit: 'K' };
        }
        return { value: convertedAmount.toFixed(0), unit: '' };
      }
    },
    [currency, exchangeRate.rate]
  );

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        toggleCurrency,
        exchangeRate,
        isLoading,
        convert,
        formatCompact,
        formatWithUnit,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

// Hook
export function useCurrency() {
  const context = useContext(CurrencyContext);

  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }

  return context;
}

// Standalone formatter (for use outside provider)
export function formatCompactCurrency(
  amount: number,
  currency: CurrencyCode = 'VND',
  exchangeRate: number = DEFAULT_RATE
): string {
  const convertedAmount = currency === 'VND' ? amount : amount / exchangeRate;

  if (currency === 'VND') {
    if (Math.abs(convertedAmount) >= 1e12) {
      return `${(convertedAmount / 1e12).toFixed(1)} nghìn tỷ`;
    }
    if (Math.abs(convertedAmount) >= 1e9) {
      return `${(convertedAmount / 1e9).toFixed(1)} tỷ`;
    }
    if (Math.abs(convertedAmount) >= 1e6) {
      return `${(convertedAmount / 1e6).toFixed(1)} triệu`;
    }
    if (Math.abs(convertedAmount) >= 1e3) {
      return `${(convertedAmount / 1e3).toFixed(0)}K ₫`;
    }
    return `${convertedAmount.toLocaleString('vi-VN')} ₫`;
  } else {
    if (Math.abs(convertedAmount) >= 1e9) {
      return `$${(convertedAmount / 1e9).toFixed(2)}B`;
    }
    if (Math.abs(convertedAmount) >= 1e6) {
      return `$${(convertedAmount / 1e6).toFixed(2)}M`;
    }
    if (Math.abs(convertedAmount) >= 1e3) {
      return `$${(convertedAmount / 1e3).toFixed(1)}K`;
    }
    return `$${convertedAmount.toFixed(0)}`;
  }
}
