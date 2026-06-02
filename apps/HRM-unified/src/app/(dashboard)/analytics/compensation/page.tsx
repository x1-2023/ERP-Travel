'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/ui/alert';
import { BarChart } from '@/components/analytics/charts/BarChart';
import {
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Users,
  BarChart3,
} from 'lucide-react';

interface SalaryRange {
  range: string;
  count: number;
  percentage: number;
}

interface GenderPayGap {
  maleAvg: number;
  femaleAvg: number;
  gap: number;
  gapPercentage: number;
}

interface CompaRatioLevel {
  level: string;
  compaRatio: number;
  marketMin: number;
  marketMid: number;
  marketMax: number;
  avgSalary: number;
}

interface DepartmentSalary {
  department: string;
  avgSalary: number;
  minSalary: number;
  maxSalary: number;
  headcount: number;
}

interface DistributionData {
  salaryRanges: SalaryRange[];
  compaRatioByLevel: CompaRatioLevel[];
  departmentSalary: DepartmentSalary[];
}

interface EquityData {
  genderPayGap: GenderPayGap;
}

export default function CompensationPage() {
  const [distributionData, setDistributionData] = useState<DistributionData | null>(null);
  const [equityData, setEquityData] = useState<EquityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [distRes, equityRes] = await Promise.all([
          fetch('/api/analytics/compensation/distribution'),
          fetch('/api/analytics/compensation/equity'),
        ]);

        if (!distRes.ok || !equityRes.ok) {
          throw new Error('Không thể tải dữ liệu');
        }

        const [dist, equity] = await Promise.all([
          distRes.json(),
          equityRes.json(),
        ]);

        setDistributionData(dist);
        setEquityData(equity);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">Phân tích lương thưởng</h1>
        <Card className="p-4">
          <Skeleton className="h-[300px] w-full" />
        </Card>
        <Card className="p-4">
          <Skeleton className="h-[150px] w-full" />
        </Card>
        <Card className="p-4">
          <Skeleton className="h-[300px] w-full" />
        </Card>
        <Card className="p-4">
          <Skeleton className="h-[250px] w-full" />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </Alert>
      </div>
    );
  }

  if (!distributionData || !equityData) return null;

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}tr`;
    }
    return `${(value / 1_000).toFixed(0)}k`;
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Phân tích lương thưởng</h1>

      {/* Salary Distribution */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Phân bổ lương theo khoảng</h3>
        </div>
        <BarChart
          data={{
            labels: distributionData.salaryRanges.map((r) => r.range),
            datasets: [
              {
                label: 'Số nhân viên',
                data: distributionData.salaryRanges.map((r) => r.count),
              },
            ],
          }}
        />
      </Card>

      {/* Pay Equity Section */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-pink-600" />
          <h3 className="text-lg font-semibold">Công bằng lương theo giới tính</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-muted-foreground">Lương TB Nam</div>
            <div className="text-xl font-bold text-blue-700">
              {formatCurrency(equityData.genderPayGap.maleAvg)} VNĐ
            </div>
          </div>
          <div className="text-center p-4 bg-pink-50 rounded-lg">
            <div className="text-sm text-muted-foreground">Lương TB Nữ</div>
            <div className="text-xl font-bold text-pink-700">
              {formatCurrency(equityData.genderPayGap.femaleAvg)} VNĐ
            </div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-muted-foreground">Khoảng cách</div>
            <div className="text-xl font-bold">
              <Badge variant={equityData.genderPayGap.gapPercentage > 5 ? 'destructive' : 'default'}>
                {equityData.genderPayGap.gapPercentage > 0 ? '+' : ''}
                {equityData.genderPayGap.gapPercentage.toFixed(1)}%
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Compa-ratio by Level */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold">Compa-ratio theo cấp bậc</h3>
        </div>
        <BarChart
          data={{
            labels: distributionData.compaRatioByLevel.map((l) => l.level),
            datasets: [
              {
                label: 'Lương TB',
                data: distributionData.compaRatioByLevel.map((l) => l.avgSalary),
              },
              {
                label: 'Thị trường (Min)',
                data: distributionData.compaRatioByLevel.map((l) => l.marketMin),
              },
              {
                label: 'Thị trường (Max)',
                data: distributionData.compaRatioByLevel.map((l) => l.marketMax),
              },
            ],
          }}
        />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3">Cấp bậc</th>
                <th className="text-right py-2 px-3">Compa-ratio</th>
                <th className="text-right py-2 px-3">Lương TB</th>
                <th className="text-right py-2 px-3">Thị trường (Mid)</th>
              </tr>
            </thead>
            <tbody>
              {distributionData.compaRatioByLevel.map((level) => (
                <tr key={level.level} className="border-b hover:bg-muted/50">
                  <td className="py-2 px-3">{level.level}</td>
                  <td className="text-right py-2 px-3">
                    <Badge
                      variant={
                        level.compaRatio >= 0.95 && level.compaRatio <= 1.05
                          ? 'default'
                          : level.compaRatio < 0.95
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {level.compaRatio.toFixed(2)}
                    </Badge>
                  </td>
                  <td className="text-right py-2 px-3">
                    {formatCurrency(level.avgSalary)}
                  </td>
                  <td className="text-right py-2 px-3">
                    {formatCurrency(level.marketMid)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Department Salary Comparison */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-5 w-5 text-yellow-600" />
          <h3 className="text-lg font-semibold">So sánh lương theo phòng ban</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3">Phòng ban</th>
                <th className="text-right py-2 px-3">Số NV</th>
                <th className="text-right py-2 px-3">Lương TB</th>
                <th className="text-right py-2 px-3">Thấp nhất</th>
                <th className="text-right py-2 px-3">Cao nhất</th>
              </tr>
            </thead>
            <tbody>
              {distributionData.departmentSalary.map((dept) => (
                <tr key={dept.department} className="border-b hover:bg-muted/50">
                  <td className="py-2 px-3">{dept.department}</td>
                  <td className="text-right py-2 px-3">{dept.headcount}</td>
                  <td className="text-right py-2 px-3 font-medium">
                    {formatCurrency(dept.avgSalary)}
                  </td>
                  <td className="text-right py-2 px-3">
                    {formatCurrency(dept.minSalary)}
                  </td>
                  <td className="text-right py-2 px-3">
                    {formatCurrency(dept.maxSalary)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
