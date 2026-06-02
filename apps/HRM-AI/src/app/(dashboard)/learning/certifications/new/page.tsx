'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award, Upload } from 'lucide-react';

export default function NewCertificationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    issuer: '',
    credentialId: '',
    issueDate: '',
    expiryDate: '',
    category: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/learning/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        router.push('/learning/certifications');
      } else {
        const data = await res.json();
        setError(data.message || 'Không thể thêm chứng chỉ');
      }
    } catch (err) {
      setError('Lỗi kết nối, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Thêm chứng chỉ mới</h1>
        <p className="text-muted-foreground">Ghi nhận chứng chỉ hoặc giấy phép chuyên môn</p>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Thông tin chứng chỉ</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên chứng chỉ *</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))} placeholder="VD: AWS Solutions Architect" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issuer">Tổ chức cấp *</Label>
              <Input id="issuer" value={formData.issuer} onChange={(e) => setFormData(prev => ({...prev, issuer: e.target.value}))} placeholder="VD: Amazon Web Services" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="credentialId">Mã chứng chỉ</Label>
              <Input id="credentialId" value={formData.credentialId} onChange={(e) => setFormData(prev => ({...prev, credentialId: e.target.value}))} placeholder="Nhập mã chứng chỉ" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issueDate">Ngày cấp *</Label>
                <Input id="issueDate" type="date" value={formData.issueDate} onChange={(e) => setFormData(prev => ({...prev, issueDate: e.target.value}))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Ngày hết hạn</Label>
                <Input id="expiryDate" type="date" value={formData.expiryDate} onChange={(e) => setFormData(prev => ({...prev, expiryDate: e.target.value}))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Danh mục</Label>
              <Select value={formData.category} onValueChange={(val) => setFormData(prev => ({...prev, category: val}))}>
                <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Công nghệ</SelectItem>
                  <SelectItem value="management">Quản lý</SelectItem>
                  <SelectItem value="language">Ngoại ngữ</SelectItem>
                  <SelectItem value="safety">An toàn lao động</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Tài liệu đính kèm</CardTitle></CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
              <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Kéo thả hoặc click để tải lên bản scan chứng chỉ</p>
              <p className="text-xs mt-1">PDF, JPG, PNG (tối đa 5MB)</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Huỷ</Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Đang lưu...' : 'Lưu chứng chỉ'}
          </Button>
        </div>
      </form>
    </div>
  );
}
