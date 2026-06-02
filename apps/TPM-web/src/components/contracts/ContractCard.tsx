import { FileText, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ContractCardProps {
  contract: {
    id: string;
    code: string;
    name: string;
    customer?: { name: string; code: string };
    targetVolume: number;
    currentVolume: number;
    completionRate: number;
    riskLevel: string;
    status: string;
    nextMilestone?: { name: string; deadline: string } | null;
  };
  onClick?: () => void;
}

const riskColors: Record<string, string> = {
  ON_TRACK: 'text-green-600 bg-green-100',
  AT_RISK: 'text-yellow-600 bg-yellow-100',
  CRITICAL: 'text-red-600 bg-red-100',
};

const statusColors: Record<string, string> = {
  DRAFT: 'text-muted-foreground bg-muted',
  ACTIVE: 'text-blue-600 bg-blue-100',
  COMPLETED: 'text-green-600 bg-green-100',
  CANCELLED: 'text-red-600 bg-red-100',
};

export default function ContractCard({ contract, onClick }: ContractCardProps) {
  const progressPercent = Math.min(100, contract.completionRate);

  return (
    <Card
      className={cn('cursor-pointer transition-all hover:shadow-md', onClick && 'hover:border-blue-300')}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{contract.code}</CardTitle>
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', statusColors[contract.status] || 'text-muted-foreground bg-muted')}>
            {contract.status}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate">{contract.name}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {contract.customer && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="h-3 w-3" />
            <span>{contract.customer.name}</span>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Volume Progress</span>
            <span className="font-medium">{progressPercent.toFixed(1)}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                contract.riskLevel === 'CRITICAL' ? 'bg-red-500' : contract.riskLevel === 'AT_RISK' ? 'bg-yellow-500' : 'bg-blue-500'
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{contract.currentVolume.toLocaleString()}</span>
            <span>{contract.targetVolume.toLocaleString()} cases</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1', riskColors[contract.riskLevel] || 'text-muted-foreground bg-muted')}>
            {contract.riskLevel === 'CRITICAL' && <AlertTriangle className="h-3 w-3" />}
            {contract.riskLevel === 'ON_TRACK' && <TrendingUp className="h-3 w-3" />}
            {contract.riskLevel.replace('_', ' ')}
          </span>
          {contract.nextMilestone && (
            <span className="text-xs text-muted-foreground">
              Next: {contract.nextMilestone.name}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
