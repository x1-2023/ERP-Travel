'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit, Trash2, BookOpen, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  category: string;
  type: string;
  status: string;
  enrolledCount: number;
  duration: number;
  createdAt: string;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch('/api/learning/admin/courses');
        if (res.ok) {
          const data = await res.json();
          setCourses(data.data || []);
        }
      } catch (err) {
        setError('Khong the tai danh sach khoa hoc');
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><p>Dang tai...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quan ly khoa hoc</h1>
          <p className="text-muted-foreground">Tao va quan ly cac khoa hoc dao tao</p>
        </div>
        <Link href="/learning/admin/courses/new">
          <Button><Plus className="h-4 w-4 mr-2" />Tao khoa hoc</Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Tim kiem khoa hoc..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Chua co khoa hoc nao</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 text-sm font-medium">Khoa hoc</th>
                  <th className="text-left p-4 text-sm font-medium">Danh muc</th>
                  <th className="text-left p-4 text-sm font-medium">Loai</th>
                  <th className="text-left p-4 text-sm font-medium">Trang thai</th>
                  <th className="text-center p-4 text-sm font-medium">Hoc vien</th>
                  <th className="text-center p-4 text-sm font-medium">Thoi luong</th>
                  <th className="text-right p-4 text-sm font-medium">Thao tac</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="border-b hover:bg-muted/30">
                    <td className="p-4 font-medium">{course.title}</td>
                    <td className="p-4"><Badge variant="secondary">{course.category}</Badge></td>
                    <td className="p-4 text-sm">{course.type}</td>
                    <td className="p-4">
                      <Badge variant={course.status === 'active' ? 'default' : 'outline'}>
                        {course.status === 'active' ? 'Hoat dong' : 'Nhap'}
                      </Badge>
                    </td>
                    <td className="p-4 text-center">{course.enrolledCount}</td>
                    <td className="p-4 text-center">{course.duration}h</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/learning/admin/courses/${course.id}/edit`}>
                          <Button size="sm" variant="outline"><Edit className="h-3 w-3" /></Button>
                        </Link>
                        <Button size="sm" variant="outline"><Trash2 className="h-3 w-3 text-red-500" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
