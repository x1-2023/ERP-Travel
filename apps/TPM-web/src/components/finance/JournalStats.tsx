/**
 * Journal Stats Component
 */

import { StatCard, StatCardGroup } from '@/components/ui/stat-card';
import { FileEdit, CheckCircle, RotateCcw, DollarSign } from 'lucide-react';

interface JournalStatsProps {
  summary: {
    totalDraft: number;
    totalPosted: number;
    totalReversed: number;
    draftAmount: number;
    postedAmount: number;
  };
}

export function JournalStats({ summary }: JournalStatsProps) {
  return (
    <StatCardGroup cols={4}>
      <StatCard
        title="Draft Journals"
        value=""
        amount={summary.draftAmount}
        subtitle={`${summary.totalDraft} pending`}
        icon={FileEdit}
        color="warning"
      />
      <StatCard
        title="Posted"
        value=""
        amount={summary.postedAmount}
        subtitle={`${summary.totalPosted} journals`}
        icon={CheckCircle}
        color="success"
      />
      <StatCard
        title="Reversed"
        value={summary.totalReversed}
        subtitle="Reversed entries"
        icon={RotateCcw}
        color="danger"
      />
      <StatCard
        title="Total Posted Value"
        value=""
        amount={summary.postedAmount}
        subtitle="GL impact"
        icon={DollarSign}
        color="primary"
      />
    </StatCardGroup>
  );
}

export default JournalStats;
