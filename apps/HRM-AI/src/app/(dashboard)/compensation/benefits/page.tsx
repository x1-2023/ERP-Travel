'use client';

import { useBenefitPlans } from '@/hooks/use-benefits';
import { BenefitPlanCard } from '@/components/compensation/benefits/benefit-plan-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';

export default function BenefitsPage() {
  const { data: plans, isLoading } = useBenefitPlans();

  const mandatory = plans?.filter((p: any) => p.type === 'MANDATORY') || [];
  const optional = plans?.filter((p: any) => p.type === 'OPTIONAL') || [];
  const perks = plans?.filter((p: any) => p.type === 'PERK') || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Phúc lợi</h1>
        <Button size="sm"><Plus className="w-4 h-4 mr-1" />Thêm gói</Button>
      </div>
      {isLoading ? <p className="text-muted-foreground">Đang tải...</p> : (
        <Tabs defaultValue="all">
          <TabsList><TabsTrigger value="all">Tất cả ({plans?.length || 0})</TabsTrigger><TabsTrigger value="mandatory">Bắt buộc ({mandatory.length})</TabsTrigger><TabsTrigger value="optional">Tùy chọn ({optional.length})</TabsTrigger><TabsTrigger value="perks">Đãi ngộ ({perks.length})</TabsTrigger></TabsList>
          <TabsContent value="all" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">{plans?.map((plan: any) => <BenefitPlanCard key={plan.id} plan={plan} />)}</TabsContent>
          <TabsContent value="mandatory" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">{mandatory.map((plan: any) => <BenefitPlanCard key={plan.id} plan={plan} />)}</TabsContent>
          <TabsContent value="optional" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">{optional.map((plan: any) => <BenefitPlanCard key={plan.id} plan={plan} />)}</TabsContent>
          <TabsContent value="perks" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">{perks.map((plan: any) => <BenefitPlanCard key={plan.id} plan={plan} />)}</TabsContent>
        </Tabs>
      )}
    </div>
  );
}
