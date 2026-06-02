'use client';

import { useCompensationAnalytics } from '@/hooks/use-compensation';
import { CompensationStats } from '@/components/compensation/analytics/compensation-stats';
import { GradeDistribution } from '@/components/compensation/analytics/grade-distribution';
import { DepartmentComparison } from '@/components/compensation/analytics/department-comparison';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BarChart3, DollarSign, Gift, Scale, TrendingUp, Users } from 'lucide-react';

export default function CompensationDashboard() {
  const { data: analytics, isLoading } = useCompensationAnalytics();

  const quickLinks = [
    { title: 'Bậc lương', href: '/compensation/grades', icon: <BarChart3 className="w-4 h-4" /> },
    { title: 'Ma trận Merit', href: '/compensation/merit-matrix', icon: <TrendingUp className="w-4 h-4" /> },
    { title: 'Xét duyệt lương', href: '/compensation/reviews', icon: <DollarSign className="w-4 h-4" /> },
    { title: 'Phúc lợi', href: '/compensation/benefits', icon: <Gift className="w-4 h-4" /> },
    { title: 'Tổng đãi ngộ', href: '/compensation/total-rewards', icon: <Users className="w-4 h-4" /> },
    { title: 'Công bằng lương', href: '/compensation/pay-equity', icon: <Scale className="w-4 h-4" /> },
  ];

  if (isLoading) return <div className="p-6"><p className="text-muted-foreground">Đang tải...</p></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Đãi ngộ & Phúc lợi</h1>
      </div>

      {analytics && <CompensationStats stats={analytics} />}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-3 text-center">
                <div className="flex justify-center mb-2 text-primary">{link.icon}</div>
                <p className="text-xs font-medium">{link.title}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {analytics?.gradeDistribution && <GradeDistribution data={analytics.gradeDistribution} />}
        {analytics?.departmentStats && <DepartmentComparison data={analytics.departmentStats} />}
      </div>
    </div>
  );
}
