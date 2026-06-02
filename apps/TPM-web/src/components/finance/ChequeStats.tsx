/**
 * Cheque Stats Component
 */

import { StatCard, StatCardGroup } from '@/components/ui/stat-card';
import { CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ChequeStatsProps {
  summary: {
    totalIssued: number;
    totalCleared: number;
    totalVoided: number;
    totalPending: number;
    issuedAmount: number;
    clearedAmount: number;
    pendingAmount: number;
  };
}

export function ChequeStats({ summary }: ChequeStatsProps) {
  return (
    <StatCardGroup cols={4}>
      <StatCard
        title="Issued Cheques"
        value=""
        amount={summary.issuedAmount}
        subtitle={`${summary.totalIssued} outstanding`}
        icon={CreditCard}
        color="warning"
      />
      <StatCard
        title="Cleared"
        value=""
        amount={summary.clearedAmount}
        subtitle={`${summary.totalCleared} processed`}
        icon={CheckCircle}
        color="success"
      />
      <StatCard
        title="Voided"
        value={summary.totalVoided}
        subtitle="Cancelled cheques"
        icon={XCircle}
        color="danger"
      />
      <StatCard
        title="Pending"
        value=""
        amount={summary.pendingAmount}
        subtitle={`${summary.totalPending} awaiting`}
        icon={Clock}
        color="primary"
      />
    </StatCardGroup>
  );
}

export default ChequeStats;
