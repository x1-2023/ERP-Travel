'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GradeFormProps { onSubmit: (data: any) => void; initialData?: any; }

export function GradeForm({ onSubmit, initialData }: GradeFormProps) {
  const [formData, setFormData] = useState({
    code: initialData?.code || '', name: initialData?.name || '', level: initialData?.level || 1,
    minSalary: initialData?.minSalary || 0, midSalary: initialData?.midSalary || 0, maxSalary: initialData?.maxSalary || 0,
  });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit(formData); };
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{initialData ? 'Sửa bậc lương' : 'Thêm bậc lương'}</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Mã bậc</Label><Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} /></div>
            <div><Label>Tên bậc</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
          </div>
          <div><Label>Cấp độ</Label><Input type="number" value={formData.level} onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })} min={1} max={10} /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label>Lương tối thiểu</Label><Input type="number" value={formData.minSalary} onChange={(e) => setFormData({ ...formData, minSalary: parseInt(e.target.value) })} /></div>
            <div><Label>Lương trung bình</Label><Input type="number" value={formData.midSalary} onChange={(e) => setFormData({ ...formData, midSalary: parseInt(e.target.value) })} /></div>
            <div><Label>Lương tối đa</Label><Input type="number" value={formData.maxSalary} onChange={(e) => setFormData({ ...formData, maxSalary: parseInt(e.target.value) })} /></div>
          </div>
          <Button type="submit" className="w-full">{initialData ? 'Cập nhật' : 'Tạo mới'}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
