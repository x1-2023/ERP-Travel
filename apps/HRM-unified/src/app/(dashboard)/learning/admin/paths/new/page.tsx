'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';

export default function CreatePathPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: '',
    category: '',
  });
  const [courses, setCourses] = useState<string[]>([]);
  const [newCourse, setNewCourse] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const addCourse = () => {
    if (newCourse.trim()) {
      setCourses(prev => [...prev, newCourse.trim()]);
      setNewCourse('');
    }
  };

  const removeCourse = (index: number) => {
    setCourses(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/learning/admin/paths', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, courseIds: courses }),
      });
      if (res.ok) {
        router.push('/learning/admin/paths');
      } else {
        const data = await res.json();
        setError(data.message || 'Khong the tao lo trinh');
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
        <h1 className="text-2xl font-bold">Tao lo trinh hoc tap</h1>
        <p className="text-muted-foreground">Thiet ke lo trinh phat trien ky nang</p>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Thong tin lo trinh</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Ten lo trinh *</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))} placeholder="VD: Full-stack Developer" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mo ta</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))} placeholder="Mo ta lo trinh hoc tap..." rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                <Label>Danh muc</Label>
                <Select value={formData.category} onValueChange={(val) => setFormData(prev => ({...prev, category: val}))}>
                  <SelectTrigger><SelectValue placeholder="Chon" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Cong nghe</SelectItem>
                    <SelectItem value="management">Quan ly</SelectItem>
                    <SelectItem value="soft-skills">Ky nang mem</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Khoa hoc trong lo trinh</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={newCourse} onChange={(e) => setNewCourse(e.target.value)} placeholder="Nhap ID hoac ten khoa hoc" />
              <Button type="button" onClick={addCourse} variant="outline"><Plus className="h-4 w-4" /></Button>
            </div>
            {courses.length > 0 && (
              <div className="space-y-2">
                {courses.map((course, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{i + 1}</span>
                      <span className="text-sm">{course}</span>
                    </div>
                    <Button type="button" size="sm" variant="ghost" onClick={() => removeCourse(i)}><X className="h-3 w-3" /></Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Huy</Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Dang tao...' : 'Tao lo trinh'}
          </Button>
        </div>
      </form>
    </div>
  );
}
