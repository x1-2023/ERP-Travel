'use client';

import { useCompensationAnalytics } from '@/hooks/use-compensation';
import { CompensationStats } from '@/components/compensation/analytics/compensation-stats';
import { GradeDistribution } from '@/components/compensation/analytics/grade-distribution';
import { DepartmentComparison } from '@/components/compensation/analytics/department-comparison';

export default function CompensationAnalyticsPage() {
  const { data: analytics, isLoading } = useCompensationAnalytics();

  if (isLoading) return <div className="p-6"><p className="text-muted-foreground">Đang tải...</p></div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Phân tích đãi ngộ</h1>
      {analytics && (
        <>
          <CompensationStats stats={analytics} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GradeDistribution data={analytics.gradeDistribution || []} />
            <DepartmentComparison data={analytics.departmentStats || []} />
          </div>
        </>
      )}
    </div>
  );
}
