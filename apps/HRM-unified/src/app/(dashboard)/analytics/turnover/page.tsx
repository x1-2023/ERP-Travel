'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/ui/alert';
import { LineChart } from '@/components/analytics/charts/LineChart';
import { BarChart } from '@/components/analytics/charts/BarChart';
import { PieChart } from '@/components/analytics/charts/PieChart';
import {
  AlertTriangle,
  UserMinus,
  AlertCircle,
} from 'lucide-react';

interface TurnoverMetrics {
  rate: number;
  voluntaryRate: number;
  involuntaryRate: number;
  terminatedCount: number;
  avgHeadcount: number;
  byDepartment: Record<string, { rate: number; count: number }>;
  byReason: Record<string, number>;
  trend: { month: string; rate: number }[];
}

interface PredictionResult {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  position: string;
  riskScore: number;
  riskLevel: string;
  factors: Record<string, unknown>[];
  recommendations: string[];
}

export default function TurnoverPage() {
  const [turnoverData, setTurnoverData] = useState<TurnoverMetrics | null>(null);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [turnoverRes, predictionRes] = await Promise.all([
          fetch('/api/analytics/metrics/turnover'),
          fetch('/api/analytics/predictions/turnover'),
        ]);

        if (!turnoverRes.ok) {
          throw new Error('Không thể tải dữ liệu nghỉ việc');
        }

        const turnoverJson = await turnoverRes.json();
        setTurnoverData(turnoverJson.data ?? turnoverJson);

        if (predictionRes.ok) {
          const predJson = await predictionRes.json();
          const predList = predJson.data ?? predJson;
          setPredictions(Array.isArray(predList) ? predList : []);
        }
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
        <h1 className="text-2xl font-bold">Phân tích nghỉ việc</h1>
        <Card className="p-4">
          <Skeleton className="h-20 w-full" />
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-4">
            <Skeleton className="h-[300px] w-full" />
          </Card>
          <Card className="p-4">
            <Skeleton className="h-[300px] w-full" />
          </Card>
        </div>
        <Card className="p-4">
          <Skeleton className="h-[250px] w-full" />
        </Card>
        <Card className="p-4">
          <Skeleton className="h-[300px] w-full" />
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

  if (!turnoverData) return null;

  // Transform trend for LineChart
  const trendData = turnoverData.trend ?? [];
  const trendChart = {
    labels: trendData.map((t) => t.month),
    datasets: [
      {
        label: 'Tỷ lệ nghỉ việc (%)',
        data: trendData.map((t) => t.rate),
      },
    ],
  };

  // Transform byReason for PieChart
  const reasonEntries = Object.entries(turnoverData.byReason ?? {});
  const reasonChart = {
    labels: reasonEntries.map(([reason]) => reason),
    datasets: [
      {
        label: 'Lý do',
        data: reasonEntries.map(([, count]) => count),
      },
    ],
  };

  // Transform byDepartment for BarChart
  const deptEntries = Object.entries(turnoverData.byDepartment ?? {});
  const deptChart = {
    labels: deptEntries.map(([dept]) => dept),
    datasets: [
      {
        label: 'Tỷ lệ (%)',
        data: deptEntries.map(([, stats]) =>
          typeof stats === 'object' ? stats.rate : stats
        ),
      },
    ],
  };

  const highRiskPredictions = predictions.filter((p) => p.riskScore >= 50);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Phân tích nghỉ việc</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <UserMinus className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Tỷ lệ nghỉ việc</div>
              <div className="text-3xl font-bold">{turnoverData.rate}%</div>
            </div>
          </div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-sm text-muted-foreground">Tự nguyện</div>
          <div className="text-2xl font-bold mt-1 text-orange-600">{turnoverData.voluntaryRate}%</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-sm text-muted-foreground">Không tự nguyện</div>
          <div className="text-2xl font-bold mt-1 text-red-600">{turnoverData.involuntaryRate}%</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-sm text-muted-foreground">Số người nghỉ</div>
          <div className="text-2xl font-bold mt-1">{turnoverData.terminatedCount}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Turnover Trend */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Xu hướng nghỉ việc (12 tháng)</h3>
          {trendChart.labels.length > 0 ? (
            <LineChart data={trendChart} />
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
              Chưa có dữ liệu xu hướng
            </div>
          )}
        </Card>

        {/* By Reason - Pie Chart */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Lý do nghỉ việc</h3>
          {reasonChart.labels.length > 0 ? (
            <PieChart data={reasonChart} />
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
              Chưa có dữ liệu lý do
            </div>
          )}
        </Card>
      </div>

      {/* By Department - Bar Chart */}
      {deptChart.labels.length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Tỷ lệ nghỉ việc theo phòng ban</h3>
          <BarChart data={deptChart} />
        </Card>
      )}

      {/* Risk Prediction Table */}
      {predictions.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <h3 className="text-lg font-semibold">Dự đoán rủi ro nghỉ việc</h3>
            </div>
            <Badge variant="outline">
              {highRiskPredictions.length} nhân viên có nguy cơ cao
            </Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Nhân viên</th>
                  <th className="text-left py-2 px-3">Phòng ban</th>
                  <th className="text-left py-2 px-3">Vị trí</th>
                  <th className="text-center py-2 px-3">Điểm rủi ro</th>
                  <th className="text-center py-2 px-3">Mức độ</th>
                </tr>
              </thead>
              <tbody>
                {predictions.slice(0, 10).map((emp) => (
                  <tr key={emp.employeeId} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-3 font-medium">{emp.employeeName}</td>
                    <td className="py-2 px-3">{emp.department}</td>
                    <td className="py-2 px-3">{emp.position}</td>
                    <td className="text-center py-2 px-3">
                      <Badge
                        variant={
                          emp.riskScore >= 80
                            ? 'destructive'
                            : emp.riskScore >= 60
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {emp.riskScore}%
                      </Badge>
                    </td>
                    <td className="text-center py-2 px-3">
                      <Badge
                        variant={
                          emp.riskLevel === 'CRITICAL' || emp.riskLevel === 'HIGH'
                            ? 'destructive'
                            : emp.riskLevel === 'MEDIUM'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {emp.riskLevel}
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
