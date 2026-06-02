'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Route, BookOpen, Clock, Users } from 'lucide-react';
import Link from 'next/link';

interface LearningPath {
  id: string;
  title: string;
  description: string;
  courseCount: number;
  totalHours: number;
  enrolledCount: number;
  level: string;
  category: string;
}

export default function LearningPathsPage() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPaths() {
      try {
        const res = await fetch('/api/learning/paths');
        if (res.ok) {
          const data = await res.json();
          setPaths(data.data || []);
        }
      } catch (err) {
        setError('Không thể tải danh sách lộ trình');
      } finally {
        setLoading(false);
      }
    }
    fetchPaths();
  }, []);

  const filteredPaths = paths.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><p>Đang tải...</p></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Lộ trình học tập</h1>
        <p className="text-muted-foreground">Các lộ trình phát triển kỹ năng có cấu trúc</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Tìm lộ trình..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {filteredPaths.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Route className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Chưa có lộ trình học tập nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPaths.map((path) => (
            <Link key={path.id} href={`/learning/paths/${path.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{path.category}</Badge>
                    <Badge variant="outline">{path.level}</Badge>
                  </div>
                  <CardTitle className="text-lg mt-2">{path.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{path.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{path.courseCount} khóa học</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{path.totalHours}h</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{path.enrolledCount}</span>
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
