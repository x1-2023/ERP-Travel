/**
 * StatCard - Unified stat card component with watermark icons
 * Design: Neutral bg-card background, colored icon badges only
 */

import { ReactNode, createElement } from 'react';
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/ui/currency-display';

// ─── Color Variants ──────────────────────────────────────────────────
// All cards use bg-card (neutral). Color only affects icon badge + watermark.

const statCardVariants = cva(
  [
    'relative overflow-hidden',
    'rounded-2xl border border-surface-border',
    'bg-card',
    'shadow-sm',
    'hover:shadow-md dark:hover:shadow-xl',
    'hover:-translate-y-0.5 hover:scale-[1.005]',
    'transition-all duration-300 ease-out',
  ].join(' '),
);

// Color type for icon badges and accent
export type StatCardColor =
  | 'default' | 'primary' | 'success' | 'warning' | 'danger'
  | 'info' | 'purple' | 'cyan' | 'orange';

const iconColorMap: Record<StatCardColor, string> = {
  default: 'text-muted-foreground',
  primary: 'text-blue-600 dark:text-blue-400',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-orange-600 dark:text-orange-400',
  danger: 'text-red-600 dark:text-red-400',
  info: 'text-sky-600 dark:text-sky-400',
  purple: 'text-purple-600 dark:text-purple-400',
  cyan: 'text-cyan-600 dark:text-cyan-400',
  orange: 'text-orange-600 dark:text-orange-400',
};

const watermarkColorMap: Record<StatCardColor, string> = {
  default: 'text-muted-foreground',
  primary: 'text-blue-300 dark:text-blue-800',
  success: 'text-green-300 dark:text-green-800',
  warning: 'text-orange-300 dark:text-orange-800',
  danger: 'text-red-300 dark:text-red-800',
  info: 'text-sky-300 dark:text-sky-800',
  purple: 'text-purple-300 dark:text-purple-800',
  cyan: 'text-cyan-300 dark:text-cyan-800',
  orange: 'text-orange-300 dark:text-orange-800',
};

const badgeBgMap: Record<StatCardColor, string> = {
  default: 'bg-muted',
  primary: 'bg-blue-100 dark:bg-blue-900/20',
  success: 'bg-green-100 dark:bg-green-900/20',
  warning: 'bg-orange-100 dark:bg-orange-900/20',
  danger: 'bg-red-100 dark:bg-red-900/20',
  info: 'bg-sky-100 dark:bg-sky-900/20',
  purple: 'bg-purple-100 dark:bg-purple-900/20',
  cyan: 'bg-cyan-100 dark:bg-cyan-900/20',
  orange: 'bg-orange-100 dark:bg-orange-900/20',
};

// ─── Trend Helpers ───────────────────────────────────────────────────

function getTrendIcon(value: number) {
  if (value > 0) return TrendingUp;
  if (value < 0) return TrendingDown;
  return Minus;
}

function getTrendStyle(value: number) {
  if (value > 0) return { bg: 'rgba(16, 185, 129, 0.12)', color: '#059669' };
  if (value < 0) return { bg: 'rgba(239, 68, 68, 0.1)', color: '#DC2626' };
  return { bg: 'rgba(100, 116, 139, 0.1)', color: '#64748B' };
}

// ─── Shared Watermark Renderer ───────────────────────────────────────

function WatermarkIcon({
  icon: Icon,
  size,
  opacity,
  colorClass,
}: {
  icon: LucideIcon;
  size: string;
  opacity: string;
  colorClass: string;
}) {
  return createElement(Icon, {
    className: cn(size, 'absolute -right-3 -bottom-3 -rotate-12 pointer-events-none', colorClass),
    strokeWidth: 1,
    style: { opacity: parseFloat(opacity) },
  });
}

// ─── Props ───────────────────────────────────────────────────────────

interface TrendProp {
  value: number;
  label?: string;
  direction?: 'up' | 'down' | 'neutral';
}

export interface StatCardProps {
  title: string;
  value: string | number;
  amount?: number;
  subtitle?: string;
  footer?: ReactNode;
  icon?: LucideIcon;
  trend?: TrendProp;
  color?: StatCardColor;
  pulse?: boolean;
  className?: string;
  onClick?: () => void;
}

// ─── StatCard (Main) ─────────────────────────────────────────────────

