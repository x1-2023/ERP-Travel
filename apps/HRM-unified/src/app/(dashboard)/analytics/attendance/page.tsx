'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/ui/alert';
import { BarChart } from '@/components/analytics/charts/BarChart';
import { AlertTriangle, Clock, UserCheck, Timer } from 'lucide-react';

interface AttendanceData {
  rate: number;
  totalWorkDays: number;
  totalActualDays: number;
  lateCount: number;
  lateRate: number;
  byDepartment: Record<string, { rate: number; lateRate: number }>;
  heatmap: { day: number; hour: number; value: number }[];
  dailyPattern: { day: string; rate: number }[];
}

const DAY_NAMES = ['', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6'];

export default function AttendancePage() {
  const [data, setData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch('/api/analytics/metrics/attendance');
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
        <h1 className="text-2xl font-bold">Phân tích chuyên cần</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <Skeleton className="h-20 w-full" />
          </Card>
          <Card className="p-4">
            <Skeleton className="h-20 w-full" />
          </Card>
        </div>
        <Card className="p-4">
          <Skeleton className="h-[350px] w-full" />
        </Card>
        <Card className="p-4">
          <Skeleton className="h-[250px] w-full" />
        </Card>
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

  const getHeatmapColor = (value: number) => {
    if (value >= 90) return 'bg-green-500';
    if (value >= 75) return 'bg-green-300';
    if (value >= 60) return 'bg-yellow-300';
    if (value >= 40) return 'bg-orange-300';
    return 'bg-red-300';
  };

  // Transform flat heatmap array into matrix for rendering
  const heatmapData = data.heatmap ?? [];
  const heatmapDays = [...new Set(heatmapData.map((h) => h.day))].sort();
  const heatmapHours = [...new Set(heatmapData.map((h) => h.hour))].sort((a, b) => a - b);
  const heatmapMatrix: Record<string, Record<string, number>> = {};
  for (const item of heatmapData) {
    if (!heatmapMatrix[item.day]) heatmapMatrix[item.day] = {};
    heatmapMatrix[item.day][item.hour] = item.value;
  }

  // Transform dailyPattern for BarChart
  const dailyPatternChart = {
    labels: (data.dailyPattern ?? []).map((p) => p.day),
    datasets: [
      {
        label: 'Tỷ lệ chấm công (%)',
        data: (data.dailyPattern ?? []).map((p) => p.rate),
      },
    ],
  };

  // Transform byDepartment into array for table
  const departmentList = Object.entries(data.byDepartment ?? {}).map(
    ([department, stats]) => ({
      department,
      attendanceRate: stats.rate,
      lateRate: stats.lateRate,
    })
  );

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Phân tích chuyên cần</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Tỷ lệ chuyên cần</div>
              <div className="text-3xl font-bold">{data.rate}%</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-50 rounded-lg">
              <Timer className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Tỷ lệ đi trễ</div>
              <div className="text-3xl font-bold">{data.lateRate}%</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Ngày công chuẩn</div>
              <div className="text-3xl font-bold">{data.totalWorkDays}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <UserCheck className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Ngày công thực tế</div>
              <div className="text-3xl font-bold">{data.totalActualDays}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Heatmap */}
      {heatmapDays.length > 0 && heatmapHours.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Biểu đồ nhiệt chấm công</h3>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Header row - hours */}
              <div className="flex gap-1 mb-1">
                <div className="w-16" />
                {heatmapHours.map((hour) => (
                  <div key={hour} className="flex-1 text-center text-xs text-muted-foreground">
                    {hour}h
                  </div>
                ))}
              </div>
              {/* Data rows */}
              {heatmapDays.map((day) => (
                <div key={day} className="flex gap-1 mb-1">
                  <div className="w-16 text-xs text-muted-foreground flex items-center">
                    {DAY_NAMES[day] || `Ngày ${day}`}
                  </div>
                  {heatmapHours.map((hour) => {
                    const value = heatmapMatrix[day]?.[hour] ?? 0;
                    return (
                      <div
                        key={`${day}-${hour}`}
                        className={`flex-1 h-8 rounded ${getHeatmapColor(value)} flex items-center justify-center`}
                        title={`${DAY_NAMES[day] || `Ngày ${day}`} ${hour}h: ${value}%`}
                      >
                        <span className="text-xs text-white font-medium">
                          {value > 0 ? value : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
              {/* Legend */}
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span>Thấp</span>
                <div className="flex gap-1">
                  <div className="w-4 h-4 rounded bg-red-300" />
                  <div className="w-4 h-4 rounded bg-orange-300" />
                  <div className="w-4 h-4 rounded bg-yellow-300" />
                  <div className="w-4 h-4 rounded bg-green-300" />
                  <div className="w-4 h-4 rounded bg-green-500" />
                </div>
                <span>Cao</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Daily Pattern */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Mô hình chấm công theo ngày</h3>
        {dailyPatternChart.labels.length > 0 ? (
          <BarChart data={dailyPatternChart} />
        ) : (
          <div className="text-center text-muted-foreground py-8">
            Không có dữ liệu mô hình chấm công
          </div>
        )}
      </Card>

      {/* Department Comparison */}
      {departmentList.length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">So sánh theo phòng ban</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Phòng ban</th>
                  <th className="text-right py-2 px-3">Tỷ lệ chuyên cần</th>
                  <th className="text-right py-2 px-3">Tỷ lệ đi trễ</th>
                </tr>
              </thead>
              <tbody>
                {departmentList.map((dept) => (
                  <tr key={dept.department} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-3">{dept.department}</td>
                    <td className="text-right py-2 px-3">
                      <Badge variant={dept.attendanceRate >= 95 ? 'default' : 'secondary'}>
                        {dept.attendanceRate}%
                      </Badge>
                    </td>
                    <td className="text-right py-2 px-3">
                      <Badge variant={dept.lateRate <= 5 ? 'default' : 'destructive'}>
                        {dept.lateRate}%
                      </Badge>
                    </td>
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
