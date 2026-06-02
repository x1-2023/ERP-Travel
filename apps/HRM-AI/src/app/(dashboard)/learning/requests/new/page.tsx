'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function NewTrainingRequestPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    provider: '',
    startDate: '',
    endDate: '',
    estimatedCost: '',
    reason: '',
    objectives: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/learning/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          estimatedCost: Number(formData.estimatedCost),
        }),
      });
      if (res.ok) {
        router.push('/learning/requests');
      } else {
        const data = await res.json();
        setError(data.message || 'Khong the tao yeu cau');
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
        <h1 className="text-2xl font-bold">Tao yeu cau dao tao</h1>
        <p className="text-muted-foreground">Gui yeu cau tham gia khoa dao tao</p>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Thong tin khoa hoc</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Ten khoa hoc / chuong trinh *</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))} placeholder="Nhap ten khoa hoc" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Loai hinh</Label>
              <Select value={formData.type} onValueChange={(val) => setFormData(prev => ({...prev, type: val}))}>
                <SelectTrigger><SelectValue placeholder="Chon loai hinh" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Noi bo</SelectItem>
                  <SelectItem value="external">Ben ngoai</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="conference">Hoi nghi / Hoi thao</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider">Nha cung cap / Don vi dao tao</Label>
              <Input id="provider" value={formData.provider} onChange={(e) => setFormData(prev => ({...prev, provider: e.target.value}))} placeholder="Nhap ten don vi dao tao" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Ngay bat dau</Label>
                <Input id="startDate" type="date" value={formData.startDate} onChange={(e) => setFormData(prev => ({...prev, startDate: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Ngay ket thuc</Label>
                <Input id="endDate" type="date" value={formData.endDate} onChange={(e) => setFormData(prev => ({...prev, endDate: e.target.value}))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedCost">Chi phi du kien (VND)</Label>
              <Input id="estimatedCost" type="number" value={formData.estimatedCost} onChange={(e) => setFormData(prev => ({...prev, estimatedCost: e.target.value}))} placeholder="0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Ly do va muc tieu</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Ly do yeu cau *</Label>
              <Textarea id="reason" value={formData.reason} onChange={(e) => setFormData(prev => ({...prev, reason: e.target.value}))} placeholder="Mo ta ly do can tham gia khoa hoc nay..." rows={3} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="objectives">Muc tieu dat duoc</Label>
              <Textarea id="objectives" value={formData.objectives} onChange={(e) => setFormData(prev => ({...prev, objectives: e.target.value}))} placeholder="Nhung ky nang / kien thuc mong muon dat duoc..." rows={3} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Huy</Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Dang gui...' : 'Gui yeu cau'}
          </Button>
        </div>
      </form>
    </div>
  );
}
