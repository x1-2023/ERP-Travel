'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock } from 'lucide-react';

interface Certification {
  id: string;
  name: string;
  expiryDate: string;
  employeeName?: string;
}

interface ExpiryAlertProps {
  certifications: Certification[];
  daysThreshold?: number;
}

export function ExpiryAlert({ certifications, daysThreshold = 30 }: ExpiryAlertProps) {
  const now = new Date();
  const threshold = new Date(now.getTime() + daysThreshold * 24 * 60 * 60 * 1000);

  const expiring = certifications.filter((cert) => {
    const expiry = new Date(cert.expiryDate);
    return expiry <= threshold && expiry >= now;
  });

  const expired = certifications.filter((cert) => {
    return new Date(cert.expiryDate) < now;
  });

  if (expiring.length === 0 && expired.length === 0) return null;

  return (
    <Card className="border-yellow-200 bg-yellow-50/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <h3 className="font-semibold text-sm">Canh bao chung chi</h3>
        </div>
        {expired.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-red-600 mb-1">Da het han ({expired.length})</p>
            <div className="space-y-1">
              {expired.map((cert) => (
                <div key={cert.id} className="flex items-center justify-between text-xs">
                  <span className="truncate">{cert.name}</span>
                  <Badge variant="destructive" className="text-xs shrink-0 ml-2">
                    {new Date(cert.expiryDate).toLocaleDateString('vi-VN')}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
        {expiring.length > 0 && (
          <div>
            <p className="text-xs font-medium text-yellow-700 mb-1">Sap het han ({expiring.length})</p>
            <div className="space-y-1">
              {expiring.map((cert) => {
                const daysLeft = Math.ceil((new Date(cert.expiryDate).getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
                return (
                  <div key={cert.id} className="flex items-center justify-between text-xs">
                    <span className="truncate">{cert.name}</span>
                    <span className="flex items-center gap-1 text-yellow-700 shrink-0 ml-2">
                      <Clock className="w-3 h-3" />{daysLeft} ngay
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
