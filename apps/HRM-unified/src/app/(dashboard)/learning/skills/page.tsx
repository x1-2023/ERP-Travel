'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Star } from 'lucide-react';
import Link from 'next/link';

interface Skill {
  id: string;
  name: string;
  category: string;
  currentLevel: number;
  targetLevel: number;
  assessedDate: string;
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchSkills() {
      try {
        const res = await fetch('/api/learning/skills/my');
        if (res.ok) {
          const data = await res.json();
          setSkills(data.data || []);
        }
      } catch (err) {
        setError('Không thể tải danh sách kỹ năng');
      } finally {
        setLoading(false);
      }
    }
    fetchSkills();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><p>Đang tải...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kỹ năng của tôi</h1>
          <p className="text-muted-foreground">Đánh giá và theo dõi phát triển kỹ năng</p>
        </div>
        <Link href="/learning/skills/matrix">
          <Button variant="outline">Ma trận kỹ năng</Button>
        </Link>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {skills.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Chưa có đánh giá kỹ năng nào</p>
            <p className="text-sm mt-2">Liên hệ quản lý để bắt đầu đánh giá kỹ năng</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skills.map((skill) => (
            <Card key={skill.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{skill.name}</h3>
                    <Badge variant="secondary" className="text-xs mt-1">{skill.category}</Badge>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < skill.currentLevel ? 'text-yellow-500 fill-yellow-500' : 'text-muted'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Mục tiêu: {skill.targetLevel}/5</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Cấp độ: {skill.currentLevel}/{skill.targetLevel}</span>
                  <span>Đánh giá: {skill.assessedDate}</span>
                </div>
                <div className="mt-2 w-full bg-muted rounded-full h-2">
                  <div className="bg-primary rounded-full h-2" style={{ width: `${(skill.currentLevel / skill.targetLevel) * 100}%` }} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
