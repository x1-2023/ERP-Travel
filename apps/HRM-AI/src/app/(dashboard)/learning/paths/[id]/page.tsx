'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, CheckCircle, ArrowRight, Users } from 'lucide-react';
import Link from 'next/link';

interface PathDetail {
  id: string;
  title: string;
  description: string;
  level: string;
  totalHours: number;
  enrolledCount: number;
  courses: { id: string; title: string; duration: number; order: number; required: boolean }[];
}

export default function PathDetailPage() {
  const params = useParams();
  const [path, setPath] = useState<PathDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPath() {
      try {
        const res = await fetch(`/api/learning/paths/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setPath(data.data || data);
        } else {
          setError('Không tìm thấy lộ trình');
        }
      } catch (err) {
        setError('Không thể tải thông tin lộ trình');
      } finally {
        setLoading(false);
      }
    }
    fetchPath();
  }, [params.id]);

  if (loading) return <div className="flex items-center justify-center h-64"><p>Đang tải...</p></div>;
  if (error) return <div className="text-center text-red-500 py-12">{error}</div>;
  if (!path) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Badge variant="outline" className="mb-2">{path.level}</Badge>
          <h1 className="text-2xl font-bold">{path.title}</h1>
          <p className="text-muted-foreground mt-1">{path.description}</p>
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{path.totalHours}h</span>
            <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" />{(path.courses || []).length} khóa học</span>
            <span className="flex items-center gap-1"><Users className="h-4 w-4" />{path.enrolledCount} học viên</span>
          </div>
        </div>
        <Button size="lg">Đăng ký lộ trình</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Các khóa học trong lộ trình</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(path.courses || []).map((course, i) => (
              <div key={course.id}>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{i + 1}</div>
                    <div>
                      <h3 className="font-medium">{course.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />{course.duration}h
                        {course.required && <Badge variant="secondary" className="text-xs">Bắt buộc</Badge>}
                      </div>
                    </div>
                  </div>
                  <Link href={`/learning/courses/${course.id}`}>
                    <Button size="sm" variant="outline">Chi tiết<ArrowRight className="h-3 w-3 ml-1" /></Button>
                  </Link>
                </div>
                {i < (path.courses || []).length - 1 && (
                  <div className="flex justify-center py-1"><div className="w-px h-4 bg-border" /></div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
