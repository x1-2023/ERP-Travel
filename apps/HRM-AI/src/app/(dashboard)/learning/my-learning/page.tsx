'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, BookOpen, Clock, CheckCircle, PlayCircle } from 'lucide-react';
import Link from 'next/link';

interface Enrollment {
  id: string;
  courseTitle: string;
  progress: number;
  status: string;
  startDate: string;
  dueDate: string;
  totalHours: number;
  completedHours: number;
}

export default function MyLearningPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchEnrollments() {
      try {
        const res = await fetch('/api/learning/enrollments');
        if (res.ok) {
          const data = await res.json();
          setEnrollments(data.data || []);
        }
      } catch (err) {
        setError('Không thể tải danh sách khóa học');
      } finally {
        setLoading(false);
      }
    }
    fetchEnrollments();
  }, []);

  const filteredEnrollments = enrollments.filter(e =>
    e.courseTitle.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><p>Đang tải...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Khóa học của tôi</h1>
          <p className="text-muted-foreground">Theo dõi tiến độ học tập</p>
        </div>
        <Link href="/learning/courses">
          <Button>Đăng ký thêm</Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {filteredEnrollments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Bạn chưa đăng ký khóa học nào</p>
            <Link href="/learning/courses"><Button variant="outline" className="mt-4">Khám phá khóa học</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredEnrollments.map((enrollment) => (
            <Link key={enrollment.id} href={`/learning/my-learning/${enrollment.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{enrollment.courseTitle}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{enrollment.completedHours}/{enrollment.totalHours}h</span>
                        <span>Han: {enrollment.dueDate}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={enrollment.status === 'completed' ? 'default' : 'secondary'}>
                        {enrollment.status === 'completed' ? 'Hoàn thành' : enrollment.status === 'in_progress' ? 'Đang học' : 'Chưa bắt đầu'}
                      </Badge>
                      {enrollment.status === 'completed' ? <CheckCircle className="h-5 w-5 text-green-500" /> : <PlayCircle className="h-5 w-5 text-blue-500" />}
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Tiến độ</span>
                      <span>{enrollment.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary rounded-full h-2" style={{ width: `${enrollment.progress}%` }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
