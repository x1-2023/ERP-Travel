'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit, Trash2, Target } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  levelsCount: number;
  assessedEmployees: number;
}

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', category: '', description: '' });

  useEffect(() => {
    async function fetchSkills() {
      try {
        const res = await fetch('/api/learning/admin/skills');
        if (res.ok) {
          const data = await res.json();
          setSkills(data.data || []);
        }
      } catch (err) {
        setError('Khong the tai danh sach ky nang');
      } finally {
        setLoading(false);
      }
    }
    fetchSkills();
  }, []);

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/learning/admin/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSkill),
      });
      if (res.ok) {
        const data = await res.json();
        setSkills(prev => [...prev, data.data]);
        setShowForm(false);
        setNewSkill({ name: '', category: '', description: '' });
      }
    } catch (err) {
      setError('Khong the tao ky nang');
    }
  };

  const filteredSkills = skills.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><p>Dang tai...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quan ly ky nang</h1>
          <p className="text-muted-foreground">Dinh nghia va quan ly khung ky nang</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-2" />Them ky nang</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <Input placeholder="Ten ky nang *" value={newSkill.name} onChange={(e) => setNewSkill(prev => ({...prev, name: e.target.value}))} />
              <Input placeholder="Danh muc *" value={newSkill.category} onChange={(e) => setNewSkill(prev => ({...prev, category: e.target.value}))} />
              <Input placeholder="Mo ta" value={newSkill.description} onChange={(e) => setNewSkill(prev => ({...prev, description: e.target.value}))} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Huy</Button>
              <Button onClick={handleCreate}>Luu</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Tim kiem ky nang..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {filteredSkills.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Chua co ky nang nao duoc dinh nghia</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 text-sm font-medium">Ky nang</th>
                  <th className="text-left p-4 text-sm font-medium">Danh muc</th>
                  <th className="text-left p-4 text-sm font-medium">Mo ta</th>
                  <th className="text-center p-4 text-sm font-medium">Nhan vien danh gia</th>
                  <th className="text-right p-4 text-sm font-medium">Thao tac</th>
                </tr>
              </thead>
              <tbody>
                {filteredSkills.map((skill) => (
                  <tr key={skill.id} className="border-b hover:bg-muted/30">
                    <td className="p-4 font-medium">{skill.name}</td>
                    <td className="p-4"><Badge variant="secondary">{skill.category}</Badge></td>
                    <td className="p-4 text-sm text-muted-foreground">{skill.description}</td>
                    <td className="p-4 text-center">{skill.assessedEmployees}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline"><Edit className="h-3 w-3" /></Button>
                        <Button size="sm" variant="outline"><Trash2 className="h-3 w-3 text-red-500" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
