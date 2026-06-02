'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, AlertTriangle, Calendar, Plus } from 'lucide-react';
import Link from 'next/link';

interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  status: string;
  credentialId: string;
}

export default function CertificationsPage() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCertifications() {
      try {
        const res = await fetch('/api/learning/certifications/my');
        if (res.ok) {
          const data = await res.json();
          setCertifications(data.data || []);
        }
      } catch (err) {
        setError('Không thể tải danh sách chứng chỉ');
      } finally {
        setLoading(false);
      }
    }
    fetchCertifications();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><p>Đang tải...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chứng chỉ của tôi</h1>
          <p className="text-muted-foreground">Quản lý chứng chỉ và giấy phép chuyên môn</p>
        </div>
        <Link href="/learning/certifications/new">
          <Button><Plus className="h-4 w-4 mr-2" />Thêm chứng chỉ</Button>
        </Link>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {certifications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Chưa có chứng chỉ nào được ghi nhận</p>
            <Link href="/learning/certifications/new"><Button variant="outline" className="mt-4">Thêm chứng chỉ mới</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certifications.map((cert) => (
            <Card key={cert.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg"><Award className="h-5 w-5 text-primary" /></div>
                    <div>
                      <h3 className="font-semibold">{cert.name}</h3>
                      <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                      <p className="text-xs text-muted-foreground mt-1">ID: {cert.credentialId}</p>
                    </div>
                  </div>
                  <Badge variant={cert.status === 'active' ? 'default' : cert.status === 'expiring' ? 'secondary' : 'destructive'}>
                    {cert.status === 'active' ? 'Còn hiệu lực' : cert.status === 'expiring' ? 'Sắp hết hạn' : 'Hết hạn'}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Cấp: {cert.issueDate}</span>
                  <span className="flex items-center gap-1">
                    {cert.status === 'expiring' && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
                    Hết hạn: {cert.expiryDate}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
