'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Calendar, AlertTriangle } from 'lucide-react';

interface CertificationCardProps {
  certification: {
    id: string;
    name: string;
    issuingOrganization?: string;
    issueDate?: string;
    expiryDate?: string;
    status?: string;
    credentialId?: string;
  };
}

export function CertificationCard({ certification }: CertificationCardProps) {
  const isExpired = certification.expiryDate && new Date(certification.expiryDate) < new Date();
  const isExpiringSoon = certification.expiryDate && !isExpired &&
    new Date(certification.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-sm line-clamp-2">{certification.name}</h3>
              {isExpired && <Badge variant="destructive" className="text-xs shrink-0">Het han</Badge>}
              {isExpiringSoon && <Badge variant="secondary" className="text-xs shrink-0">Sap het han</Badge>}
              {!isExpired && !isExpiringSoon && certification.status === 'ACTIVE' && (
                <Badge variant="default" className="text-xs shrink-0">Con hieu luc</Badge>
              )}
            </div>
            {certification.issuingOrganization && (
              <p className="text-xs text-muted-foreground mt-1">{certification.issuingOrganization}</p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              {certification.issueDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Cap: {new Date(certification.issueDate).toLocaleDateString('vi-VN')}
                </span>
              )}
              {certification.expiryDate && (
                <span className="flex items-center gap-1">
                  {isExpiringSoon && <AlertTriangle className="w-3 h-3 text-yellow-500" />}
                  Het han: {new Date(certification.expiryDate).toLocaleDateString('vi-VN')}
                </span>
              )}
            </div>
            {certification.credentialId && (
              <p className="text-xs text-muted-foreground mt-1">ID: {certification.credentialId}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
