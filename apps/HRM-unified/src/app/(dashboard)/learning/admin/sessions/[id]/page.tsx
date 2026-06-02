'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock, User, CheckCircle, XCircle } from 'lucide-react';

interface SessionDetail {
  id: string;
  courseTitle: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  instructor: string;
  maxParticipants: number;
  status: string;
  participants: { id: string; name: string; department: string; status: string }[];
}

export default function SessionDetailPage() {
  const params = useParams();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch(`/api/learning/admin/sessions/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setSession(data.data || data);
        } else {
          setError('Khong tim thay buoi hoc');
        }
      } catch (err) {
        setError('Khong the tai thong tin');
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, [params.id]);

  if (loading) return <div className="flex items-center justify-center h-64"><p>Dang tai...</p></div>;
  if (error) return <div className="text-center text-red-500 py-12">{error}</div>;
  if (!session) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{session.courseTitle}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{session.startDate} - {session.endDate}</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{session.startTime} - {session.endTime}</span>
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{session.location}</span>
          </div>
        </div>
        <Badge variant={session.status === 'upcoming' ? 'default' : 'secondary'}>
          {session.status === 'upcoming' ? 'Sap dien ra' : session.status === 'ongoing' ? 'Dang dien ra' : 'Da ket thuc'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Giang vien</p><p className="font-semibold">{session.instructor}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Hoc vien</p><p className="font-semibold">{(session.participants || []).length}/{session.maxParticipants}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Dia diem</p><p className="font-semibold">{session.location}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sach hoc vien</CardTitle>
            <Button size="sm" variant="outline">Xuat danh sach</Button>
          </div>
        </CardHeader>
        <CardContent>
          {(session.participants || []).length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Chua co hoc vien dang ky</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Ho ten</th>
                  <th className="text-left p-3">Phong ban</th>
                  <th className="text-center p-3">Trang thai</th>
                  <th className="text-right p-3">Thao tac</th>
                </tr>
              </thead>
              <tbody>
                {session.participants.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="p-3 flex items-center gap-2"><User className="h-4 w-4" />{p.name}</td>
                    <td className="p-3">{p.department}</td>
                    <td className="p-3 text-center">
                      <Badge variant={p.status === 'confirmed' ? 'default' : 'outline'}>
                        {p.status === 'confirmed' ? 'Xac nhan' : 'Cho'}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost"><CheckCircle className="h-4 w-4 text-green-500" /></Button>
                        <Button size="sm" variant="ghost"><XCircle className="h-4 w-4 text-red-500" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
