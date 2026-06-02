'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/ui/alert';
import { PieChart } from '@/components/analytics/charts/PieChart';
import { BarChart } from '@/components/analytics/charts/BarChart';
import { AlertTriangle, Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface WorkforceComposition {
  genderDistribution: { gender: string; count: number; percentage: number }[];
  ageGroups: { group: string; count: number; percentage: number }[];
  tenureDistribution: { range: string; count: number; percentage: number }[];
  departmentBreakdown: {
    department: string;
    departmentId: string;
    headcount: number;
    percentage: number;
    avgAge: number;
    avgTenure: number;
  }[];
  headcount: {
    total: number;
    active: number;
    newHires: number;
    terminated: number;
    netChange: number;
  };
}

export default function HRAnalyticsPage() {
  const [data, setData] = useState<WorkforceComposition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch('/api/analytics/hr');
        if (!response.ok) throw new Error('Không thể tải dữ liệu');
        const result = await response.json();
        setData(result.data ?? result);
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
        <h1 className="text-2xl font-bold">Phân tích nhân sự</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-16 w-full" />
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-[250px] w-full" />
            </Card>
          ))}
        </div>
        <Card className="p-4">
          <Skeleton className="h-[200px] w-full" />
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

  if (!data) return null;

  const genderChart = {
    labels: (data.genderDistribution ?? []).map((g) => g.gender || 'Không rõ'),
    datasets: [
      {
        label: 'Giới tính',
        data: (data.genderDistribution ?? []).map((g) => g.count),
      },
    ],
  };

  const ageChart = {
    labels: (data.ageGroups ?? []).map((a) => a.group),
    datasets: [
      {
        label: 'Số nhân viên',
        data: (data.ageGroups ?? []).map((a) => a.count),
      },
    ],
  };

  const tenureChart = {
    labels: (data.tenureDistribution ?? []).map((t) => t.range),
    datasets: [
      {
        label: 'Số nhân viên',
        data: (data.tenureDistribution ?? []).map((t) => t.count),
      },
    ],
  };

  const headcount = data.headcount ?? { total: 0, active: 0, newHires: 0, terminated: 0, netChange: 0 };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Phân tích nhân sự</h1>

      {/* Headcount Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 text-center">
          <div className="text-sm text-muted-foreground">Tổng nhân sự</div>
          <div className="text-2xl font-bold mt-1">{headcount.total}</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-sm text-muted-foreground">Đang làm việc</div>
          <div className="text-2xl font-bold mt-1 text-green-600">{headcount.active}</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-sm text-muted-foreground">Tuyển mới</div>
          <div className="text-2xl font-bold mt-1 text-blue-600">{headcount.newHires}</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-sm text-muted-foreground">Nghỉ việc</div>
          <div className="text-2xl font-bold mt-1 text-red-600">{headcount.terminated}</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-sm text-muted-foreground">Thay đổi ròng</div>
          <div className={`text-2xl font-bold mt-1 flex items-center justify-center gap-1 ${
            headcount.netChange > 0
              ? 'text-green-600'
              : headcount.netChange < 0
              ? 'text-red-600'
              : 'text-muted-foreground'
          }`}>
            {headcount.netChange > 0 ? (
              <TrendingUp className="h-5 w-5" />
            ) : headcount.netChange < 0 ? (
              <TrendingDown className="h-5 w-5" />
            ) : (
              <Minus className="h-5 w-5" />
            )}
            {headcount.netChange > 0 ? '+' : ''}{headcount.netChange}
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Tỷ lệ giới tính</h3>
          {genderChart.labels.length > 0 ? (
            <PieChart data={genderChart} />
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
              Chưa có dữ liệu
            </div>
          )}
        </Card>
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Nhóm tuổi</h3>
          {ageChart.labels.length > 0 ? (
            <BarChart data={ageChart} />
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
              Chưa có dữ liệu
            </div>
          )}
        </Card>
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Thâm niên</h3>
          {tenureChart.labels.length > 0 ? (
            <BarChart data={tenureChart} />
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
              Chưa có dữ liệu
            </div>
          )}
        </Card>
      </div>

      {/* Department Breakdown Table */}
      {(data.departmentBreakdown ?? []).length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Phân bổ nhân sự theo phòng ban</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Phòng ban</th>
                  <th className="text-right py-2 px-3">Số nhân viên</th>
                  <th className="text-right py-2 px-3">Tỷ lệ</th>
                  <th className="text-right py-2 px-3">Tuổi TB</th>
                  <th className="text-right py-2 px-3">Thâm niên TB (năm)</th>
                </tr>
              </thead>
              <tbody>
                {data.departmentBreakdown.map((dept) => (
                  <tr key={dept.departmentId} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-3">{dept.department}</td>
                    <td className="text-right py-2 px-3">{dept.headcount}</td>
                    <td className="text-right py-2 px-3">{dept.percentage}%</td>
                    <td className="text-right py-2 px-3">{dept.avgAge}</td>
                    <td className="text-right py-2 px-3">{dept.avgTenure}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
