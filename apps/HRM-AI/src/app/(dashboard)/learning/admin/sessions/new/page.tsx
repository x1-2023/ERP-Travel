'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CreateSessionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    courseId: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    location: '',
    instructor: '',
    maxParticipants: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/learning/admin/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          maxParticipants: Number(formData.maxParticipants),
        }),
      });
      if (res.ok) {
        router.push('/learning/admin/sessions');
      } else {
        const data = await res.json();
        setError(data.message || 'Khong the tao buoi hoc');
      }
    } catch (err) {
      setError('Loi ket noi, vui long thu lai');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tao buoi hoc moi</h1>
        <p className="text-muted-foreground">Lap lich cho buoi dao tao</p>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Thong tin buoi hoc</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="courseId">Khoa hoc *</Label>
              <Input id="courseId" value={formData.courseId} onChange={(e) => setFormData(prev => ({...prev, courseId: e.target.value}))} placeholder="Chon khoa hoc" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Ngay bat dau *</Label>
                <Input id="startDate" type="date" value={formData.startDate} onChange={(e) => setFormData(prev => ({...prev, startDate: e.target.value}))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Ngay ket thuc *</Label>
                <Input id="endDate" type="date" value={formData.endDate} onChange={(e) => setFormData(prev => ({...prev, endDate: e.target.value}))} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Gio bat dau</Label>
                <Input id="startTime" type="time" value={formData.startTime} onChange={(e) => setFormData(prev => ({...prev, startTime: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Gio ket thuc</Label>
                <Input id="endTime" type="time" value={formData.endTime} onChange={(e) => setFormData(prev => ({...prev, endTime: e.target.value}))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Dia diem *</Label>
              <Input id="location" value={formData.location} onChange={(e) => setFormData(prev => ({...prev, location: e.target.value}))} placeholder="Phong hop / Link online" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructor">Giang vien *</Label>
              <Input id="instructor" value={formData.instructor} onChange={(e) => setFormData(prev => ({...prev, instructor: e.target.value}))} placeholder="Ten giang vien" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">So luong toi da</Label>
              <Input id="maxParticipants" type="number" value={formData.maxParticipants} onChange={(e) => setFormData(prev => ({...prev, maxParticipants: e.target.value}))} placeholder="30" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Huy</Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Dang tao...' : 'Tao buoi hoc'}
          </Button>
        </div>
      </form>
    </div>
  );
}
