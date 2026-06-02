'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface TrainingRequest {
  id: string;
  title: string;
  type: string;
  status: string;
  requestDate: string;
  estimatedCost: number;
  approver: string;
  reason: string;
}

export default function TrainingRequestsPage() {
  const [requests, setRequests] = useState<TrainingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchRequests() {
      try {
        const res = await fetch('/api/learning/requests');
        if (res.ok) {
          const data = await res.json();
          setRequests(data.data || []);
        }
      } catch (err) {
        setError('Khong the tai danh sach yeu cau');
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-green-500">Da duyet</Badge>;
      case 'pending': return <Badge variant="secondary">Cho duyet</Badge>;
      case 'rejected': return <Badge variant="destructive">Tu choi</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><p>Dang tai...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Yeu cau dao tao</h1>
          <p className="text-muted-foreground">Quan ly yeu cau tham gia dao tao</p>
        </div>
        <Link href="/learning/requests/new">
          <Button><Plus className="h-4 w-4 mr-2" />Tao yeu cau moi</Button>
        </Link>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {requests.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Chua co yeu cau dao tao nao</p>
            <Link href="/learning/requests/new"><Button variant="outline" className="mt-4">Tao yeu cau moi</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <Card key={req.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{req.title}</h3>
                    <p className="text-sm text-muted-foreground">{req.reason}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{req.requestDate}</span>
                      <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{req.estimatedCost?.toLocaleString()} VND</span>
                      <span>Nguoi duyet: {req.approver}</span>
                    </div>
                  </div>
                  {getStatusBadge(req.status)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
