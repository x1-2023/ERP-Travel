'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, MapPin, CheckCircle } from 'lucide-react';

interface Session {
  id: string;
  startDate: string;
  endDate: string;
  location: string;
  availableSlots: number;
  instructor: string;
}

export default function CourseEnrollPage() {
  const params = useParams();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch(`/api/learning/courses/${params.id}/sessions`);
        if (res.ok) {
          const data = await res.json();
          setSessions(data.data || []);
        }
      } catch (err) {
        setError('Không thể tải danh sách lịch học');
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, [params.id]);

  const handleEnroll = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/learning/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: params.id,
          sessionId: selectedSession || undefined,
          reason,
        }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/learning/my-learning'), 2000);
      } else {
        const data = await res.json();
        setError(data.message || 'Đăng ký thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><p>Đang tải...</p></div>;

  if (success) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Đăng ký thành công!</h2>
            <p className="text-muted-foreground">Yêu cầu của bạn đang được xử lý</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Đăng ký khóa học</h1>
        <p className="text-muted-foreground">Chọn lịch học và hoàn tất đăng ký</p>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <Card>
        <CardHeader><CardTitle>Chọn buổi học</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Khóa học online - không cần chọn lịch cụ thể</p>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedSession === session.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                  onClick={() => setSelectedSession(session.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm"><Calendar className="h-3 w-3" />{session.startDate} - {session.endDate}</div>
                      <div className="flex items-center gap-2 text-sm"><MapPin className="h-3 w-3" />{session.location}</div>
                      <div className="flex items-center gap-2 text-sm"><Clock className="h-3 w-3" />GV: {session.instructor}</div>
                    </div>
                    <Badge variant="secondary">{session.availableSlots} chỗ trống</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Lý do đăng ký</CardTitle></CardHeader>
        <CardContent>
          <Label htmlFor="reason">Mô tả lý do bạn muốn tham gia khóa học này</Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nhập lý do..."
            className="mt-2"
            rows={4}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()}>Huỷ</Button>
        <Button onClick={handleEnroll} disabled={submitting}>
          {submitting ? 'Đang xử lý...' : 'Xác nhận đăng ký'}
        </Button>
      </div>
    </div>
  );
}
