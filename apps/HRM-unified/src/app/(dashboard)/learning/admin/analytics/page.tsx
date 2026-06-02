'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Users, BookOpen, TrendingUp, Clock, Award, Download, GraduationCap } from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalEnrollments: number;
    completionRate: number;
    avgHoursPerEmployee: number;
    totalCertifications: number;
    activeUsers: number;
    satisfactionScore: number;
  };
  topCourses: { title: string; enrollments: number; completionRate: number }[];
  departmentStats: { department: string; enrollments: number; completionRate: number; avgHours: number }[];
  monthlyTrend: { month: string; enrollments: number; completions: number }[];
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('quarter');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch(`/api/learning/admin/analytics?period=${period}`);
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data.data || null);
        }
      } catch (err) {
        setError('Không thể tải dữ liệu phân tích');
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [period]);

  if (loading) return <div className="flex items-center justify-center h-64"><p>Đang tải...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Phân tích học tập</h1>
          <p className="text-muted-foreground">Báo cáo tổng quan về hoạt động đào tạo</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Tháng này</SelectItem>
              <SelectItem value="quarter">Quý này</SelectItem>
              <SelectItem value="year">Năm nay</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline"><Download className="h-4 w-4 mr-2" />Xuất báo cáo</Button>
        </div>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card><CardContent className="p-6"><div className="flex items-center gap-3"><div className="p-2 bg-blue-500/10 rounded-lg"><BookOpen className="h-5 w-5 text-blue-500" /></div><div><p className="text-sm text-muted-foreground">Tổng đăng ký</p><p className="text-2xl font-bold">{analytics?.overview.totalEnrollments || 0}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center gap-3"><div className="p-2 bg-green-500/10 rounded-lg"><GraduationCap className="h-5 w-5 text-green-500" /></div><div><p className="text-sm text-muted-foreground">Tỷ lệ hoàn thành</p><p className="text-2xl font-bold">{analytics?.overview.completionRate || 0}%</p></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center gap-3"><div className="p-2 bg-purple-500/10 rounded-lg"><Clock className="h-5 w-5 text-purple-500" /></div><div><p className="text-sm text-muted-foreground">Giờ/Nhân viên</p><p className="text-2xl font-bold">{analytics?.overview.avgHoursPerEmployee || 0}h</p></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center gap-3"><div className="p-2 bg-orange-500/10 rounded-lg"><Award className="h-5 w-5 text-orange-500" /></div><div><p className="text-sm text-muted-foreground">Chứng chỉ mới</p><p className="text-2xl font-bold">{analytics?.overview.totalCertifications || 0}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center gap-3"><div className="p-2 bg-teal-500/10 rounded-lg"><Users className="h-5 w-5 text-teal-500" /></div><div><p className="text-sm text-muted-foreground">Người dùng hoạt động</p><p className="text-2xl font-bold">{analytics?.overview.activeUsers || 0}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center gap-3"><div className="p-2 bg-pink-500/10 rounded-lg"><TrendingUp className="h-5 w-5 text-pink-500" /></div><div><p className="text-sm text-muted-foreground">Hài lòng</p><p className="text-2xl font-bold">{analytics?.overview.satisfactionScore || 0}/5</p></div></div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Khóa học phổ biến</CardTitle></CardHeader>
          <CardContent>
            {(analytics?.topCourses || []).length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-3">
                {analytics!.topCourses.map((course, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium">{course.title}</p>
                        <p className="text-xs text-muted-foreground">{course.enrollments} đăng ký</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{course.completionRate}%</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Thống kê theo phòng ban</CardTitle></CardHeader>
          <CardContent>
            {(analytics?.departmentStats || []).length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Chưa có dữ liệu</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Phòng ban</th>
                    <th className="text-center p-2">Đăng ký</th>
                    <th className="text-center p-2">Hoàn thành</th>
                    <th className="text-center p-2">Giờ TB</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics!.departmentStats.map((dept, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2">{dept.department}</td>
                      <td className="p-2 text-center">{dept.enrollments}</td>
                      <td className="p-2 text-center"><Badge variant="secondary">{dept.completionRate}%</Badge></td>
                      <td className="p-2 text-center">{dept.avgHours}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Xu hướng hàng tháng</CardTitle></CardHeader>
        <CardContent>
          {(analytics?.monthlyTrend || []).length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Chưa có dữ liệu xu huong</p>
          ) : (
            <div className="space-y-2">
              {analytics!.monthlyTrend.map((month, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-sm w-20">{month.month}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-4 relative">
                      <div className="bg-blue-500 rounded-full h-4 absolute" style={{ width: `${(month.enrollments / Math.max(...analytics!.monthlyTrend.map(m => m.enrollments))) * 100}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-12">{month.enrollments}</span>
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-4 relative">
                      <div className="bg-green-500 rounded-full h-4 absolute" style={{ width: `${(month.completions / Math.max(...analytics!.monthlyTrend.map(m => m.completions || 1))) * 100}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-12">{month.completions}</span>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-blue-500" />Đăng ký</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-500" />Hoàn thành</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
