'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Plus, Route, Edit, Trash2, BookOpen, Users } from 'lucide-react';
import Link from 'next/link';

interface LearningPath {
  id: string;
  title: string;
  description: string;
  courseCount: number;
  enrolledCount: number;
  status: string;
  level: string;
}

export default function AdminPathsPage() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPaths() {
      try {
        const res = await fetch('/api/learning/admin/paths');
        if (res.ok) {
          const data = await res.json();
          setPaths(data.data || []);
        }
      } catch (err) {
        setError('Khong the tai danh sach lo trinh');
      } finally {
        setLoading(false);
      }
    }
    fetchPaths();
  }, []);

  const filteredPaths = paths.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><p>Dang tai...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quan ly lo trinh</h1>
          <p className="text-muted-foreground">Tao va quan ly cac lo trinh hoc tap</p>
        </div>
        <Link href="/learning/admin/paths/new">
          <Button><Plus className="h-4 w-4 mr-2" />Tao lo trinh</Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Tim kiem lo trinh..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {filteredPaths.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Route className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Chua co lo trinh nao</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPaths.map((path) => (
            <Card key={path.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{path.title}</h3>
                      <Badge variant="outline">{path.level}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{path.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{path.courseCount} khoa hoc</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{path.enrolledCount} hoc vien</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={path.status === 'active' ? 'default' : 'secondary'}>
                      {path.status === 'active' ? 'Hoat dong' : 'Nhap'}
                    </Badge>
                    <Button size="sm" variant="outline"><Edit className="h-3 w-3" /></Button>
                    <Button size="sm" variant="outline"><Trash2 className="h-3 w-3 text-red-500" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
