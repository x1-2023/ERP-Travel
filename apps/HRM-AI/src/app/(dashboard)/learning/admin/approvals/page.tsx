'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, User, DollarSign, Calendar, FileText } from 'lucide-react';

interface ApprovalRequest {
  id: string;
  employeeName: string;
  department: string;
  courseTitle: string;
  type: string;
  requestDate: string;
  estimatedCost: number;
  reason: string;
  status: string;
}

export default function AdminApprovalsPage() {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchApprovals() {
      try {
        const res = await fetch('/api/learning/admin/approvals');
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
    fetchApprovals();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/learning/admin/approvals/${id}/approve`, { method: 'POST' });
      if (res.ok) {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
      }
    } catch (err) {
      console.error('Approval failed');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`/api/learning/admin/approvals/${id}/reject`, { method: 'POST' });
      if (res.ok) {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
      }
    } catch (err) {
      console.error('Rejection failed');
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  if (loading) return <div className="flex items-center justify-center h-64"><p>Dang tai...</p></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Duyet yeu cau dao tao</h1>
        <p className="text-muted-foreground">Xem xet va phe duyet cac yeu cau dao tao</p>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-sm">{pendingRequests.length} cho duyet</Badge>
        <Badge variant="outline" className="text-sm">{processedRequests.length} da xu ly</Badge>
      </div>

      {pendingRequests.length === 0 && processedRequests.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Khong co yeu cau nao can xu ly</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {pendingRequests.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Cho phe duyet</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{req.courseTitle}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><User className="h-3 w-3" />{req.employeeName} - {req.department}</span>
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{req.requestDate}</span>
                          <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{req.estimatedCost?.toLocaleString()} VND</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{req.reason}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleReject(req.id)}>
                          <XCircle className="h-4 w-4 mr-1 text-red-500" />Tu choi
                        </Button>
                        <Button size="sm" onClick={() => handleApprove(req.id)}>
                          <CheckCircle className="h-4 w-4 mr-1" />Duyet
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {processedRequests.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Da xu ly</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {processedRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{req.courseTitle}</p>
                      <p className="text-xs text-muted-foreground">{req.employeeName} - {req.requestDate}</p>
                    </div>
                    <Badge variant={req.status === 'approved' ? 'default' : 'destructive'}>
                      {req.status === 'approved' ? 'Da duyet' : 'Tu choi'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
