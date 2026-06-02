'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Plus, Calendar, MapPin, Users, Clock } from 'lucide-react';
import Link from 'next/link';

interface Session {
  id: string;
  courseTitle: string;
  startDate: string;
  endDate: string;
  location: string;
  instructor: string;
  maxParticipants: number;
  enrolledCount: number;
  status: string;
}

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch('/api/learning/admin/sessions');
        if (res.ok) {
          const data = await res.json();
          setSessions(data.data || []);
        }
      } catch (err) {
        setError('Khong the tai danh sach buoi hoc');
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, []);

  const filteredSessions = sessions.filter(s =>
    s.courseTitle.toLowerCase().includes(search.toLowerCase()) ||
    s.instructor.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><p>Dang tai...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quan ly buoi hoc</h1>
          <p className="text-muted-foreground">Lap lich va quan ly cac buoi dao tao</p>
        </div>
        <Link href="/learning/admin/sessions/new">
          <Button><Plus className="h-4 w-4 mr-2" />Tao buoi hoc</Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Tim kiem..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {filteredSessions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Chua co buoi hoc nao duoc lap lich</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => (
            <Link key={session.id} href={`/learning/admin/sessions/${session.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{session.courseTitle}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{session.startDate} - {session.endDate}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{session.location}</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{session.enrolledCount}/{session.maxParticipants}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">GV: {session.instructor}</p>
                    </div>
                    <Badge variant={session.status === 'upcoming' ? 'default' : session.status === 'ongoing' ? 'secondary' : 'outline'}>
                      {session.status === 'upcoming' ? 'Sap dien ra' : session.status === 'ongoing' ? 'Dang dien ra' : 'Da ket thuc'}
                    </Badge>
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
