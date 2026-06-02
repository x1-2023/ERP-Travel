'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CreateCoursePage() {
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
    objectives: '',
    prerequisites: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/learning/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          duration: Number(formData.duration),
          maxEnrollment: Number(formData.maxEnrollment),
          objectives: formData.objectives.split('\n').filter(Boolean),
          prerequisites: formData.prerequisites.split('\n').filter(Boolean),
        }),
      });
      if (res.ok) {
        router.push('/learning/admin/courses');
      } else {
        const data = await res.json();
        setError(data.message || 'Khong the tao khoa hoc');
      }
    } catch (err) {
      setError('Loi ket noi, vui long thu lai');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tao khoa hoc moi</h1>
        <p className="text-muted-foreground">Thiet lap thong tin khoa hoc dao tao</p>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Thong tin co ban</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Ten khoa hoc *</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))} placeholder="Nhap ten khoa hoc" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mo ta *</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))} placeholder="Mo ta chi tiet khoa hoc..." rows={4} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Danh muc *</Label>
                <Select value={formData.category} onValueChange={(val) => setFormData(prev => ({...prev, category: val}))}>
                  <SelectTrigger><SelectValue placeholder="Chon danh muc" /></SelectTrigger>
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
                <Label>Loai hinh *</Label>
                <Select value={formData.type} onValueChange={(val) => setFormData(prev => ({...prev, type: val}))}>
                  <SelectTrigger><SelectValue placeholder="Chon loai" /></SelectTrigger>
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
                <Label htmlFor="duration">Thoi luong (gio) *</Label>
                <Input id="duration" type="number" value={formData.duration} onChange={(e) => setFormData(prev => ({...prev, duration: e.target.value}))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxEnrollment">So luong toi da</Label>
                <Input id="maxEnrollment" type="number" value={formData.maxEnrollment} onChange={(e) => setFormData(prev => ({...prev, maxEnrollment: e.target.value}))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider">Nha cung cap</Label>
              <Input id="provider" value={formData.provider} onChange={(e) => setFormData(prev => ({...prev, provider: e.target.value}))} placeholder="Nhap ten nha cung cap" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Muc tieu va dieu kien</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="objectives">Muc tieu khoa hoc (moi dong 1 muc tieu)</Label>
              <Textarea id="objectives" value={formData.objectives} onChange={(e) => setFormData(prev => ({...prev, objectives: e.target.value}))} placeholder="Muc tieu 1\nMuc tieu 2\n..." rows={4} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prerequisites">Dieu kien tien quyet (moi dong 1 dieu kien)</Label>
              <Textarea id="prerequisites" value={formData.prerequisites} onChange={(e) => setFormData(prev => ({...prev, prerequisites: e.target.value}))} placeholder="Dieu kien 1\nDieu kien 2\n..." rows={3} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Huy</Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Dang tao...' : 'Tao khoa hoc'}
          </Button>
        </div>
      </form>
    </div>
  );
}
