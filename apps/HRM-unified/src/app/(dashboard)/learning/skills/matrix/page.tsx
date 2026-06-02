'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Grid3X3, Download } from 'lucide-react';

interface SkillMatrixEntry {
  skillName: string;
  category: string;
  employees: { name: string; level: number }[];
}

export default function SkillsMatrixPage() {
  const [matrix, setMatrix] = useState<SkillMatrixEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchMatrix() {
      try {
        const res = await fetch('/api/learning/skills/matrix');
        if (res.ok) {
          const data = await res.json();
          setMatrix(data.data || []);
        }
      } catch (err) {
        setError('Không thể tải ma trận kỹ năng');
      } finally {
        setLoading(false);
      }
    }
    fetchMatrix();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><p>Đang tải...</p></div>;

  const getLevelColor = (level: number) => {
    if (level >= 4) return 'bg-green-500';
    if (level >= 3) return 'bg-blue-500';
    if (level >= 2) return 'bg-yellow-500';
    if (level >= 1) return 'bg-orange-500';
    return 'bg-muted';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ma trận kỹ năng</h1>
          <p className="text-muted-foreground">Tổng quan kỹ năng của đội ngũ</p>
        </div>
        <Button variant="outline"><Download className="h-4 w-4 mr-2" />Xuất báo cáo</Button>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">Chú thích:</span>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-green-500" /><span className="text-xs">Xuất sắc (4-5)</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-blue-500" /><span className="text-xs">Khá (3)</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-yellow-500" /><span className="text-xs">Trung bình (2)</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-orange-500" /><span className="text-xs">Cơ bản (1)</span></div>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {matrix.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Grid3X3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Chưa có dữ liệu ma trận kỹ năng</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Kỹ năng</th>
                  <th className="text-left p-2">Danh mục</th>
                  {(matrix[0]?.employees || []).map((emp, i) => (
                    <th key={i} className="text-center p-2 min-w-[80px]">{emp.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((entry, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2 font-medium">{entry.skillName}</td>
                    <td className="p-2"><Badge variant="secondary" className="text-xs">{entry.category}</Badge></td>
                    {(entry.employees || []).map((emp, j) => (
                      <td key={j} className="text-center p-2">
                        <div className={`w-6 h-6 rounded mx-auto ${getLevelColor(emp.level)} flex items-center justify-center text-white text-xs font-bold`}>
                          {emp.level}
                        </div>
                      </td>
                    ))}
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
