'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, CheckCircle, BookOpen, Video, FileText } from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  type: string;
  content: string;
  duration: number;
  completed: boolean;
  order: number;
}

export default function ContentViewerPage() {
  const params = useParams();
  const router = useRouter();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchContent() {
      try {
        const res = await fetch(`/api/learning/enrollments/${params.id}/content`);
        if (res.ok) {
          const data = await res.json();
          setItems(data.data || []);
        }
      } catch (err) {
        setError('Không thể tải nội dung');
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, [params.id]);

  const currentItem = items[currentIndex];

  const markComplete = async () => {
    if (!currentItem) return;
    try {
      await fetch(`/api/learning/enrollments/${params.id}/content/${currentItem.id}/complete`, {
        method: 'POST',
      });
      setItems(prev => prev.map((item, i) => i === currentIndex ? { ...item, completed: true } : item));
    } catch (err) {
      console.error('Failed to mark complete');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><p>Đang tải...</p></div>;
  if (error) return <div className="text-center text-red-500 py-12">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4 mr-1" />Quay lại
        </Button>
        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} / {items.length}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader><CardTitle className="text-sm">Mục lục</CardTitle></CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1">
                {items.map((item, i) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer text-sm ${i === currentIndex ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
                    onClick={() => setCurrentIndex(i)}
                  >
                    {item.completed ? <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" /> :
                      item.type === 'video' ? <Video className="h-3 w-3 flex-shrink-0" /> :
                      <FileText className="h-3 w-3 flex-shrink-0" />}
                    <span className="truncate">{item.title}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {currentItem ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{currentItem.title}</CardTitle>
                  <Badge variant="outline">{currentItem.type === 'video' ? 'Video' : 'Tài liệu'}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="min-h-[400px] border rounded-lg p-6 bg-muted/30">
                  <p className="text-muted-foreground">{currentItem.content || 'Nội dung khóa học sẽ được hiển thị ở đây'}</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <Button variant="outline" disabled={currentIndex === 0} onClick={() => setCurrentIndex(prev => prev - 1)}>
                    <ChevronLeft className="h-4 w-4 mr-1" />Trước
                  </Button>
                  <div className="flex gap-2">
                    {!currentItem.completed && (
                      <Button variant="secondary" onClick={markComplete}>
                        <CheckCircle className="h-4 w-4 mr-1" />Hoàn thành
                      </Button>
                    )}
                    <Button disabled={currentIndex === items.length - 1} onClick={() => setCurrentIndex(prev => prev + 1)}>
                      Tiếp<ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Không có nội dung</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
