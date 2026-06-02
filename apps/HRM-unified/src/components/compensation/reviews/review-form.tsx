'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { COMPENSATION_CHANGE_TYPE } from '@/lib/compensation/constants';

interface ReviewFormProps { onSubmit: (data: any) => void; currentSalary?: number; }

export function ReviewForm({ onSubmit, currentSalary = 0 }: ReviewFormProps) {
  const [formData, setFormData] = useState({ proposedSalary: currentSalary, changeType: 'MERIT_INCREASE', justification: '' });
  const changePercent = currentSalary > 0 ? ((formData.proposedSalary - currentSalary) / currentSalary * 100) : 0;
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit({ ...formData, changePercent: Number(changePercent.toFixed(2)) }); };
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Đề xuất điều chỉnh lương</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Loại thay đổi</Label>
            <Select value={formData.changeType} onValueChange={(v) => setFormData({ ...formData, changeType: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{Object.entries(COMPENSATION_CHANGE_TYPE).map(([key, val]) => (<SelectItem key={key} value={key}>{val.label}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Lương đề xuất</Label><Input type="number" value={formData.proposedSalary} onChange={(e) => setFormData({ ...formData, proposedSalary: parseInt(e.target.value) || 0 })} /></div>
            <div><Label>% Thay đổi</Label><Input value={`${changePercent.toFixed(1)}%`} disabled /></div>
          </div>
          <div><Label>Lý do</Label><Textarea value={formData.justification} onChange={(e) => setFormData({ ...formData, justification: e.target.value })} /></div>
          <Button type="submit" className="w-full">Gửi đề xuất</Button>
        </form>
      </CardContent>
    </Card>
  );
}
