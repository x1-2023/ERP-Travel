'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Star, BookOpen, CheckCircle, Calendar } from 'lucide-react';
import Link from 'next/link';

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  level: string;
  rating: number;
  enrolledCount: number;
  provider: string;
  type: string;
  objectives: string[];
  prerequisites: string[];
  modules: { title: string; duration: number }[];
  upcomingSessions: { id: string; startDate: string; location: string }[];
}

export default function CourseDetailPage() {
  const params = useParams();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await fetch(`/api/learning/courses/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setCourse(data.data || data);
        } else {
          setError('Không tìm thấy khóa học');
        }
      } catch (err) {
        setError('Không thể tải thông tin khóa học');
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [params.id]);

  if (loading) return <div className="flex items-center justify-center h-64"><p>Đang tải...</p></div>;
  if (error) return <div className="text-center text-red-500 py-12">{error}</div>;
  if (!course) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">{course.category}</Badge>
            <Badge variant="outline">{course.level}</Badge>
            <Badge>{course.type}</Badge>
          </div>
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground mt-1">{course.provider}</p>
        </div>
        <Link href={`/learning/courses/${params.id}/enroll`}>
          <Button size="lg">Đăng ký khóa học</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Mô tả</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">{course.description}</p></CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Mục tiêu khóa học</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {(course.objectives || []).map((obj, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">{obj}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Nội dung khóa học</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(course.modules || []).map((mod, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{mod.title}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{mod.duration}h</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2"><Clock className="h-4 w-4" /><span className="text-sm">Thời lượng: {course.duration} giờ</span></div>
              <div className="flex items-center gap-2"><Users className="h-4 w-4" /><span className="text-sm">{course.enrolledCount} học viên</span></div>
              <div className="flex items-center gap-2"><Star className="h-4 w-4" /><span className="text-sm">Đánh giá: {course.rating}/5</span></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Lịch khai giảng</CardTitle></CardHeader>
            <CardContent>
              {(course.upcomingSessions || []).length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có lịch</p>
              ) : (
                <div className="space-y-2">
                  {course.upcomingSessions.map((session) => (
                    <div key={session.id} className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3 w-3" />
                      <span>{session.startDate} - {session.location}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
