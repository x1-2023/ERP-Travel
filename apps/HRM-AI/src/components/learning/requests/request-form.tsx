'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send } from 'lucide-react';

interface RequestFormData {
  title: string;
  description: string;
  courseType: string;
  priority: string;
  estimatedCost: number;
  reason: string;
}

interface RequestFormProps {
  onSubmit: (data: RequestFormData) => void;
  isLoading?: boolean;
}

export function RequestForm({ onSubmit, isLoading = false }: RequestFormProps) {
  const [formData, setFormData] = useState<RequestFormData>({
    title: '',
    description: '',
    courseType: '',
    priority: 'MEDIUM',
    estimatedCost: 0,
    reason: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: keyof RequestFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Yeu cau dao tao moi</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tieu de *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Nhap tieu de yeu cau dao tao"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Mo ta</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Mo ta chi tiet nhu cau dao tao"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Loai khoa hoc</Label>
              <Select value={formData.courseType} onValueChange={(value) => updateField('courseType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chon loai" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ONLINE">Truc tuyen</SelectItem>
                  <SelectItem value="OFFLINE">Truc tiep</SelectItem>
                  <SelectItem value="BLENDED">Ket hop</SelectItem>
                  <SelectItem value="SELF_PACED">Tu hoc</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Muc do uu tien</Label>
              <Select value={formData.priority} onValueChange={(value) => updateField('priority', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chon muc do" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Thap</SelectItem>
                  <SelectItem value="MEDIUM">Trung binh</SelectItem>
                  <SelectItem value="HIGH">Cao</SelectItem>
                  <SelectItem value="URGENT">Khan cap</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="estimatedCost">Chi phi du kien (VND)</Label>
            <Input
              id="estimatedCost"
              type="number"
              value={formData.estimatedCost}
              onChange={(e) => updateField('estimatedCost', Number(e.target.value))}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Ly do yeu cau *</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => updateField('reason', e.target.value)}
              placeholder="Giai thich ly do can dao tao"
              rows={2}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full">
            <Send className="w-4 h-4 mr-2" />
            {isLoading ? 'Dang gui...' : 'Gui yeu cau'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
