'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit, Award, Users } from 'lucide-react';

interface CertificationType {
  id: string;
  name: string;
  issuer: string;
  category: string;
  validityMonths: number;
  requiredForRoles: string[];
  holdersCount: number;
}

export default function AdminCertificationsPage() {
  const [certTypes, setCertTypes] = useState<CertificationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCertTypes() {
      try {
        const res = await fetch('/api/learning/admin/certifications');
        if (res.ok) {
          const data = await res.json();
          setCertTypes(data.data || []);
        }
      } catch (err) {
        setError('Khong the tai danh sach loai chung chi');
      } finally {
        setLoading(false);
      }
    }
    fetchCertTypes();
  }, []);

  const filteredTypes = certTypes.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><p>Dang tai...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quan ly loai chung chi</h1>
          <p className="text-muted-foreground">Dinh nghia cac loai chung chi va yeu cau</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Them loai chung chi</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Tim kiem..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {filteredTypes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Chua co loai chung chi nao</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTypes.map((cert) => (
            <Card key={cert.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{cert.name}</h3>
                    <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">{cert.category}</Badge>
                      <span className="text-xs text-muted-foreground">Hieu luc: {cert.validityMonths} thang</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                      <Users className="h-3 w-3" />{cert.holdersCount} nguoi so huu
                    </div>
                  </div>
                  <Button size="sm" variant="outline"><Edit className="h-3 w-3" /></Button>
                </div>
                {(cert.requiredForRoles || []).length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground mb-1">Bat buoc cho:</p>
                    <div className="flex flex-wrap gap-1">
                      {cert.requiredForRoles.map((role, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{role}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
