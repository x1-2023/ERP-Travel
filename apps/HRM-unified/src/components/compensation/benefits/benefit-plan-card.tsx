'use client';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BENEFIT_TYPE } from '@/lib/compensation/constants';
import { formatCurrency } from '@/lib/compensation/utils';
import { BenefitPlan } from '@/types/compensation';
import { Shield, Gift, Wallet, Star } from 'lucide-react';

const TYPE_ICONS: Record<string, React.ReactNode> = { MANDATORY: <Shield className="w-4 h-4" />, OPTIONAL: <Gift className="w-4 h-4" />, ALLOWANCE: <Wallet className="w-4 h-4" />, PERK: <Star className="w-4 h-4" /> };

interface BenefitPlanCardProps { plan: BenefitPlan; onEnroll?: () => void; enrolled?: boolean; }

export function BenefitPlanCard({ plan, onEnroll, enrolled }: BenefitPlanCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">{TYPE_ICONS[plan.type]}<h3 className="font-semibold text-sm">{plan.name}</h3></div>
          <Badge variant="outline" className="text-xs">{BENEFIT_TYPE[plan.type]?.label}</Badge>
        </div>
        {plan.description && <p className="text-xs text-muted-foreground mb-3">{plan.description}</p>}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {plan.employerContribution && <div><span className="text-muted-foreground">Công ty:</span> <span className="font-medium font-mono">{formatCurrency(plan.employerContribution)}</span></div>}
          {plan.employeeContribution && <div><span className="text-muted-foreground">NV:</span> <span className="font-medium font-mono">{formatCurrency(plan.employeeContribution)}</span></div>}
        </div>
      </CardContent>
      {onEnroll && <CardFooter className="p-4 pt-0"><Button variant={enrolled ? 'secondary' : 'default'} size="sm" className="w-full" onClick={onEnroll} disabled={enrolled}>{enrolled ? 'Đã đăng ký' : 'Đăng ký'}</Button></CardFooter>}
    </Card>
  );
}
