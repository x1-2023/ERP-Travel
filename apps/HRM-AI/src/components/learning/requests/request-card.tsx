'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, User } from 'lucide-react';

interface TrainingRequest {
  id: string;
  title: string;
  description?: string;
  requestedBy?: string;
  requestDate: string;
  estimatedCost?: number;
  status: string;
  priority?: string;
  reason?: string;
}

interface RequestCardProps {
  request: TrainingRequest;
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING: 'secondary',
  APPROVED: 'default',
  REJECTED: 'destructive',
  CANCELLED: 'outline',
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Cho duyet',
  APPROVED: 'Da duyet',
  REJECTED: 'Tu choi',
  CANCELLED: 'Da huy',
};

export function RequestCard({ request }: RequestCardProps) {
  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant={STATUS_VARIANT[request.status] || 'outline'} className="text-xs">
            {STATUS_LABEL[request.status] || request.status}
          </Badge>
          {request.priority && (
            <Badge variant="outline" className="text-xs">{request.priority}</Badge>
          )}
        </div>
        <h3 className="font-semibold text-sm mb-1 line-clamp-2">{request.title}</h3>
        {request.description && (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{request.description}</p>
        )}
        <div className="space-y-1 text-xs text-muted-foreground">
          {request.requestedBy && (
            <div className="flex items-center gap-2">
              <User className="w-3 h-3" />
              <span>{request.requestedBy}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            <span>{new Date(request.requestDate).toLocaleDateString('vi-VN')}</span>
          </div>
          {request.estimatedCost !== undefined && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-3 h-3" />
              <span>{request.estimatedCost.toLocaleString('vi-VN')} VND</span>
            </div>
          )}
        </div>
        {request.reason && (
          <p className="text-xs text-muted-foreground mt-2 italic">Ly do: {request.reason}</p>
        )}
      </CardContent>
    </Card>
  );
}
