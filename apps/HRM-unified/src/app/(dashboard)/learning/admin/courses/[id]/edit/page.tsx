'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: '',
    level: '',
    duration: '',
    provider: '',
    maxEnrollment: '',
    status: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await fetch(`/api/learning/admin/courses/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          const course = data.data || data;
          setFormData({
            title: course.title || '',
            description: course.description || '',
            category: course.category || '',
            type: course.type || '',
            level: course.level || '',
            duration: String(course.duration || ''),
            provider: course.provider || '',
            maxEnrollment: String(course.maxEnrollment || ''),
            status: course.status || '',
          });
        } else {
          setError('Khong tim thay khoa hoc');
        }
      } catch (err) {
        setError('Khong the tai thong tin khoa hoc');
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/learning/admin/courses/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          duration: Number(formData.duration),
          maxEnrollment: Number(formData.maxEnrollment),
        }),
      });
      if (res.ok) {
        router.push('/learning/admin/courses');
      } else {
        const data = await res.json();
        setError(data.message || 'Khong the cap nhat khoa hoc');
      }
    } catch (err) {
      setError('Loi ket noi, vui long thu lai');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><p>Dang tai...</p></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Chinh sua khoa hoc</h1>
        <p className="text-muted-foreground">Cap nhat thong tin khoa hoc</p>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Thong tin co ban</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Ten khoa hoc *</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mo ta</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))} rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Danh muc</Label>
                <Select value={formData.category} onValueChange={(val) => setFormData(prev => ({...prev, category: val}))}>
                  <SelectTrigger><SelectValue placeholder="Chon" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Cong nghe</SelectItem>
                    <SelectItem value="management">Quan ly</SelectItem>
                    <SelectItem value="soft-skills">Ky nang mem</SelectItem>
                    <SelectItem value="compliance">Tuan thu</SelectItem>
                    <SelectItem value="safety">An toan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Loai hinh</Label>
                <Select value={formData.type} onValueChange={(val) => setFormData(prev => ({...prev, type: val}))}>
                  <SelectTrigger><SelectValue placeholder="Chon" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="classroom">Lop hoc</SelectItem>
                    <SelectItem value="blended">Ket hop</SelectItem>
                    <SelectItem value="self-paced">Tu hoc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Cap do</Label>
                <Select value={formData.level} onValueChange={(val) => setFormData(prev => ({...prev, level: val}))}>
                  <SelectTrigger><SelectValue placeholder="Chon" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Co ban</SelectItem>
                    <SelectItem value="intermediate">Trung cap</SelectItem>
                    <SelectItem value="advanced">Nang cao</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Thoi luong (gio)</Label>
                <Input id="duration" type="number" value={formData.duration} onChange={(e) => setFormData(prev => ({...prev, duration: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label>Trang thai</Label>
                <Select value={formData.status} onValueChange={(val) => setFormData(prev => ({...prev, status: val}))}>
                  <SelectTrigger><SelectValue placeholder="Chon" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Nhap</SelectItem>
                    <SelectItem value="active">Hoat dong</SelectItem>
                    <SelectItem value="archived">Luu tru</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider">Nha cung cap</Label>
              <Input id="provider" value={formData.provider} onChange={(e) => setFormData(prev => ({...prev, provider: e.target.value}))} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Huy</Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Dang luu...' : 'Luu thay doi'}
          </Button>
        </div>
      </form>
    </div>
  );
}
