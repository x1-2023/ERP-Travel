'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/ui/alert';
import {
  AlertTriangle,
  Plus,
  LayoutDashboard,
  Pencil,
  Trash2,
  Eye,
} from 'lucide-react';

interface Dashboard {
  id: string;
  name: string;
  description: string;
  widgetCount: number;
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
}

export default function DashboardsListPage() {
  const router = useRouter();
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboards();
  }, []);

  async function fetchDashboards() {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/dashboards');
      if (!response.ok) throw new Error('Không thể tải dữ liệu');
      const result = await response.json();
      setDashboards(result.data || result.dashboards || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bạn có chắc muốn xóa dashboard này?')) return;

    try {
      setDeletingId(id);
      const response = await fetch(`/api/analytics/dashboards/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Không thể xóa dashboard');
      setDashboards((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xóa');
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard tùy chỉnh</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-48 mb-4" />
              <Skeleton className="h-8 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard tùy chỉnh</h1>
        <Button onClick={() => router.push('/analytics/dashboards/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo mới
        </Button>
      </div>

      {dashboards.length === 0 ? (
        <Card className="p-8 text-center">
          <LayoutDashboard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Chưa có dashboard nào</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Tạo dashboard tùy chỉnh để theo dõi các chỉ số quan trọng
          </p>
          <Button onClick={() => router.push('/analytics/dashboards/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo dashboard đầu tiên
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboards.map((dashboard) => (
            <Card key={dashboard.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold">{dashboard.name}</h3>
                  {dashboard.isDefault && (
                    <Badge variant="secondary" className="mt-1">
                      Mặc định
                    </Badge>
                  )}
                </div>
                <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {dashboard.description || 'Không có mô tả'}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span>{dashboard.widgetCount} widget</span>
                <span>Cập nhật: {new Date(dashboard.updatedAt).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => router.push(`/analytics/dashboards/${dashboard.id}`)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Xem
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/analytics/dashboards/${dashboard.id}?edit=true`)}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(dashboard.id)}
                  disabled={deletingId === dashboard.id}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
