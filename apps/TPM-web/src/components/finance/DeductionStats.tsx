/**
 * Deduction Stats Component
 */

import { StatCard, StatCardGroup } from '@/components/ui/stat-card';
import { AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

interface DeductionStatsProps {
  summary: {
    totalOpen: number;
    totalMatched: number;
    totalDisputed: number;
    totalResolved: number;
    openAmount: number;
    matchedAmount: number;
    disputedAmount: number;
  };
}

export function DeductionStats({ summary }: DeductionStatsProps) {
  return (
    <StatCardGroup cols={4}>
      <StatCard
        title="Open Deductions"
        value=""
        amount={summary.openAmount}
        subtitle={`${summary.totalOpen} pending`}
        icon={Clock}
        color="warning"
      />
      <StatCard
        title="Matched"
        value=""
        amount={summary.matchedAmount}
        subtitle={`${summary.totalMatched} resolved`}
        icon={CheckCircle}
        color="success"
      />
      <StatCard
        title="Disputed"
        value=""
        amount={summary.disputedAmount}
        subtitle={`${summary.totalDisputed} in review`}
        icon={AlertCircle}
        color="danger"
      />
      <StatCard
        title="Resolved/Written Off"
        value={summary.totalResolved}
        subtitle="Closed cases"
        icon={XCircle}
        color="default"
      />
    </StatCardGroup>
  );
}

export default DeductionStats;
