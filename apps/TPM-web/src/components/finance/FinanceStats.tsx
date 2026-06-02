/**
 * Finance Stats Component - Summary cards for finance pages
 */

import { StatCard, StatCardGroup } from '@/components/ui/stat-card';
import { Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';

export { StatCard } from '@/components/ui/stat-card';

interface AccrualStatsProps {
  summary: {
    totalAmount: number;
    pendingAmount: number;
    postedAmount: number;
    reversedAmount?: number;
    entryCount: number;
  };
}

export function AccrualStats({ summary }: AccrualStatsProps) {
  return (
    <StatCardGroup cols={4}>
      <StatCard
        title="Total Accrued"
        value=""
        amount={summary.totalAmount}
        subtitle={`${summary.entryCount} entries`}
        icon={DollarSign}
        color="primary"
      />
      <StatCard
        title="Pending"
        value=""
        amount={summary.pendingAmount}
        icon={Clock}
        color="warning"
      />
      <StatCard
        title="Posted to GL"
        value=""
        amount={summary.postedAmount}
        icon={CheckCircle}
        color="success"
      />
      <StatCard
        title="Reversed"
        value=""
        amount={summary.reversedAmount || 0}
        icon={XCircle}
        color="danger"
      />
    </StatCardGroup>
  );
}
