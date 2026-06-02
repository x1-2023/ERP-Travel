'use client';
import { Badge } from '@/components/ui/badge';
import { getCompaRatioLabel } from '@/lib/compensation/utils';

interface CompaRatioBadgeProps { value: number; }

export function CompaRatioBadge({ value }: CompaRatioBadgeProps) {
  const { label, color } = getCompaRatioLabel(value);
  const colorClasses: Record<string, string> = {
    red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  };
  return (
    <Badge variant="outline" className={colorClasses[color] || colorClasses.gray}>
      {value.toFixed(2)} - {label}
    </Badge>
  );
}
