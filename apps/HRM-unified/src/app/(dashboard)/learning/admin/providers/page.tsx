'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit, Building2, BookOpen, Star, Globe } from 'lucide-react';

interface Provider {
  id: string;
  name: string;
  type: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  coursesCount: number;
  rating: number;
  status: string;
}

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProviders() {
      try {
        const res = await fetch('/api/learning/admin/providers');
        if (res.ok) {
          const data = await res.json();
          setProviders(data.data || []);
        }
      } catch (err) {
        setError('Khong the tai danh sach nha cung cap');
      } finally {
        setLoading(false);
      }
    }
    fetchProviders();
  }, []);

  const filteredProviders = providers.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><p>Dang tai...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Nha cung cap dao tao</h1>
          <p className="text-muted-foreground">Quan ly doi tac va nha cung cap dich vu dao tao</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Them nha cung cap</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Tim kiem nha cung cap..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {filteredProviders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Chua co nha cung cap nao</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProviders.map((provider) => (
            <Card key={provider.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg"><Building2 className="h-5 w-5 text-primary" /></div>
                    <div>
                      <h3 className="font-semibold">{provider.name}</h3>
                      <Badge variant="secondary" className="text-xs mt-1">{provider.type}</Badge>
                    </div>
                  </div>
                  <Badge variant={provider.status === 'active' ? 'default' : 'outline'}>
                    {provider.status === 'active' ? 'Hoat dong' : 'Ngung'}
                  </Badge>
                </div>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><Globe className="h-3 w-3" />{provider.website || 'Chua co website'}</div>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{provider.coursesCount} khoa hoc</span>
                    <span className="flex items-center gap-1"><Star className="h-3 w-3" />{provider.rating}/5</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t flex justify-end">
                  <Button size="sm" variant="outline"><Edit className="h-3 w-3 mr-1" />Chinh sua</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
