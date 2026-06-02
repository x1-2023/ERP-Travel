/**
 * KPI Card Component
 * Thành phần Thẻ KPI
 */

import React from 'react';
import { ArrowUp, ArrowDown, Minus as TrendingFlat } from 'lucide-react';
import clsx from 'clsx';
import { KPICard as KPICardType } from '../types';

interface KPICardProps extends KPICardType {
  onClick?: () => void;
  sparklineData?: number[];
}

const colorClasses = {
  primary: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  success: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
  },
  warning: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
  },
  danger: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
  },
  info: {
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
  },
};

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  trend = 'flat',
  icon,
  color = 'primary',
  module,
  link,
  onClick,
  sparklineData,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (link) {
      window.location.href = link;
    }
  };

  const colors = colorClasses[color];
  const isPositive = trend === 'up';
  const isNegative = trend === 'down';
  const changeColor = isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600';
  const changeBg = isPositive ? 'bg-green-100' : isNegative ? 'bg-red-100' : 'bg-gray-100';

  return (
    <div
      onClick={handleClick}
      className={clsx(
        'relative overflow-hidden rounded-lg border p-6 transition-all duration-200',
        colors.bg,
        colors.border,
        (link || onClick) && 'cursor-pointer hover:shadow-lg hover:border-opacity-50',
      )}
    >
      {/* Header: Title and Icon */}
      <div className="mb-4 flex items-start justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          {title}
          {module && <span className="ml-2 text-xs text-gray-500">({module})</span>}
        </h3>
        {icon && <div className={clsx('text-2xl', colors.text)}>{icon}</div>}
      </div>

      {/* Value */}
      <div className="mb-3">
        <p className={clsx('text-3xl font-bold', colors.text)}>{value}</p>
      </div>

      {/* Change Indicator */}
      {change !== undefined && (
        <div className="flex items-center gap-2">
          <div className={clsx('inline-flex items-center gap-1 rounded px-2 py-1', changeBg)}>
            {isPositive && <ArrowUp size={16} className="text-green-600" />}
            {isNegative && <ArrowDown size={16} className="text-red-600" />}
            {!isPositive && !isNegative && <TrendingFlat size={16} className="text-gray-600" />}
            <span className={clsx('text-xs font-semibold', changeColor)}>
              {isPositive ? '+' : ''}
              {change}%
            </span>
          </div>
          <span className="text-xs text-gray-600">vs last period</span>
        </div>
      )}

      {/* Sparkline (optional) */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-4 flex items-end justify-between gap-1">
          {sparklineData.map((dataPoint, idx) => {
            const maxValue = Math.max(...sparklineData);
            const minValue = Math.min(...sparklineData);
            const range = maxValue - minValue || 1;
            const height = ((dataPoint - minValue) / range) * 100;

            return (
              <div
                key={idx}
                className={clsx('flex-1 rounded-sm opacity-60', colors.border, 'bg-opacity-40')}
                style={{
                  height: `${Math.max(4, height * 0.6)}px`,
                  backgroundColor: colors.text,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Navigation indicator */}
      {(link || onClick) && (
        <div className="absolute bottom-2 right-2 text-xs text-gray-400 opacity-0 transition-opacity group-hover:opacity-100">
          →
        </div>
      )}
    </div>
  );
};

export default KPICard;