export function StatCard({
  title,
  value,
  amount,
  subtitle,
  footer,
  icon: Icon,
  trend,
  color = 'default',
  pulse = false,
  className,
  onClick,
}: StatCardProps) {
  return (
    <div
      className={cn(
        statCardVariants(),
        'p-5',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {/* Watermark */}
      {Icon && (
        <WatermarkIcon
          icon={Icon}
          size="h-28 w-28"
          opacity="0.07"
          colorClass={watermarkColorMap[color]}
        />
      )}

      {/* Content */}
      <div className="relative z-10 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && (
              <div className={cn('rounded-full p-2 shrink-0', badgeBgMap[color])}>
                {createElement(Icon, {
                  className: cn('h-4 w-4', iconColorMap[color]),
                  strokeWidth: 1.75,
                })}
              </div>
            )}
            <span className="text-[11px] font-semibold text-foreground-subtle uppercase tracking-wider truncate">
              {title}
            </span>
          </div>
          {pulse && (
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
          )}
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-1.5 min-w-0">
          <span className="text-2xl font-bold text-foreground font-mono tabular-nums tracking-tight truncate">
            {amount !== undefined ? <CurrencyDisplay amount={amount} size="lg" /> : value}
          </span>
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-xs text-foreground-muted mt-1 truncate">{subtitle}</p>
        )}

        {/* Trend */}
        {trend && (
          <div className="flex items-center gap-2 mt-2">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: getTrendStyle(trend.value).bg,
                color: getTrendStyle(trend.value).color,
              }}
            >
              {createElement(getTrendIcon(trend.value), { className: 'h-3.5 w-3.5' })}
              <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
              {trend.label && (
                <span className="font-normal text-foreground-subtle ml-0.5">
                  {trend.label}
                </span>
              )}
            </span>
          </div>
        )}

        {/* Footer */}
        {footer && (
          <div className="mt-3 pt-3 border-t border-surface-border/50 text-xs text-foreground-muted">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── StatCardCompact ─────────────────────────────────────────────────

export interface StatCardCompactProps {
  title: string;
  value: string | number;
  amount?: number;
  icon?: LucideIcon;
  trend?: TrendProp;
  color?: StatCardColor;
  className?: string;
  onClick?: () => void;
}

export function StatCardCompact({
  title,
  value,
  amount,
  icon: Icon,
  trend,
  color = 'default',
  className,
  onClick,
}: StatCardCompactProps) {
  return (
    <div
      className={cn(
        statCardVariants(),
        'px-4 py-3',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {/* Watermark */}
      {Icon && (
        <WatermarkIcon
          icon={Icon}
          size="h-16 w-16"
          opacity="0.07"
          colorClass={watermarkColorMap[color]}
        />
      )}

      <div className="relative z-10 flex items-center justify-between gap-3 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon && (
            <div className={cn('rounded-full p-1.5 shrink-0', badgeBgMap[color])}>
              {createElement(Icon, {
                className: cn('h-3.5 w-3.5', iconColorMap[color]),
                strokeWidth: 1.75,
              })}
            </div>
          )}
          <span className="text-xs text-foreground-muted uppercase tracking-wide font-medium truncate">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-lg font-bold font-mono tabular-nums">
            {amount !== undefined ? <CurrencyDisplay amount={amount} size="sm" /> : value}
          </span>
          {trend && (
            <span
              className={cn(
                'flex items-center gap-0.5 text-xs font-medium',
                trend.value > 0
                  ? 'text-green-600 dark:text-green-400'
                  : trend.value < 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-foreground-muted'
              )}
            >
              {createElement(getTrendIcon(trend.value), { className: 'h-3 w-3' })}
              {Math.abs(trend.value)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── StatCardHorizontal ──────────────────────────────────────────────

export interface StatCardHorizontalProps extends StatCardProps {
  action?: ReactNode;
}

export function StatCardHorizontal({
  title,
  value,
  amount,
  subtitle,
  icon: Icon,
  trend,
  color = 'default',
  pulse = false,
  action,
  className,
  onClick,
}: StatCardHorizontalProps) {
  return (
    <div
      className={cn(
        statCardVariants(),
        'p-5',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {/* Watermark */}
      {Icon && (
        <WatermarkIcon
          icon={Icon}
          size="h-32 w-32"
          opacity="0.06"
          colorClass={watermarkColorMap[color]}
        />
      )}

      <div className="relative z-10 flex items-center justify-between gap-4">
        {/* Left: Icon badge + content */}
        <div className="flex items-center gap-4 min-w-0">
          {Icon && (
            <div className={cn('rounded-full p-3 shrink-0', badgeBgMap[color])}>
              {createElement(Icon, {
                className: cn('h-6 w-6', iconColorMap[color]),
                strokeWidth: 1.75,
              })}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[11px] font-semibold text-foreground-subtle uppercase tracking-wider truncate">
                {title}
              </span>
              {pulse && (
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2 mt-1 min-w-0">
              <span className="text-2xl font-bold text-foreground font-mono tabular-nums tracking-tight truncate">
                {amount !== undefined ? <CurrencyDisplay amount={amount} size="lg" /> : value}
              </span>
              {subtitle && (
                <span className="text-xs text-foreground-muted truncate">{subtitle}</span>
              )}
            </div>
            {trend && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold mt-1.5"
                style={{
                  backgroundColor: getTrendStyle(trend.value).bg,
                  color: getTrendStyle(trend.value).color,
                }}
              >
                {createElement(getTrendIcon(trend.value), { className: 'h-3.5 w-3.5' })}
                <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
                {trend.label && (
                  <span className="font-normal text-foreground-subtle ml-0.5">{trend.label}</span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Right: Action */}
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

// ─── StatCardGroup ───────────────────────────────────────────────────

interface StatCardGroupProps {
  cols?: 2 | 3 | 4 | 5;
  children: ReactNode;
  className?: string;
}

const colsMap = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 md:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
  5: 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
};

export function StatCardGroup({ cols = 4, children, className }: StatCardGroupProps) {
  return (
    <div className={cn('grid gap-4', colsMap[cols], className)}>
      {children}
    </div>
  );
}

export { statCardVariants };
