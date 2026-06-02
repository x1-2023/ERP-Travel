'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, CheckCircle, PlayCircle, Award } from 'lucide-react';
import Link from 'next/link';

interface EnrollmentDetail {
  id: string;
  courseTitle: string;
  courseDescription: string;
  progress: number;
  status: string;
  startDate: string;
  dueDate: string;
  totalHours: number;
  completedHours: number;
  modules: { id: string; title: string; completed: boolean; duration: number }[];
  grade: number | null;
}

export default function EnrollmentDetailPage() {
  const params = useParams();
  const [enrollment, setEnrollment] = useState<EnrollmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchEnrollment() {
      try {
        const res = await fetch(`/api/learning/enrollments/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setEnrollment(data.data || data);
        } else {
          setError('Không tìm thấy thông tin đăng ký');
        }
      } catch (err) {
        setError('Không thể tải thông tin');
      } finally {
        setLoading(false);
      }
    }
    fetchEnrollment();
  }, [params.id]);

  if (loading) return <div className="flex items-center justify-center h-64"><p>Đang tải...</p></div>;
  if (error) return <div className="text-center text-red-500 py-12">{error}</div>;
  if (!enrollment) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{enrollment.courseTitle}</h1>
          <p className="text-muted-foreground">{enrollment.courseDescription}</p>
        </div>
        <Link href={`/learning/my-learning/${params.id}/content`}>
          <Button><PlayCircle className="h-4 w-4 mr-2" />Tiếp tục học</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Tiến độ</p><p className="text-2xl font-bold">{enrollment.progress}%</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Giờ học</p><p className="text-2xl font-bold">{enrollment.completedHours}/{enrollment.totalHours}h</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Trạng thái</p><Badge className="mt-1">{enrollment.status === 'completed' ? 'Hoàn thành' : 'Đang học'}</Badge></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Điểm</p><p className="text-2xl font-bold">{enrollment.grade !== null ? enrollment.grade : '-'}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Nội dung khóa học</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(enrollment.modules || []).map((mod) => (
              <div key={mod.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {mod.completed ? <CheckCircle className="h-5 w-5 text-green-500" /> : <BookOpen className="h-5 w-5 text-muted-foreground" />}
                  <span className={mod.completed ? 'line-through text-muted-foreground' : ''}>{mod.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{mod.duration}h</span>
                  {!mod.completed && (
                    <Link href={`/learning/my-learning/${params.id}/content`}>
                      <Button size="sm" variant="outline">Học</Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
