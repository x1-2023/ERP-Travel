'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

interface TrainingSession {
  id: string;
  title: string;
  startDate: string;
  endDate?: string;
  location?: string;
  instructor?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  status?: string;
  sessionType?: string;
}

interface SessionCardProps {
  session: TrainingSession;
  onRegister?: (sessionId: string) => void;
}

export function SessionCard({ session, onRegister }: SessionCardProps) {
  const isFull = session.maxParticipants && session.currentParticipants
    ? session.currentParticipants >= session.maxParticipants
    : false;
  const isPast = new Date(session.startDate) < new Date();

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          {session.sessionType && <Badge variant="outline" className="text-xs">{session.sessionType}</Badge>}
          {isPast && <Badge variant="secondary" className="text-xs">Da ket thuc</Badge>}
          {isFull && !isPast && <Badge variant="destructive" className="text-xs">Da day</Badge>}
        </div>
        <h3 className="font-semibold text-sm mb-2 line-clamp-2">{session.title}</h3>
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3 shrink-0" />
            <span>{new Date(session.startDate).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 shrink-0" />
            <span>{new Date(session.startDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          {session.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{session.location}</span>
            </div>
          )}
          {session.maxParticipants && (
            <div className="flex items-center gap-2">
              <Users className="w-3 h-3 shrink-0" />
              <span>{session.currentParticipants || 0}/{session.maxParticipants} hoc vien</span>
            </div>
          )}
        </div>
        {session.instructor && (
          <p className="text-xs text-muted-foreground mt-2">Giang vien: {session.instructor}</p>
        )}
      </CardContent>
      {onRegister && !isPast && !isFull && (
        <CardFooter className="p-4 pt-0">
          <Button variant="outline" size="sm" className="w-full" onClick={() => onRegister(session.id)}>
            Dang ky tham gia
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
