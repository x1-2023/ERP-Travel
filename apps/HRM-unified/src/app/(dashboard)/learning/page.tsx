'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, GraduationCap, Clock, Award, AlertTriangle, Target, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function LearningDashboardPage() {
  const [stats, setStats] = useState({
    coursesInProgress: 0, coursesCompleted: 0, totalHours: 0, certifications: 0, expiringCerts: 0, skillsAssessed: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setStats({ coursesInProgress: 3, coursesCompleted: 12, totalHours: 48, certifications: 5, expiringCerts: 1, skillsAssessed: 15 });
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Học tập & Phát triển</h1>
        <p className="text-muted-foreground">Quản lý khóa học, kỹ năng và chứng chỉ</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-6"><div className="flex items-center gap-4"><div className="p-3 bg-blue-500/10 rounded-lg"><BookOpen className="h-6 w-6 text-blue-500" /></div><div><p className="text-sm text-muted-foreground">Đang học</p><p className="text-2xl font-bold">{stats.coursesInProgress}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center gap-4"><div className="p-3 bg-green-500/10 rounded-lg"><GraduationCap className="h-6 w-6 text-green-500" /></div><div><p className="text-sm text-muted-foreground">Hoàn thành</p><p className="text-2xl font-bold">{stats.coursesCompleted}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center gap-4"><div className="p-3 bg-purple-500/10 rounded-lg"><Clock className="h-6 w-6 text-purple-500" /></div><div><p className="text-sm text-muted-foreground">Giờ học</p><p className="text-2xl font-bold">{stats.totalHours}h</p></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center gap-4"><div className="p-3 bg-orange-500/10 rounded-lg"><Award className="h-6 w-6 text-orange-500" /></div><div><p className="text-sm text-muted-foreground">Chứng chỉ</p><div className="flex items-center gap-2"><p className="text-2xl font-bold">{stats.certifications}</p>{stats.expiringCerts > 0 && <span className="flex items-center text-xs text-yellow-600"><AlertTriangle className="w-3 h-3 mr-1" />{stats.expiringCerts} sắp hết hạn</span>}</div></div></div></CardContent></Card>
      </div>
      <Tabs defaultValue="my-learning" className="space-y-4">
        <TabsList>
          <TabsTrigger value="my-learning">Đang học</TabsTrigger>
          <TabsTrigger value="catalog">Khám phá</TabsTrigger>
          <TabsTrigger value="skills">Kỹ năng</TabsTrigger>
          <TabsTrigger value="certifications">Chứng chỉ</TabsTrigger>
        </TabsList>
        <TabsContent value="my-learning"><Card><CardContent className="p-6 text-center text-muted-foreground"><BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Bạn chưa đăng ký khóa học nào</p><Link href="/learning/courses"><Button variant="outline" className="mt-4">Khám phá khóa học</Button></Link></CardContent></Card></TabsContent>
        <TabsContent value="catalog"><Card><CardContent className="p-6 text-center text-muted-foreground"><Target className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Chưa có khóa học đề xuất</p><Link href="/learning/courses"><Button variant="outline" className="mt-4">Xem danh mục khóa học</Button></Link></CardContent></Card></TabsContent>
        <TabsContent value="skills"><Card><CardContent className="p-6 text-center text-muted-foreground"><TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Hoàn thành đánh giá kỹ năng để xem tiến độ</p><Link href="/learning/skills"><Button variant="outline" className="mt-4">Bắt đầu đánh giá</Button></Link></CardContent></Card></TabsContent>
        <TabsContent value="certifications"><Card><CardContent className="p-6 text-center text-muted-foreground"><Award className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Chưa có chứng chỉ nào được ghi nhận</p><Link href="/learning/certifications/new"><Button variant="outline" className="mt-4">Thêm chứng chỉ</Button></Link></CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
}
