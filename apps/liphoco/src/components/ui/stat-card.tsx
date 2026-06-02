import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  className?: string;
}

export default function StatCard({ title, value, subtitle, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div className={cn('card flex items-start gap-4', className)}>
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50">
        <Icon className="h-5 w-5 text-brand-600" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-steel-500">{title}</p>
        <p className="mt-1 text-2xl font-bold text-steel-900">{value}</p>
        {subtitle && <p className="mt-0.5 text-xs text-steel-400">{subtitle}</p>}
        {trend && (
          <p
            className={cn(
              'mt-1 text-xs font-medium',
              trend.value >= 0 ? 'text-green-600' : 'text-red-600'
            )}
          >
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
          </p>
        )}
      </div>
    </div>
  );
}
