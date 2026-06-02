'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface CalendarSession {
  id: string;
  title: string;
  startDate: string;
  endDate?: string;
  sessionType?: string;
}

interface SessionCalendarProps {
  sessions: CalendarSession[];
  onSessionClick?: (session: CalendarSession) => void;
}

export function SessionCalendar({ sessions, onSessionClick }: SessionCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = currentDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getSessionsForDay = (day: number) => {
    return sessions.filter((session) => {
      const sessionDate = new Date(session.startDate);
      return sessionDate.getFullYear() === year && sessionDate.getMonth() === month && sessionDate.getDate() === day;
    });
  };

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={'empty-' + i} className="h-20" />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const daySessions = getSessionsForDay(day);
    const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
    days.push(
      <div
        key={day}
        className={cn('h-20 border rounded-sm p-1 text-xs', isToday && 'border-primary bg-primary/5')}
      >
        <span className={cn('font-medium', isToday && 'text-primary')}>{day}</span>
        <div className="mt-0.5 space-y-0.5">
          {daySessions.slice(0, 2).map((session) => (
            <div
              key={session.id}
              className="bg-primary/10 text-primary rounded px-1 py-0.5 truncate cursor-pointer hover:bg-primary/20"
              onClick={() => onSessionClick?.(session)}
            >
              {session.title}
            </div>
          ))}
          {daySessions.length > 2 && (
            <span className="text-muted-foreground">+{daySessions.length - 2} khac</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Lich dao tao
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">{monthName}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((d) => (
            <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </CardContent>
    </Card>
  );
}
