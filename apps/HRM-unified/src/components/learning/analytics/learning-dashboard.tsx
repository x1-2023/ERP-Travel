'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Users, Award, TrendingUp, Clock, Target } from 'lucide-react';

interface LearningMetrics {
  totalCourses: number;
  activeLearners: number;
  completionRate: number;
  avgScore: number;
  totalHoursLearned: number;
  certificationsEarned: number;
  topCourses?: { id: string; title: string; enrollments: number; completionRate: number }[];
  departmentStats?: { name: string; completionRate: number; avgHours: number }[];
}

interface LearningDashboardProps {
  metrics: LearningMetrics;
  period?: string;
}

export function LearningDashboard({ metrics, period }: LearningDashboardProps) {
  const statCards = [
    { label: 'Tong khoa hoc', value: metrics.totalCourses, icon: BookOpen, color: 'text-blue-600' },
    { label: 'Hoc vien dang hoat dong', value: metrics.activeLearners, icon: Users, color: 'text-green-600' },
    { label: 'Ty le hoan thanh', value: metrics.completionRate + '%', icon: Target, color: 'text-purple-600' },
    { label: 'Diem trung binh', value: metrics.avgScore, icon: TrendingUp, color: 'text-orange-600' },
    { label: 'Tong gio hoc', value: metrics.totalHoursLearned + 'h', icon: Clock, color: 'text-cyan-600' },
    { label: 'Chung chi dat duoc', value: metrics.certificationsEarned, icon: Award, color: 'text-yellow-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tong quan hoc tap</h2>
        {period && <Badge variant="outline">{period}</Badge>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 text-center">
              <stat.icon className={'w-5 h-5 mx-auto mb-2 ' + stat.color} />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {metrics.topCourses && metrics.topCourses.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Khoa hoc pho bien nhat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.topCourses.map((course, index) => (
              <div key={course.id} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{course.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{course.enrollments} hoc vien</span>
                    <span>{course.completionRate}% hoan thanh</span>
                  </div>
                </div>
                <Progress value={course.completionRate} className="w-20 h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {metrics.departmentStats && metrics.departmentStats.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Thong ke theo phong ban</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.departmentStats.map((dept) => (
              <div key={dept.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{dept.name}</span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{dept.completionRate}% hoan thanh</span>
                    <span>{dept.avgHours}h TB</span>
                  </div>
                </div>
                <Progress value={dept.completionRate} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
