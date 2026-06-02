'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';

interface TrainingEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: string;
  instructor: string;
}

export default function TrainingCalendarPage() {
  const [events, setEvents] = useState<TrainingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchEvents() {
      try {
        const month = currentMonth.getMonth() + 1;
        const year = currentMonth.getFullYear();
        const res = await fetch(`/api/learning/calendar?month=${month}&year=${year}`);
        if (res.ok) {
          const data = await res.json();
          setEvents(data.data || []);
        }
      } catch (err) {
        setError('Khong the tai lich dao tao');
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [currentMonth]);

  const prevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const monthName = currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

  if (loading) return <div className="flex items-center justify-center h-64"><p>Dang tai...</p></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Lich dao tao</h1>
        <p className="text-muted-foreground">Xem lich cac buoi dao tao sap toi</p>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
        <h2 className="text-lg font-semibold capitalize">{monthName}</h2>
        <Button variant="outline" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {events.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Khong co su kien dao tao nao trong thang nay</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-xs text-muted-foreground">{new Date(event.date).toLocaleDateString('vi-VN', { weekday: 'short' })}</span>
                    <span className="text-lg font-bold text-primary">{new Date(event.date).getDate()}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{event.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">GV: {event.instructor}</p>
                  </div>
                  <Badge variant="outline">{event.type === 'online' ? 'Online' : 'Truc tiep'}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
